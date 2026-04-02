package service

import (
	"context"
	"errors"
	"sort"
	"strings"
	"time"

	"github.com/daisyorscry/itts/core"
	"gorm.io/gorm"

	"be-itts-community/internal/model"
	"be-itts-community/pkg/validator"
)

func (s *learningService) CreateQuiz(ctx context.Context, req model.CreateQuizRequest) (model.QuizResponse, error) {
	req.LessonID = strings.TrimSpace(req.LessonID)
	req.Title = strings.TrimSpace(req.Title)
	req.Description = strings.TrimSpace(req.Description)
	if err := validator.Validate(req); err != nil {
		return model.QuizResponse{}, core.ValidationError(err)
	}
	if err := validateQuizQuestions(req.Questions); err != nil {
		return model.QuizResponse{}, err
	}
	lesson, err := s.catalogRepo.GetLessonByID(ctx, req.LessonID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.QuizResponse{}, core.NotFound("lesson", req.LessonID)
		}
		return model.QuizResponse{}, core.InternalServerError("failed to fetch lesson").WithError(err)
	}
	if lesson.LessonType != model.LessonTypeQuiz {
		return model.QuizResponse{}, core.ValidationError(errors.New("lesson_type must be quiz before attaching a quiz"))
	}
	if _, err := s.quizRepo.GetQuizByLessonID(ctx, req.LessonID); err == nil {
		return model.QuizResponse{}, core.Conflict("Quiz already exists for lesson")
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return model.QuizResponse{}, core.InternalServerError("failed to check quiz").WithError(err)
	}

	quiz := model.Quiz{
		LessonID:         req.LessonID,
		Title:            req.Title,
		Description:      learningServiceNilIfEmpty(req.Description),
		PassScore:        req.PassScore,
		TimeLimitMinutes: req.TimeLimitMinutes,
		MaxAttempts:      req.MaxAttempts,
		IsActive:         req.IsActive,
	}
	if err := s.quizRepo.RunInTransaction(ctx, func(tx context.Context) error {
		if err := s.quizRepo.CreateQuiz(tx, &quiz); err != nil {
			return err
		}
		return s.replaceQuizQuestions(tx, quiz.ID, req.Questions)
	}); err != nil {
		return model.QuizResponse{}, core.InternalServerError("failed to create quiz").WithError(err)
	}

	created, err := s.quizRepo.GetQuizByID(ctx, quiz.ID)
	if err != nil {
		return model.QuizResponse{}, core.InternalServerError("failed to load quiz").WithError(err)
	}
	return model.QuizToResponse(*created), nil
}

func (s *learningService) GetQuiz(ctx context.Context, id string) (model.QuizResponse, error) {
	quiz, err := s.quizRepo.GetQuizByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.QuizResponse{}, core.NotFound("quiz", id)
		}
		return model.QuizResponse{}, core.InternalServerError("failed to fetch quiz").WithError(err)
	}
	return model.QuizToResponse(*quiz), nil
}

