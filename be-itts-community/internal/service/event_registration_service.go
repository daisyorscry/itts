package service

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgconn"
	"gorm.io/gorm"

	"be-itts-community/internal/model"
	"be-itts-community/internal/repository"
	"be-itts-community/pkg/lock"
	"be-itts-community/pkg/mailer"
	"be-itts-community/pkg/midtrans"
	"be-itts-community/pkg/observability/nr"
	"be-itts-community/pkg/validator"

	"github.com/daisyorscry/itts/core"
)

const eventVerificationTTL = 24 * time.Hour

type eventRegistrationService struct {
	eventRepo       repository.EventRepository
	regRepo         repository.EventRegistrationRepository
	auditRepo       repository.AuditLogRepository
	locker          lock.Locker
	mailer          Mailer
	midtransClient  *midtrans.Client
	frontendBaseURL string
	tracer          nr.Tracer
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
		body, renderErr := mailer.RenderEventVerificationEmail(
			reg.FullName,
			ev.Title,
			derefString(ev.Summary),
			derefString(ev.Venue),
			formatEventDateRange(ev.StartsAt, ev.EndsAt),
			link,
		)
		if renderErr != nil {
			return model.EventRegistrationToResponse(reg), core.InternalServerError("failed to render verification email").WithError(renderErr)
		}
		go func(to string, htmlBody string) {
			if err := s.mailer.Send(to, "Verify Your Event Registration - ITTS", htmlBody); err != nil {
				core.Warnf("failed to send event verification email to %s: %v", to, err)
			}
		}(reg.Email, body)
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
	reg, err := s.regRepo.FindByVerificationHash(ctx, hashHex)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.EventRegistrationResponse{}, core.BadRequest("invalid or expired token")
		}
		return model.EventRegistrationResponse{}, core.InternalServerError("failed to verify registration").WithError(err)
	}

	if reg.VerificationExpiresAt != nil && reg.EmailVerifiedAt == nil && reg.VerificationExpiresAt.Before(time.Now()) {
		return model.EventRegistrationResponse{}, core.BadRequest("invalid or expired token")
	}

	if reg.EmailVerifiedAt != nil {
		return model.EventRegistrationToResponse(*reg), nil
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

func (s *eventRegistrationService) PublicGetByAccessToken(ctx context.Context, rawToken string) (model.EventRegistrationResponse, error) {
	if strings.TrimSpace(rawToken) == "" {
		return model.EventRegistrationResponse{}, core.BadRequest("missing token")
	}

	reg, err := s.regRepo.FindByVerificationHash(ctx, hashEventVerificationToken(rawToken))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.EventRegistrationResponse{}, core.BadRequest("invalid token")
		}
		return model.EventRegistrationResponse{}, core.InternalServerError("failed to load registration").WithError(err)
	}

	if reg.VerificationExpiresAt != nil && reg.EmailVerifiedAt == nil && reg.VerificationExpiresAt.Before(time.Now()) {
		return model.EventRegistrationResponse{}, core.BadRequest("invalid or expired token")
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
	if reg.Event.Price <= 0 {
		return model.EventRegistrationResponse{}, core.BadRequest("paid event price must be greater than zero")
	}
	if reg.Status != model.EventRegistrationPendingPayment {
		return model.EventRegistrationResponse{}, core.BadRequest("registration is not waiting for payment")
	}
	if strings.ToLower(req.Provider) != "midtrans" {
		return model.EventRegistrationResponse{}, core.BadRequest("unsupported payment provider")
	}
	if s.midtransClient == nil {
		return model.EventRegistrationResponse{}, core.BadRequest("midtrans is not configured")
	}

	now := time.Now()
	expiresAt := now.Add(2 * time.Hour)
	reference := buildMidtransOrderID(reg.ID, now)
	var callbacks *midtrans.SnapCallbacks
	if s.frontendBaseURL != "" {
		resumeBase := fmt.Sprintf("%s/events/payment-resume?registration_id=%s", strings.TrimRight(s.frontendBaseURL, "/"), reg.ID)
		callbacks = &midtrans.SnapCallbacks{
			Finish:   resumeBase + "&midtrans_status=finish",
			Unfinish: resumeBase + "&midtrans_status=unfinish",
			Error:    resumeBase + "&midtrans_status=error",
		}
	}
	snapResp, err := s.midtransClient.CreateSnapTransaction(midtrans.SnapTransactionRequest{
		TransactionDetails: midtrans.SnapTransactionDetails{
			OrderID:     reference,
			GrossAmount: reg.Event.Price,
		},
		CustomerDetails: midtrans.SnapCustomerDetails{
			FirstName: reg.FullName,
			Email:     reg.Email,
			Phone:     derefString(reg.PhoneNumber),
		},
		ItemDetails: []midtrans.SnapItemDetail{
			{
				ID:       reg.EventID,
				Price:    reg.Event.Price,
				Quantity: 1,
				Name:     reg.Event.Title,
			},
		},
		Callbacks: callbacks,
	})
	if err != nil {
		return model.EventRegistrationResponse{}, core.InternalServerError("failed to create midtrans transaction").WithError(err)
	}

	reg.PaymentProvider = &req.Provider
	reg.PaymentReference = &reference
	reg.PaymentURL = &snapResp.RedirectURL
	reg.PaymentStatus = model.EventPaymentPending
	reg.PaymentExpiresAt = &expiresAt

	if err := s.regRepo.Update(ctx, reg); err != nil {
		return model.EventRegistrationResponse{}, core.InternalServerError("failed to create payment").WithError(err)
	}
	s.auditLog(ctx, nil, "event.registration.payment.created", reg, map[string]any{
		"provider": req.Provider,
		"order_id": reference,
	})
	return model.EventRegistrationToResponse(*reg), nil
}

