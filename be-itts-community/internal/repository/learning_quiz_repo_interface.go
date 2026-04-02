package repository

import (
	"context"

	"be-itts-community/internal/model"
)

type LearningQuizRepository interface {
	RunInTransaction(ctx context.Context, f func(tx context.Context) error) error
	CreateQuiz(ctx context.Context, quiz *model.Quiz) error
	CreateQuizQuestion(ctx context.Context, question *model.QuizQuestion) error
	CreateQuizOption(ctx context.Context, option *model.QuizOption) error
	GetQuizByID(ctx context.Context, id string) (*model.Quiz, error)
	GetQuizByLessonID(ctx context.Context, lessonID string) (*model.Quiz, error)
	UpdateQuiz(ctx context.Context, quiz *model.Quiz) error
	DeleteQuiz(ctx context.Context, id string) error
	DeleteQuizQuestions(ctx context.Context, quizID string) error
	CreateQuizAttempt(ctx context.Context, attempt *model.QuizAttempt) error
	CreateQuizAttemptAnswer(ctx context.Context, answer *model.QuizAttemptAnswer) error
	CountQuizAttemptsByUser(ctx context.Context, quizID, userID string) (int64, error)
}
