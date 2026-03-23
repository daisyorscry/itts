package service

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgconn"
	"gorm.io/gorm"

	"be-itts-community/internal/model"
	"be-itts-community/internal/repository"
	"be-itts-community/pkg/lock"
	"be-itts-community/pkg/mailer"
	"be-itts-community/pkg/observability/nr"
	"be-itts-community/pkg/validator"

	"github.com/daisyorscry/itts/core"
)

const eventVerificationTTL = 24 * time.Hour

type eventRegistrationService struct {
	eventRepo repository.EventRepository
	regRepo   repository.EventRegistrationRepository
	locker    lock.Locker
	mailer    Mailer
	tracer    nr.Tracer
}

func (s *eventRegistrationService) Register(ctx context.Context, req model.CreateEventRegistrationRequest, verifyURL string) (model.EventRegistrationResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "EventRegistrationService.Register")()
	}
	if err := validator.Validate(req); err != nil {
		return model.EventRegistrationResponse{}, core.ValidationError(err)
	}

	ev, err := s.eventRepo.GetEventByID(ctx, req.EventID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.EventRegistrationResponse{}, core.NotFound("event", req.EventID)
		}
		return model.EventRegistrationResponse{}, core.InternalServerError("failed to fetch event").WithError(err)
	}

	now := time.Now()
	if ev.Status != model.EventOpen && ev.Status != model.EventOngoing {
		return model.EventRegistrationResponse{}, core.BadRequest("event registration is not open")
	}
	if ev.RegistrationDeadline != nil && now.After(*ev.RegistrationDeadline) {
		return model.EventRegistrationResponse{}, core.BadRequest("registration deadline has passed")
	}

	reg := req.ToModel()
	rawToken, hashHex, err := generateEventVerificationToken()
	if err != nil {
		return model.EventRegistrationResponse{}, core.InternalServerError("failed to generate verification token").WithError(err)
	}
	reg.VerificationTokenHash = &hashHex
	expiresAt := now.Add(eventVerificationTTL)
	reg.VerificationExpiresAt = &expiresAt

	if err := s.locker.WithLock(ctx, "lock:event_reg:"+req.EventID+":"+req.Email, 10*time.Second, func(ctx context.Context) error {
		return s.regRepo.Create(ctx, &reg)
	}); err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return model.EventRegistrationResponse{}, core.Conflict("email already registered for this event")
		}
		return model.EventRegistrationResponse{}, core.InternalServerError("failed to register for event").WithError(err)
	}

	if s.mailer != nil && verifyURL != "" {
		link := fmt.Sprintf("%s?token=%s", verifyURL, rawToken)
		body, renderErr := mailer.RenderVerificationEmail(reg.FullName, ev.Title, link)
		if renderErr != nil {
			return model.EventRegistrationToResponse(reg), core.InternalServerError("failed to render verification email").WithError(renderErr)
		}
		if sendErr := s.mailer.Send(reg.Email, "Verify Your Event Registration - ITTS", body); sendErr != nil {
			return model.EventRegistrationToResponse(reg), core.InternalServerError("failed to send verification email").WithError(sendErr)
		}
	}

	return model.EventRegistrationToResponse(reg), nil
}

func (s *eventRegistrationService) VerifyRegistration(ctx context.Context, rawToken string) (model.EventRegistrationResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "EventRegistrationService.VerifyRegistration")()
	}
	if rawToken == "" {
		return model.EventRegistrationResponse{}, core.BadRequest("missing token")
	}

	hashHex := hashEventVerificationToken(rawToken)
	reg, err := s.regRepo.FindValidByVerificationHash(ctx, hashHex, time.Now())
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.EventRegistrationResponse{}, core.BadRequest("invalid or expired token")
		}
		return model.EventRegistrationResponse{}, core.InternalServerError("failed to verify registration").WithError(err)
	}

	now := time.Now()
	if err := s.locker.WithLock(ctx, "lock:event_reg:verify:"+reg.ID, 10*time.Second, func(ctx context.Context) error {
		ev, getErr := s.eventRepo.GetEventByID(ctx, reg.EventID)
		if getErr != nil {
			return core.InternalServerError("failed to fetch event").WithError(getErr)
		}

		if reg.EmailVerifiedAt == nil {
			reg.EmailVerifiedAt = &now
		}
		reg.VerificationTokenHash = nil
		reg.VerificationExpiresAt = nil

		if ev.IsPaid {
			reg.Status = model.EventRegistrationPendingPayment
			reg.PaymentStatus = model.EventPaymentPending
		} else {
			approvedCount, countErr := s.regRepo.CountByEventAndStatuses(ctx, reg.EventID, []model.EventRegistrationStatus{model.EventRegistrationApproved})
			if countErr != nil {
				return core.InternalServerError("failed to count approved registrations").WithError(countErr)
			}
			if ev.Capacity > 0 && approvedCount >= int64(ev.Capacity) {
				reg.Status = model.EventRegistrationWaitlisted
				reg.WaitlistedAt = &now
			} else {
				reg.Status = model.EventRegistrationApproved
				reg.ApprovedAt = &now
				reg.WaitlistedAt = nil
				reg.PaymentStatus = model.EventPaymentNotRequired
			}
		}

		if updateErr := s.regRepo.Update(ctx, reg); updateErr != nil {
			return core.InternalServerError("failed to update registration").WithError(updateErr)
		}
		return nil
	}); err != nil {
		return model.EventRegistrationResponse{}, err
	}

	return model.EventRegistrationToResponse(*reg), nil
}

