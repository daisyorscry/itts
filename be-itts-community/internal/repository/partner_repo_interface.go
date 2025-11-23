package repository

import (
	"context"

	"be-itts-community/internal/db"
	"be-itts-community/internal/model"
)

type PartnerRepository interface {
	RunInTransaction(ctx context.Context, f func(tx context.Context) error) error

	Create(ctx context.Context, m *model.Partner) error
	GetByID(ctx context.Context, id string) (*model.Partner, error)
	Update(ctx context.Context, m *model.Partner) error
	Delete(ctx context.Context, id string) error

	List(ctx context.Context, p ListParams) (*PageResult[model.Partner], error)
}

type partnerRepo struct{ db db.Connection }

func NewPartnerRepository(db db.Connection) PartnerRepository {
	return &partnerRepo{db: db}
}
