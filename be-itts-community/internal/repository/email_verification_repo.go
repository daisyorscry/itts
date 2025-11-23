package repository

import (
	"context"
	"time"

	"be-itts-community/internal/model"
)

func (r *emailVerificationRepo) RunInTransaction(ctx context.Context, f func(tx context.Context) error) error {
	return r.db.Run(ctx, f)
}

func (r *emailVerificationRepo) Create(ctx context.Context, ev *model.EmailVerification) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "email_verifications", "Create")()
	}
	return r.db.Get(ctx).Create(ev).Error
}

func (r *emailVerificationRepo) FindValidByHash(ctx context.Context, tokenHash string) (*model.EmailVerification, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "email_verifications", "FindValidByHash")()
	}
	var out model.EmailVerification
	if err := r.db.Get(ctx).
		Where("token_hash = ? AND used_at IS NULL AND expires_at > now()", tokenHash).
		First(&out).Error; err != nil {
		return nil, err
	}
	return &out, nil
}

func (r *emailVerificationRepo) MarkUsed(ctx context.Context, id string, usedAt time.Time) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "email_verifications", "MarkUsed")()
	}
	return r.db.Get(ctx).
		Model(&model.EmailVerification{}).
		Where("id = ?", id).
		Update("used_at", usedAt).Error
}