func (s *eventRegistrationService) ResendVerification(ctx context.Context, rawToken string, verifyURL string) error {
	if s.mailer == nil {
		return core.BadRequest("mailer is not configured")
	}
	if strings.TrimSpace(rawToken) == "" {
		return core.BadRequest("missing token")
	}

	reg, err := s.regRepo.FindByVerificationHash(ctx, hashEventVerificationToken(rawToken))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return core.BadRequest("invalid token")
		}
		return core.InternalServerError("failed to load registration").WithError(err)
	}
	if reg.EmailVerifiedAt != nil {
		return core.BadRequest("registration is already verified")
	}
	if verifyURL == "" {
		return core.BadRequest("verification url is not configured")
	}

	link := fmt.Sprintf("%s?token=%s", verifyURL, rawToken)
	body, renderErr := mailer.RenderEventVerificationEmail(
		reg.FullName,
		reg.Event.Title,
		derefString(reg.Event.Summary),
		derefString(reg.Event.Venue),
		formatEventDateRange(reg.Event.StartsAt, reg.Event.EndsAt),
		link,
	)
	if renderErr != nil {
		return core.InternalServerError("failed to render verification email").WithError(renderErr)
	}
	go func() {
		if err := s.mailer.Send(reg.Email, "Verify Your Event Registration - ITTS", body); err != nil {
			core.Warnf("failed to resend event verification email to %s: %v", reg.Email, err)
		}
	}()

	return nil
}

func (s *eventRegistrationService) ResendInvoice(ctx context.Context, rawToken string) error {
	if strings.TrimSpace(rawToken) == "" {
		return core.BadRequest("missing token")
	}
	reg, err := s.regRepo.FindByVerificationHash(ctx, hashEventVerificationToken(rawToken))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return core.BadRequest("invalid token")
		}
		return core.InternalServerError("failed to load registration").WithError(err)
	}
	if reg.PaymentStatus != model.EventPaymentPaid {
		return core.BadRequest("invoice is only available after successful payment")
	}

	s.sendEventInvoiceEmail(*reg)
	return nil
}

