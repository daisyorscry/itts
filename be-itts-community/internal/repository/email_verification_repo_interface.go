package repository

import (
	"context"
	"time"

	"be-itts-community/internal/db"
	"be-itts-community/internal/model"
)

type EmailVerificationRepository interface {
	RunInTransaction(ctx context.Context, f func(tx context.Context) error) error

	Create(ctx context.Context, ev *model.EmailVerification) error
	FindValidByHash(ctx context.Context, tokenHash string) (*model.EmailVerification, error)
	MarkUsed(ctx context.Context, id string, usedAt time.Time) error
}

type emailVerificationRepo struct{ db db.Connection }

func NewEmailVerificationRepository(db db.Connection) EmailVerificationRepository {
	return &emailVerificationRepo{db: db}
}
