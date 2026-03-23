package service

import (
	"context"

	"be-itts-community/internal/model"
	"be-itts-community/internal/repository"
	"be-itts-community/pkg/lock"
	"be-itts-community/pkg/observability/nr"
)

type EventRegistrationService interface {
	// Public
	Register(ctx context.Context, req model.CreateEventRegistrationRequest, verifyURL string) (model.EventRegistrationResponse, error)
	VerifyRegistration(ctx context.Context, rawToken string) (model.EventRegistrationResponse, error)
	CreatePayment(ctx context.Context, id string, req model.CreateEventRegistrationPaymentRequest) (model.EventRegistrationResponse, error)

	// Admin
	AdminList(ctx context.Context, p repository.ListParams) (model.EventRegistrationListResponse, error)
	AdminGet(ctx context.Context, id string) (model.EventRegistrationResponse, error)
	AdminUpdate(ctx context.Context, id string, req model.UpdateEventRegistrationRequest) (model.EventRegistrationResponse, error)
	AdminDelete(ctx context.Context, id string) error
}

func NewEventRegistrationService(
	eventRepo repository.EventRepository,
	regRepo repository.EventRegistrationRepository,
	mailer Mailer,
	locker lock.Locker,
	tracer nr.Tracer,
) EventRegistrationService {
	return &eventRegistrationService{eventRepo: eventRepo, regRepo: regRepo, mailer: mailer, locker: locker, tracer: tracer}
}
