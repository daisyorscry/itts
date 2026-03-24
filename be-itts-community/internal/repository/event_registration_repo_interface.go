package repository

import (
	"context"
	"time"

	"be-itts-community/internal/model"
)

type EventRegistrationRepository interface {
	Create(ctx context.Context, m *model.EventRegistration) error
	GetByID(ctx context.Context, id string) (*model.EventRegistration, error)
	FindValidByVerificationHash(ctx context.Context, hash string, now time.Time) (*model.EventRegistration, error)
	FindByVerificationHash(ctx context.Context, hash string) (*model.EventRegistration, error)
	FindByPaymentReference(ctx context.Context, reference string) (*model.EventRegistration, error)
	CountByEventAndStatuses(ctx context.Context, eventID string, statuses []model.EventRegistrationStatus) (int64, error)
	FindOldestByEventAndStatus(ctx context.Context, eventID string, status model.EventRegistrationStatus) (*model.EventRegistration, error)
	Update(ctx context.Context, m *model.EventRegistration) error
	Delete(ctx context.Context, id string) error

	List(ctx context.Context, p ListParams) (*PageResult[model.EventRegistration], error)
}
