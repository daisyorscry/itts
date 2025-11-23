package repository

import (
	"context"
	"time"

	"gorm.io/gorm"

	"be-itts-community/model"
)

type EmailVerificationRepository interface {
	Create(ctx context.Context, ev *model.EmailVerification) error
	FindValidByHash(ctx context.Context, tokenHash string) (*model.EmailVerification, error)
	MarkUsed(ctx context.Context, id string, usedAt time.Time) error
}

type emailVerificationRepo struct{ db *gorm.DB }

func NewEmailVerificationRepository(gdb *gorm.DB) EmailVerificationRepository {
	return &emailVerificationRepo{db: gdb}
}

func (r *emailVerificationRepo) Create(ctx context.Context, ev *model.EmailVerification) error {
	return r.db.WithContext(ctx).Create(ev).Error
}

func (r *emailVerificationRepo) FindValidByHash(ctx context.Context, tokenHash string) (*model.EmailVerification, error) {
	var out model.EmailVerification
	if err := r.db.WithContext(ctx).
		Where("token_hash = ? AND used_at IS NULL AND expires_at > now()", tokenHash).
		First(&out).Error; err != nil {
		return nil, err
	}
	return &out, nil
}

func (r *emailVerificationRepo) MarkUsed(ctx context.Context, id string, usedAt time.Time) error {
	return r.db.WithContext(ctx).
		Model(&model.EmailVerification{}).
		Where("id = ?", id).
		Update("used_at", usedAt).Error
}