func (s *eventRegistrationService) HandlePaymentWebhook(ctx context.Context, payload model.EventPaymentWebhookRequest) (model.EventRegistrationActionResponse, error) {
	if s.midtransClient == nil {
		return model.EventRegistrationActionResponse{}, core.BadRequest("midtrans is not configured")
	}
	if !s.midtransClient.VerifyWebhookSignature(payload.OrderID, payload.StatusCode, payload.GrossAmount, payload.SignatureKey) {
		return model.EventRegistrationActionResponse{}, core.BadRequest("invalid midtrans signature")
	}

	reg, err := s.regRepo.FindByPaymentReference(ctx, payload.OrderID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.EventRegistrationActionResponse{}, core.NotFound("event_registration", payload.OrderID)
		}
		return model.EventRegistrationActionResponse{}, core.InternalServerError("failed to load payment registration").WithError(err)
	}

	now := time.Now()
	switch payload.TransactionStatus {
	case "settlement", "capture":
		reg.PaymentStatus = model.EventPaymentPaid
		approvedCount, countErr := s.regRepo.CountByEventAndStatuses(ctx, reg.EventID, []model.EventRegistrationStatus{model.EventRegistrationApproved})
		if countErr != nil {
			return model.EventRegistrationActionResponse{}, core.InternalServerError("failed to count approved registrations").WithError(countErr)
		}
		if reg.Event.Capacity > 0 && approvedCount >= int64(reg.Event.Capacity) {
			reg.Status = model.EventRegistrationWaitlisted
			reg.WaitlistedAt = &now
			reg.ApprovedAt = nil
		} else {
			reg.Status = model.EventRegistrationApproved
			reg.ApprovedAt = &now
			reg.WaitlistedAt = nil
		}
	case "pending":
		reg.PaymentStatus = model.EventPaymentPending
	case "expire":
		reg.PaymentStatus = model.EventPaymentExpired
		reg.Status = model.EventRegistrationExpired
	case "deny", "cancel":
		reg.PaymentStatus = model.EventPaymentFailed
		reg.Status = model.EventRegistrationCancelled
	}

	if err := s.regRepo.Update(ctx, reg); err != nil {
		return model.EventRegistrationActionResponse{}, core.InternalServerError("failed to update payment status").WithError(err)
	}
	s.auditLog(ctx, nil, "event.registration.payment.webhook", reg, map[string]any{
		"transaction_status": payload.TransactionStatus,
		"payment_type":       payload.PaymentType,
		"transaction_id":     payload.TransactionID,
		"order_id":           payload.OrderID,
	})
	switch payload.TransactionStatus {
	case "settlement", "capture":
		s.sendEventInvoiceEmail(*reg)
	case "expire", "deny", "cancel":
		s.sendEventStatusEmail(*reg, string(reg.Status))
	}

	return model.EventRegistrationActionResponse{
		Registration: model.EventRegistrationToResponse(*reg),
	}, nil
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

func (s *eventRegistrationService) AdminActivities(ctx context.Context, id string) ([]model.AuditLogResponse, error) {
	if s.auditRepo == nil {
		return nil, nil
	}
	result, err := s.auditRepo.ListAuditLogs(ctx, repository.ListParams{
		Filters: map[string]any{
			"resource_type": "event_registrations",
			"resource_id":   id,
		},
		Page:     1,
		PageSize: 50,
		Sort:     []string{"-created_at"},
	})
	if err != nil {
		return nil, core.InternalServerError("failed to load registration activities").WithError(err)
	}
	resp := make([]model.AuditLogResponse, 0, len(result.Data))
	for idx := range result.Data {
		resp = append(resp, result.Data[idx].ToAuditLogResponse())
	}
	return resp, nil
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

func (s *eventRegistrationService) AdminApprove(ctx context.Context, adminID string, id string) (model.EventRegistrationActionResponse, error) {
	return s.transitionStatus(ctx, &adminID, id, model.EventRegistrationApproved, "")
}

func (s *eventRegistrationService) AdminReject(ctx context.Context, adminID string, id string, reason string) (model.EventRegistrationActionResponse, error) {
	return s.transitionStatus(ctx, &adminID, id, model.EventRegistrationRejected, reason)
}

func (s *eventRegistrationService) AdminWaitlist(ctx context.Context, adminID string, id string) (model.EventRegistrationActionResponse, error) {
	return s.transitionStatus(ctx, &adminID, id, model.EventRegistrationWaitlisted, "")
}

func (s *eventRegistrationService) AdminPromote(ctx context.Context, adminID string, id string) (model.EventRegistrationActionResponse, error) {
	reg, err := s.regRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.EventRegistrationActionResponse{}, core.NotFound("event_registration", id)
		}
		return model.EventRegistrationActionResponse{}, core.InternalServerError("failed to load registration").WithError(err)
	}
	if reg.Status != model.EventRegistrationWaitlisted {
		return model.EventRegistrationActionResponse{}, core.BadRequest("only waitlisted registrations can be promoted")
	}
	return s.transitionStatus(ctx, &adminID, id, model.EventRegistrationApproved, "")
}