func (s *learningService) UpdateQuiz(ctx context.Context, id string, req model.UpdateQuizRequest) (model.QuizResponse, error) {
	if req.Title != nil {
		v := strings.TrimSpace(*req.Title)
		req.Title = &v
	}
	if req.Description != nil {
		v := strings.TrimSpace(*req.Description)
		req.Description = &v
	}
	if err := validator.Validate(req); err != nil {
		return model.QuizResponse{}, core.ValidationError(err)
	}
	if req.Questions != nil {
		if err := validateQuizQuestions(req.Questions); err != nil {
			return model.QuizResponse{}, err
		}
	}
	quiz, err := s.quizRepo.GetQuizByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.QuizResponse{}, core.NotFound("quiz", id)
		}
		return model.QuizResponse{}, core.InternalServerError("failed to fetch quiz").WithError(err)
	}
	if req.Title != nil {
		quiz.Title = *req.Title
	}
	if req.Description != nil {
		quiz.Description = learningServiceNilIfEmpty(*req.Description)
	}
	if req.PassScore != nil {
		quiz.PassScore = *req.PassScore
	}
	if req.TimeLimitMinutes != nil {
		quiz.TimeLimitMinutes = req.TimeLimitMinutes
	}
	if req.MaxAttempts != nil {
		quiz.MaxAttempts = req.MaxAttempts
	}
	if req.IsActive != nil {
		quiz.IsActive = *req.IsActive
	}
	if err := s.quizRepo.RunInTransaction(ctx, func(tx context.Context) error {
		if err := s.quizRepo.UpdateQuiz(tx, quiz); err != nil {
			return err
		}
		if req.Questions != nil {
			if err := s.quizRepo.DeleteQuizQuestions(tx, quiz.ID); err != nil {
				return err
			}
			if err := s.replaceQuizQuestions(tx, quiz.ID, req.Questions); err != nil {
				return err
			}
		}
		return nil
	}); err != nil {
		return model.QuizResponse{}, core.InternalServerError("failed to update quiz").WithError(err)
	}

	updated, err := s.quizRepo.GetQuizByID(ctx, quiz.ID)
	if err != nil {
		return model.QuizResponse{}, core.InternalServerError("failed to load quiz").WithError(err)
	}
	return model.QuizToResponse(*updated), nil
}

func (s *learningService) DeleteQuiz(ctx context.Context, id string) error {
	if _, err := s.quizRepo.GetQuizByID(ctx, id); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return core.NotFound("quiz", id)
		}
		return core.InternalServerError("failed to fetch quiz").WithError(err)
	}
	if err := s.quizRepo.DeleteQuiz(ctx, id); err != nil {
		return core.InternalServerError("failed to delete quiz").WithError(err)
	}
	return nil
}

