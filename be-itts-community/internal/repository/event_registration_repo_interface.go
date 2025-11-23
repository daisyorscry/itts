package repository

import (
	"context"

	"be-itts-community/internal/model"
)

type EventRegistrationRepository interface {
	Create(ctx context.Context, m *model.EventRegistration) error
	GetByID(ctx context.Context, id string) (*model.EventRegistration, error)
	Update(ctx context.Context, m *model.EventRegistration) error
	Delete(ctx context.Context, id string) error

	List(ctx context.Context, p ListParams) (*PageResult[model.EventRegistration], error)
}