func (s *eventRegistrationService) AdminDelete(ctx context.Context, id string) error {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "EventRegistrationService.AdminDelete")()
	}
	var releasedSeatEventID string
	err := s.locker.WithLock(ctx, "lock:event_reg:"+id, 5*time.Second, func(ctx context.Context) error {
		reg, getErr := s.regRepo.GetByID(ctx, id)
		if getErr != nil {
			return getErr
		}
		if reg.Status == model.EventRegistrationApproved {
			releasedSeatEventID = reg.EventID
		}
		return s.regRepo.Delete(ctx, id)
	})
	if err != nil {
		return err
	}
	if releasedSeatEventID != "" {
		promoted, promoteErr := s.promoteNextWaitlisted(ctx, releasedSeatEventID)
		if promoteErr == nil && promoted != nil {
			s.sendEventStatusEmail(*promoted, "approved")
			s.auditLog(ctx, nil, "event.registration.auto_promoted", promoted, map[string]any{
				"source_registration_id": id,
				"source_action":          "delete",
			})
		}
	}
	s.auditLog(ctx, nil, "event.registration.deleted", &model.EventRegistration{ID: id}, nil)
	return nil
}

func (s *eventRegistrationService) transitionStatus(ctx context.Context, adminID *string, id string, target model.EventRegistrationStatus, reason string) (model.EventRegistrationActionResponse, error) {
	now := time.Now()

	var out *model.EventRegistration
	var releasedSeatEventID string
	err := s.locker.WithLock(ctx, "lock:event_reg:status:"+id, 5*time.Second, func(ctx context.Context) error {
		reg, err := s.regRepo.GetByID(ctx, id)
		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return core.NotFound("event_registration", id)
			}
			return core.InternalServerError("failed to load registration").WithError(err)
		}
		wasApproved := reg.Status == model.EventRegistrationApproved

		if target == model.EventRegistrationApproved {
			approvedCount, countErr := s.regRepo.CountByEventAndStatuses(ctx, reg.EventID, []model.EventRegistrationStatus{model.EventRegistrationApproved})
			if countErr != nil {
				return core.InternalServerError("failed to count approved registrations").WithError(countErr)
			}
			if reg.Status != model.EventRegistrationApproved && reg.Event.Capacity > 0 && approvedCount >= int64(reg.Event.Capacity) {
				return core.Conflict("event capacity is full")
			}
		}

		reg.Status = target
		switch target {
		case model.EventRegistrationApproved:
			reg.ApprovedAt = &now
			reg.WaitlistedAt = nil
			reg.RejectedAt = nil
			reg.RejectedReason = nil
		case model.EventRegistrationWaitlisted:
			reg.WaitlistedAt = &now
			reg.ApprovedAt = nil
			reg.RejectedAt = nil
			reg.RejectedReason = nil
		case model.EventRegistrationRejected:
			reg.RejectedAt = &now
			reg.ApprovedAt = nil
			reg.WaitlistedAt = nil
			if reason != "" {
				reg.RejectedReason = &reason
			}
		}

		if err := s.regRepo.Update(ctx, reg); err != nil {
			return core.InternalServerError("failed to update registration").WithError(err)
		}
		if wasApproved && target != model.EventRegistrationApproved {
			releasedSeatEventID = reg.EventID
		}
		out = reg
		return nil
	})
	if err != nil {
		return model.EventRegistrationActionResponse{}, err
	}
	var promotedResp *model.EventRegistrationResponse
	if releasedSeatEventID != "" {
		promoted, promoteErr := s.promoteNextWaitlisted(ctx, releasedSeatEventID)
		if promoteErr == nil && promoted != nil {
			resp := model.EventRegistrationToResponse(*promoted)
			promotedResp = &resp
			s.sendEventStatusEmail(*promoted, "approved")
			s.auditLog(ctx, adminID, "event.registration.auto_promoted", promoted, map[string]any{
				"source_registration_id": id,
			})
		}
	}
	s.auditLog(ctx, adminID, "event.registration."+string(target), out, map[string]any{
		"reason": reason,
	})
	s.sendEventStatusEmail(*out, string(target))
	return model.EventRegistrationActionResponse{
		Registration:         model.EventRegistrationToResponse(*out),
		PromotedRegistration: promotedResp,
	}, nil
}

