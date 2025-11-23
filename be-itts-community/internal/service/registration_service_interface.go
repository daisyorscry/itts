package service

import (
	"context"
	"time"

	"be-itts-community/internal/model"
	"be-itts-community/internal/repository"
	"be-itts-community/pkg/lock"
	"be-itts-community/pkg/observability/nr"
)

type Mailer interface {
	Send(to, subject, htmlBody string) error
}

type RegistrationService interface {
	Register(ctx context.Context, req model.RegisterRequest, verifyURL string) (model.RegistrationResponse, error)
	VerifyEmail(ctx context.Context, rawToken string) (model.RegistrationResponse, error)

	AdminList(ctx context.Context, p repository.ListParams) (model.RegistrationListResponse, error)
	AdminGet(ctx context.Context, id string) (model.RegistrationResponse, error)
	AdminApprove(ctx context.Context, req model.AdminApproveRequest) (model.RegistrationResponse, error)
	AdminReject(ctx context.Context, req model.AdminRejectRequest) (model.RegistrationResponse, error)
	AdminDelete(ctx context.Context, id string) error
}

func NewRegistrationService(
	regRepo repository.RegistrationRepository,
	evRepo repository.EmailVerificationRepository,
	mailer Mailer,
	locker lock.Locker,
	tracer nr.Tracer,
) RegistrationService {
	return &registrationService{
		regRepo: regRepo, evRepo: evRepo, mailer: mailer,
		tokenTTL: 24 * time.Hour,
		locker:   locker, tracer: tracer,
	}
}
