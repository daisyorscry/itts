package service

import (
	"context"

	"be-itts-community/internal/model"
)

type LearningQuizService interface {
	CreateQuiz(ctx context.Context, req model.CreateQuizRequest) (model.QuizResponse, error)
	GetQuiz(ctx context.Context, id string) (model.QuizResponse, error)
	UpdateQuiz(ctx context.Context, id string, req model.UpdateQuizRequest) (model.QuizResponse, error)
	DeleteQuiz(ctx context.Context, id string) error
	SubmitQuizAttempt(ctx context.Context, authCtx *model.AuthContext, req model.SubmitQuizAttemptRequest) (model.QuizAttemptResponse, error)
}
