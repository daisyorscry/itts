package service

import (
	"context"

	"be-itts-community/internal/model"
	"be-itts-community/internal/repository"
	"be-itts-community/pkg/lock"
	"be-itts-community/pkg/midtrans"
	"be-itts-community/pkg/observability/nr"
)

type EventRegistrationService interface {
	// Public
	Register(ctx context.Context, req model.CreateEventRegistrationRequest, verifyURL string) (model.EventRegistrationResponse, error)
	VerifyRegistration(ctx context.Context, rawToken string) (model.EventRegistrationResponse, error)
	PublicGetByAccessToken(ctx context.Context, rawToken string) (model.EventRegistrationResponse, error)
	CreatePayment(ctx context.Context, id string, req model.CreateEventRegistrationPaymentRequest) (model.EventRegistrationResponse, error)
	ResendVerification(ctx context.Context, rawToken string, verifyURL string) error
	ResendInvoice(ctx context.Context, rawToken string) error
	HandlePaymentWebhook(ctx context.Context, payload model.EventPaymentWebhookRequest) (model.EventRegistrationActionResponse, error)

	// Admin
	AdminList(ctx context.Context, p repository.ListParams) (model.EventRegistrationListResponse, error)
	AdminGet(ctx context.Context, id string) (model.EventRegistrationResponse, error)
	AdminActivities(ctx context.Context, id string) ([]model.AuditLogResponse, error)
	AdminUpdate(ctx context.Context, id string, req model.UpdateEventRegistrationRequest) (model.EventRegistrationResponse, error)
	AdminApprove(ctx context.Context, adminID string, id string) (model.EventRegistrationActionResponse, error)
	AdminReject(ctx context.Context, adminID string, id string, reason string) (model.EventRegistrationActionResponse, error)
	AdminWaitlist(ctx context.Context, adminID string, id string) (model.EventRegistrationActionResponse, error)
	AdminPromote(ctx context.Context, adminID string, id string) (model.EventRegistrationActionResponse, error)
	AdminDelete(ctx context.Context, id string) error
}

func NewEventRegistrationService(
	eventRepo repository.EventRepository,
	regRepo repository.EventRegistrationRepository,
	auditRepo repository.AuditLogRepository,
	midtransClient *midtrans.Client,
	frontendBaseURL string,
	mailer Mailer,
	locker lock.Locker,
	tracer nr.Tracer,
) EventRegistrationService {
	return &eventRegistrationService{
		eventRepo:       eventRepo,
		regRepo:         regRepo,
		auditRepo:       auditRepo,
		midtransClient:  midtransClient,
		frontendBaseURL: frontendBaseURL,
		mailer:          mailer,
		locker:          locker,
		tracer:          tracer,
	}
}