func (s *eventRegistrationService) promoteNextWaitlisted(ctx context.Context, eventID string) (*model.EventRegistration, error) {
	waitlisted, err := s.regRepo.FindOldestByEventAndStatus(ctx, eventID, model.EventRegistrationWaitlisted)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}

	now := time.Now()
	waitlisted.Status = model.EventRegistrationApproved
	waitlisted.ApprovedAt = &now
	waitlisted.WaitlistedAt = nil
	waitlisted.RejectedAt = nil
	waitlisted.RejectedReason = nil
	if err := s.regRepo.Update(ctx, waitlisted); err != nil {
		return nil, err
	}
	return waitlisted, nil
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

func (s *eventRegistrationService) sendEventStatusEmail(reg model.EventRegistration, status string) {
	if s.mailer == nil {
		return
	}

	subject := fmt.Sprintf("Event Registration Update - %s", reg.Event.Title)
	body, err := mailer.RenderEventStatusEmail(reg.FullName, reg.Event.Title, strings.ReplaceAll(status, "_", " "), derefString(reg.RejectedReason))
	if err != nil {
		core.Warnf("failed to render event status email for %s: %v", reg.Email, err)
		return
	}

	go func() {
		if err := s.mailer.Send(reg.Email, subject, body); err != nil {
			core.Warnf("failed to send event status email to %s: %v", reg.Email, err)
		}
	}()
}

func (s *eventRegistrationService) sendEventInvoiceEmail(reg model.EventRegistration) {
	if s.mailer == nil {
		return
	}

	resumeLink := ""
	if s.frontendBaseURL != "" {
		resumeLink = fmt.Sprintf("%s/events/payment-resume?registration_id=%s", strings.TrimRight(s.frontendBaseURL, "/"), reg.ID)
	}

	currency := reg.Event.Currency
	if currency == "" {
		currency = "IDR"
	}

	body, err := mailer.RenderEventInvoiceEmail(
		reg.FullName,
		reg.Event.Title,
		derefString(reg.Event.Venue),
		formatEventDateRange(reg.Event.StartsAt, reg.Event.EndsAt),
		formatCurrencyAmount(reg.Event.Price),
		currency,
		derefString(reg.PaymentReference),
		resumeLink,
	)
	if err != nil {
		core.Warnf("failed to render event invoice email for %s: %v", reg.Email, err)
		return
	}

	go func() {
		if err := s.mailer.Send(reg.Email, fmt.Sprintf("Payment Confirmed - %s", reg.Event.Title), body); err != nil {
			core.Warnf("failed to send event invoice email to %s: %v", reg.Email, err)
		}
	}()
}

func (s *eventRegistrationService) auditLog(ctx context.Context, userID *string, action string, reg *model.EventRegistration, metadata map[string]any) {
	if s.auditRepo == nil || reg == nil {
		return
	}
	resourceType := "event_registrations"
	resourceID := reg.ID
	log := &model.AuditLog{
		UserID:       userID,
		Action:       action,
		ResourceType: &resourceType,
		ResourceID:   &resourceID,
		Metadata:     metadata,
	}
	go func() {
		_ = s.auditRepo.CreateAuditLog(context.Background(), log)
	}()
}

func derefString(value *string) string {
	if value == nil {
		return ""
	}
	return *value
}

func buildMidtransOrderID(registrationID string, now time.Time) string {
	cleanID := strings.ReplaceAll(registrationID, "-", "")
	if len(cleanID) > 8 {
		cleanID = cleanID[:8]
	}
	return fmt.Sprintf("EVT%s%d", cleanID, now.Unix())
}

func formatEventDateRange(startsAt time.Time, endsAt *time.Time) string {
	if endsAt == nil {
		return startsAt.Format("02 Jan 2006 15:04 MST")
	}

	if startsAt.Format("2006-01-02") == endsAt.Format("2006-01-02") {
		return fmt.Sprintf("%s - %s", startsAt.Format("02 Jan 2006 15:04"), endsAt.Format("15:04 MST"))
	}

	return fmt.Sprintf("%s - %s", startsAt.Format("02 Jan 2006 15:04 MST"), endsAt.Format("02 Jan 2006 15:04 MST"))
}

func formatCurrencyAmount(amount int64) string {
	raw := fmt.Sprintf("%d", amount)
	if len(raw) <= 3 {
		return raw
	}

	var parts []string
	for len(raw) > 3 {
		parts = append([]string{raw[len(raw)-3:]}, parts...)
		raw = raw[:len(raw)-3]
	}
	if raw != "" {
		parts = append([]string{raw}, parts...)
	}
	return strings.Join(parts, ".")
}