func (s *learningService) SubmitQuizAttempt(ctx context.Context, authCtx *model.AuthContext, req model.SubmitQuizAttemptRequest) (model.QuizAttemptResponse, error) {
	if authCtx == nil || authCtx.UserID == "" {
		return model.QuizAttemptResponse{}, core.Unauthorized("authentication required")
	}
	req.QuizID = strings.TrimSpace(req.QuizID)
	if err := validator.Validate(req); err != nil {
		return model.QuizAttemptResponse{}, core.ValidationError(err)
	}
	quiz, err := s.quizRepo.GetQuizByID(ctx, req.QuizID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.QuizAttemptResponse{}, core.NotFound("quiz", req.QuizID)
		}
		return model.QuizAttemptResponse{}, core.InternalServerError("failed to fetch quiz").WithError(err)
	}
	if !quiz.IsActive {
		return model.QuizAttemptResponse{}, core.Forbidden("Quiz is not active")
	}
	lesson, err := s.catalogRepo.GetLessonByID(ctx, quiz.LessonID)
	if err != nil {
		return model.QuizAttemptResponse{}, core.InternalServerError("failed to fetch lesson").WithError(err)
	}
	if err := s.ensureLessonAccessible(ctx, authCtx.UserID, lesson); err != nil {
		return model.QuizAttemptResponse{}, err
	}
	enrollment, err := s.enrollmentRepo.GetEnrollmentByCourseUser(ctx, lesson.CourseID, authCtx.UserID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.QuizAttemptResponse{}, core.Forbidden("Enroll in course first")
		}
		return model.QuizAttemptResponse{}, core.InternalServerError("failed to fetch enrollment").WithError(err)
	}
	if quiz.MaxAttempts != nil {
		attempts, err := s.quizRepo.CountQuizAttemptsByUser(ctx, quiz.ID, authCtx.UserID)
		if err != nil {
			return model.QuizAttemptResponse{}, core.InternalServerError("failed to count attempts").WithError(err)
		}
		if attempts >= int64(*quiz.MaxAttempts) {
			return model.QuizAttemptResponse{}, core.Forbidden("Maximum attempts reached")
		}
	}

	answerMap, err := validateQuizSubmission(quiz, req)
	if err != nil {
		return model.QuizAttemptResponse{}, err
	}

	now := time.Now()
	attempt := model.QuizAttempt{
		QuizID:      quiz.ID,
		UserID:      authCtx.UserID,
		Status:      model.QuizAttemptStatusGraded,
		StartedAt:   now,
		SubmittedAt: &now,
		GradedAt:    &now,
	}
	totalPoints := 0
	earnedPoints := 0
	answerRows := make([]model.QuizAttemptAnswer, 0, len(quiz.Questions))

	for _, question := range quiz.Questions {
		totalPoints += question.Points
		submitted := answerMap[question.ID]
		row := model.QuizAttemptAnswer{
			QuestionID:        question.ID,
			SelectedOptionIDs: model.UUIDArray(submitted.SelectedOptionIDs),
			AnswerText:        learningServiceNilIfEmpty(submitted.AnswerText),
		}
		switch question.QuestionType {
		case model.QuizQuestionTypeShortAnswer:
			isCorrect := false
			points := 0
			row.IsCorrect = &isCorrect
			row.AwardedPoints = &points
		default:
			correctIDs := make([]string, 0)
			for _, option := range question.Options {
				if option.IsCorrect {
					correctIDs = append(correctIDs, option.ID)
				}
			}
			selected := append([]string(nil), submitted.SelectedOptionIDs...)
			sort.Strings(selected)
			sort.Strings(correctIDs)
			isCorrect := equalStringSlices(selected, correctIDs)
			points := 0
			if isCorrect {
				points = question.Points
				earnedPoints += points
			}
			row.IsCorrect = &isCorrect
			row.AwardedPoints = &points
		}
		answerRows = append(answerRows, row)
	}

	score := 0
	if totalPoints > 0 {
		score = int((float64(earnedPoints) / float64(totalPoints)) * 100)
	}
	passed := score >= quiz.PassScore
	attempt.Score = &score
	attempt.Passed = &passed

	if err := s.quizRepo.RunInTransaction(ctx, func(tx context.Context) error {
		if err := s.quizRepo.CreateQuizAttempt(tx, &attempt); err != nil {
			return err
		}
		for i := range answerRows {
			answerRows[i].AttemptID = attempt.ID
			if err := s.quizRepo.CreateQuizAttemptAnswer(tx, &answerRows[i]); err != nil {
				return err
			}
		}
		if passed {
			if err := s.completeLessonAndIssueCertificate(tx, enrollment, lesson.CourseID, lesson.ID, authCtx.UserID, now, "quiz_pass"); err != nil {
				return err
			}
		}
		return nil
	}); err != nil {
		return model.QuizAttemptResponse{}, core.InternalServerError("failed to submit quiz").WithError(err)
	}

	attempt.Answers = answerRows
	return model.QuizAttemptToResponse(attempt), nil
}

func (s *learningService) replaceQuizQuestions(ctx context.Context, quizID string, questions []model.CreateQuizQuestionRequest) error {
	for _, questionReq := range questions {
		question := model.QuizQuestion{
			QuizID:       quizID,
			QuestionText: strings.TrimSpace(questionReq.QuestionText),
			QuestionType: questionReq.QuestionType,
			Explanation:  learningServiceNilIfEmpty(strings.TrimSpace(questionReq.Explanation)),
			Points:       questionReq.Points,
			SortOrder:    questionReq.SortOrder,
		}
		if err := s.quizRepo.CreateQuizQuestion(ctx, &question); err != nil {
			return err
		}
		for _, optionReq := range questionReq.Options {
			option := model.QuizOption{
				QuestionID: question.ID,
				OptionText: strings.TrimSpace(optionReq.OptionText),
				IsCorrect:  optionReq.IsCorrect,
				SortOrder:  optionReq.SortOrder,
			}
			if err := s.quizRepo.CreateQuizOption(ctx, &option); err != nil {
				return err
			}
		}
	}
	return nil
}
