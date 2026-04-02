package service

import (
	"context"
	"fmt"
	"slices"
	"sort"
	"strings"

	"github.com/daisyorscry/itts/core"

	"be-itts-community/internal/model"
)

func normalizeStringIDs(ids []string) []string {
	seen := make(map[string]struct{}, len(ids))
	out := make([]string, 0, len(ids))
	for _, id := range ids {
		id = strings.TrimSpace(id)
		if id == "" {
			continue
		}
		if _, exists := seen[id]; exists {
			continue
		}
		seen[id] = struct{}{}
		out = append(out, id)
	}
	sort.Strings(out)
	return out
}

func validateQuizQuestions(questions []model.CreateQuizQuestionRequest) error {
	if len(questions) == 0 {
		return core.ValidationError(fmt.Errorf("quiz must contain at least one question"))
	}

	for idx, question := range questions {
		switch question.QuestionType {
		case model.QuizQuestionTypeShortAnswer:
			if len(question.Options) > 0 {
				return core.ValidationError(fmt.Errorf("question %d: short_answer questions cannot define options", idx+1))
			}
		case model.QuizQuestionTypeSingleChoice:
			if len(question.Options) < 2 {
				return core.ValidationError(fmt.Errorf("question %d: single_choice questions require at least two options", idx+1))
			}
			correctCount := 0
			for _, option := range question.Options {
				if option.IsCorrect {
					correctCount++
				}
			}
			if correctCount != 1 {
				return core.ValidationError(fmt.Errorf("question %d: single_choice questions require exactly one correct option", idx+1))
			}
		case model.QuizQuestionTypeMultipleChoice:
			if len(question.Options) < 2 {
				return core.ValidationError(fmt.Errorf("question %d: multiple_choice questions require at least two options", idx+1))
			}
			correctCount := 0
			for _, option := range question.Options {
				if option.IsCorrect {
					correctCount++
				}
			}
			if correctCount == 0 {
				return core.ValidationError(fmt.Errorf("question %d: multiple_choice questions require at least one correct option", idx+1))
			}
		default:
			return core.ValidationError(fmt.Errorf("question %d: unsupported question type", idx+1))
		}
	}

	return nil
}

func validateQuizSubmission(quiz *model.Quiz, req model.SubmitQuizAttemptRequest) (map[string]model.SubmitQuizAnswerRequest, error) {
	answerMap := make(map[string]model.SubmitQuizAnswerRequest, len(req.Answers))
	for _, answer := range req.Answers {
		answer.QuestionID = strings.TrimSpace(answer.QuestionID)
		answer.AnswerText = strings.TrimSpace(answer.AnswerText)
		answer.SelectedOptionIDs = normalizeStringIDs(answer.SelectedOptionIDs)
		answerMap[answer.QuestionID] = answer
	}

	for _, question := range quiz.Questions {
		answer, exists := answerMap[question.ID]
		if !exists {
			return nil, core.ValidationError(fmt.Errorf("missing answer for question %s", question.ID))
		}
		allowedOptionIDs := make([]string, 0, len(question.Options))
		for _, option := range question.Options {
			allowedOptionIDs = append(allowedOptionIDs, option.ID)
		}

		switch question.QuestionType {
		case model.QuizQuestionTypeShortAnswer:
			if answer.AnswerText == "" {
				return nil, core.ValidationError(fmt.Errorf("question %s requires answer_text", question.ID))
			}
			if len(answer.SelectedOptionIDs) > 0 {
				return nil, core.ValidationError(fmt.Errorf("question %s does not accept selected_option_ids", question.ID))
			}
		case model.QuizQuestionTypeSingleChoice:
			if len(answer.SelectedOptionIDs) != 1 {
				return nil, core.ValidationError(fmt.Errorf("question %s requires exactly one selected option", question.ID))
			}
			if !slices.Contains(allowedOptionIDs, answer.SelectedOptionIDs[0]) {
				return nil, core.ValidationError(fmt.Errorf("question %s contains invalid selected option", question.ID))
			}
		case model.QuizQuestionTypeMultipleChoice:
			if len(answer.SelectedOptionIDs) == 0 {
				return nil, core.ValidationError(fmt.Errorf("question %s requires at least one selected option", question.ID))
			}
			for _, optionID := range answer.SelectedOptionIDs {
				if !slices.Contains(allowedOptionIDs, optionID) {
					return nil, core.ValidationError(fmt.Errorf("question %s contains invalid selected option", question.ID))
				}
			}
		}
	}

	return answerMap, nil
}

func (s *learningService) validateLessonPrerequisites(ctx context.Context, courseID, lessonID string, prerequisiteLessonIDs []string) ([]string, error) {
	prerequisiteLessonIDs = normalizeStringIDs(prerequisiteLessonIDs)
	if len(prerequisiteLessonIDs) == 0 {
		return prerequisiteLessonIDs, nil
	}

	if lessonID != "" && slices.Contains(prerequisiteLessonIDs, lessonID) {
		return nil, core.ValidationError(fmt.Errorf("lesson cannot depend on itself"))
	}

	lessons, err := s.catalogRepo.GetLessonsByIDs(ctx, prerequisiteLessonIDs)
	if err != nil {
		return nil, core.InternalServerError("failed to validate prerequisite lessons").WithError(err)
	}
	if len(lessons) != len(prerequisiteLessonIDs) {
		return nil, core.ValidationError(fmt.Errorf("one or more prerequisite lessons were not found"))
	}
	for _, lesson := range lessons {
		if lesson.CourseID != courseID {
			return nil, core.ValidationError(fmt.Errorf("prerequisite lessons must belong to the same course"))
		}
	}

	return prerequisiteLessonIDs, nil
}

func (s *learningService) ensureLessonAccessible(ctx context.Context, userID string, lesson *model.Lesson) error {
	if lesson == nil || len(lesson.Prerequisites) == 0 {
		return nil
	}

	prerequisiteIDs := make([]string, 0, len(lesson.Prerequisites))
	for _, prerequisite := range lesson.Prerequisites {
		prerequisiteIDs = append(prerequisiteIDs, prerequisite.PrerequisiteLessonID)
	}

	completedCount, err := s.enrollmentRepo.CountCompletedLessonsByIDs(ctx, userID, prerequisiteIDs)
	if err != nil {
		return core.InternalServerError("failed to validate lesson access").WithError(err)
	}
	if completedCount != int64(len(prerequisiteIDs)) {
		return core.Forbidden("Complete prerequisite lessons before accessing this lesson")
	}
	return nil
}
