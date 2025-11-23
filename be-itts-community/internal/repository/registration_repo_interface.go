package repository

import (
	"context"

	"be-itts-community/internal/db"
	"be-itts-community/internal/model"
)

type RegistrationRepository interface {
	RunInTransaction(ctx context.Context, f func(tx context.Context) error) error

	Create(ctx context.Context, r *model.Registration) error
	GetByID(ctx context.Context, id string) (*model.Registration, error)
	FindByEmail(ctx context.Context, email string) (*model.Registration, error)
	Update(ctx context.Context, r *model.Registration) error
	Delete(ctx context.Context, id string) error

	List(ctx context.Context, p ListParams) (*PageResult[model.Registration], error)
}

type registrationRepo struct{ db db.Connection }

func NewRegistrationRepository(db db.Connection) RegistrationRepository {
	return &registrationRepo{db: db}
}