func (s *eventRegistrationService) CreatePayment(ctx context.Context, id string, req model.CreateEventRegistrationPaymentRequest) (model.EventRegistrationResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "EventRegistrationService.CreatePayment")()
	}
	if err := validator.Validate(req); err != nil {
		return model.EventRegistrationResponse{}, core.ValidationError(err)
	}

	reg, err := s.regRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.EventRegistrationResponse{}, core.NotFound("event_registration", id)
		}
		return model.EventRegistrationResponse{}, core.InternalServerError("failed to load registration").WithError(err)
	}
	if reg.EmailVerifiedAt == nil {
		return model.EventRegistrationResponse{}, core.BadRequest("email must be verified before payment")
	}
	if !reg.Event.IsPaid {
		return model.EventRegistrationResponse{}, core.BadRequest("this event does not require payment")
	}
	if reg.Status != model.EventRegistrationPendingPayment {
		return model.EventRegistrationResponse{}, core.BadRequest("registration is not waiting for payment")
	}

	now := time.Now()
	expiresAt := now.Add(2 * time.Hour)
	reference := fmt.Sprintf("EVT-%s-%d", reg.ID, now.Unix())
	paymentURL := fmt.Sprintf("https://payments.midtrans.local/checkout/%s", reference)

	reg.PaymentProvider = &req.Provider
	reg.PaymentReference = &reference
	reg.PaymentURL = &paymentURL
	reg.PaymentStatus = model.EventPaymentPending
	reg.PaymentExpiresAt = &expiresAt

	if err := s.regRepo.Update(ctx, reg); err != nil {
		return model.EventRegistrationResponse{}, core.InternalServerError("failed to create payment").WithError(err)
	}
	return model.EventRegistrationToResponse(*reg), nil
}

func (s *eventRegistrationService) AdminList(ctx context.Context, p repository.ListParams) (model.EventRegistrationListResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "EventRegistrationService.AdminList")()
	}
	result, err := s.regRepo.List(ctx, p)
	if err != nil {
		return model.EventRegistrationListResponse{}, core.InternalServerError("failed to list registrations").WithError(err)
	}
	return model.EventRegistrationListToResponse(result.Data, result.Total, result.Page, result.PageSize, result.TotalPages), nil
}

func (s *eventRegistrationService) AdminGet(ctx context.Context, id string) (model.EventRegistrationResponse, error) {
	m, err := s.regRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.EventRegistrationResponse{}, core.NotFound("event_registration", id)
		}
		return model.EventRegistrationResponse{}, core.InternalServerError("failed to load registration").WithError(err)
	}
	return model.EventRegistrationToResponse(*m), nil
}

func (s *eventRegistrationService) AdminUpdate(ctx context.Context, id string, req model.UpdateEventRegistrationRequest) (model.EventRegistrationResponse, error) {
	if err := validator.Validate(req); err != nil {
		return model.EventRegistrationResponse{}, core.ValidationError(err)
	}
	r, err := s.regRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.EventRegistrationResponse{}, core.NotFound("event_registration", id)
		}
		return model.EventRegistrationResponse{}, core.InternalServerError("failed to load registration").WithError(err)
	}
	if req.FullName != nil {
		r.FullName = *req.FullName
	}
	if req.Email != nil {
		r.Email = *req.Email
	}
	if req.PhoneNumber != nil {
		r.PhoneNumber = req.PhoneNumber
	}
	if req.Institution != nil {
		r.Institution = req.Institution
	}
	if req.Status != nil {
		r.Status = *req.Status
	}
	if err := s.regRepo.Update(ctx, r); err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return model.EventRegistrationResponse{}, core.Conflict("email already registered for this event")
		}
		return model.EventRegistrationResponse{}, core.InternalServerError("failed to update registration").WithError(err)
	}
	return model.EventRegistrationToResponse(*r), nil
}

func (s *eventRegistrationService) AdminDelete(ctx context.Context, id string) error {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "EventRegistrationService.AdminDelete")()
	}
	return s.locker.WithLock(ctx, "lock:event_reg:"+id, 5*time.Second, func(ctx context.Context) error {
		return s.regRepo.Delete(ctx, id)
	})
}

func generateEventVerificationToken() (string, string, error) {
	buf := make([]byte, 32)
	if _, err := rand.Read(buf); err != nil {
		return "", "", err
	}
	raw := base64.RawURLEncoding.EncodeToString(buf)
	return raw, hashEventVerificationToken(raw), nil
}

func hashEventVerificationToken(raw string) string {
	sum := sha256.Sum256([]byte(raw))
	return hex.EncodeToString(sum[:])
}
