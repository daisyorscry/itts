package service

import (
	"context"
	"strings"
	"testing"

	"be-itts-community/internal/model"
)

func TestLearningServiceEndToEndFlowWithPrerequisiteAndCertificate(t *testing.T) {
	repo := &fakeLearningRepo{
		course: &model.Course{
			ID:     "course-1",
			Slug:   "go-path",
			Title:  "Go Path",
			Status: model.CourseStatusPublished,
		},
		lessonsByID: map[string]*model.Lesson{
			"lesson-1": {
				ID:          "lesson-1",
				CourseID:    "course-1",
				SectionID:   "section-1",
				Title:       "Introduction",
				LessonType:  model.LessonTypeArticle,
				IsPublished: true,
			},
			"lesson-2": {
				ID:          "lesson-2",
				CourseID:    "course-1",
				SectionID:   "section-1",
				Title:       "Final Quiz",
				LessonType:  model.LessonTypeQuiz,
				IsPublished: true,
				Prerequisites: []model.LessonPrerequisite{
					{LessonID: "lesson-2", PrerequisiteLessonID: "lesson-1"},
				},
			},
		},
		lessonProgressByLesson: map[string]*model.LessonProgress{},
		quiz: &model.Quiz{
			ID:        "quiz-1",
			LessonID:  "lesson-2",
			PassScore: 70,
			IsActive:  true,
			Questions: []model.QuizQuestion{
				{
					ID:           "question-1",
					QuestionType: model.QuizQuestionTypeSingleChoice,
					Points:       10,
					Options: []model.QuizOption{
						{ID: "opt-correct", IsCorrect: true},
						{ID: "opt-wrong", IsCorrect: false},
					},
				},
			},
		},
	}
	svc := NewLearningService(repo, repo, repo, repo, repo, repo, nil)
	authCtx := &model.AuthContext{UserID: "user-1"}

	enrollmentResp, err := svc.EnrollCourse(context.Background(), authCtx, model.EnrollCourseRequest{CourseID: "course-1"})
	if err != nil {
		t.Fatalf("enroll course: %v", err)
	}
	if enrollmentResp.Status != model.EnrollmentStatusActive {
		t.Fatalf("expected active enrollment, got %s", enrollmentResp.Status)
	}

	_, err = svc.SubmitQuizAttempt(context.Background(), authCtx, model.SubmitQuizAttemptRequest{
		QuizID: "quiz-1",
		Answers: []model.SubmitQuizAnswerRequest{
			{QuestionID: "question-1", SelectedOptionIDs: []string{"opt-correct"}},
		},
	})
	if err == nil || !strings.Contains(err.Error(), "Complete prerequisite lessons") {
		t.Fatalf("expected prerequisite failure, got %v", err)
	}

	progressResp, err := svc.UpdateLessonProgress(context.Background(), authCtx, "lesson-1", model.UpdateLessonProgressRequest{
		LastPositionSeconds: 60,
		TimeSpentSeconds:    120,
		IsCompleted:         true,
	})
	if err != nil {
		t.Fatalf("complete prerequisite lesson: %v", err)
	}
	if progressResp.ProgressPercent != 50 {
		t.Fatalf("expected progress 50 after first lesson, got %v", progressResp.ProgressPercent)
	}

	quizResp, err := svc.SubmitQuizAttempt(context.Background(), authCtx, model.SubmitQuizAttemptRequest{
		QuizID: "quiz-1",
		Answers: []model.SubmitQuizAnswerRequest{
			{QuestionID: "question-1", SelectedOptionIDs: []string{"opt-correct"}},
		},
	})
	if err != nil {
		t.Fatalf("submit final quiz: %v", err)
	}
	if quizResp.Passed == nil || !*quizResp.Passed {
		t.Fatalf("expected passed quiz, got %#v", quizResp)
	}
	if repo.updatedEnrollment == nil || repo.updatedEnrollment.Status != model.EnrollmentStatusCompleted {
		t.Fatalf("expected completed enrollment, got %#v", repo.updatedEnrollment)
	}
	if repo.updatedEnrollment.ProgressPercent != 100 {
		t.Fatalf("expected progress 100, got %v", repo.updatedEnrollment.ProgressPercent)
	}
	if repo.createdCertificate == nil {
		t.Fatal("expected certificate to be issued")
	}
	if repo.lessonProgressByLesson["lesson-2"] == nil || !repo.lessonProgressByLesson["lesson-2"].IsCompleted {
		t.Fatalf("expected final lesson to be completed, got %#v", repo.lessonProgressByLesson["lesson-2"])
	}
}
