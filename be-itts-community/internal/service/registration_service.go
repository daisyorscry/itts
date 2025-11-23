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

	"github.com/daisyorscry/itts/core"
	"gorm.io/gorm"

	"be-itts-community/internal/model"
	"be-itts-community/internal/repository"
	"be-itts-community/pkg/lock"
	"be-itts-community/pkg/observability/nr"
	"be-itts-community/pkg/validator"
)

type registrationService struct {
	regRepo  repository.RegistrationRepository
	evRepo   repository.EmailVerificationRepository
	mailer   Mailer
	tokenTTL time.Duration
	locker   lock.Locker
	tracer   nr.Tracer
}

// runTransaction wraps operations that need both registration and email verification repos in one transaction.
func (s *registrationService) runTransaction(ctx context.Context, fn func(txCtx context.Context) error) error {
	return s.regRepo.RunInTransaction(ctx, fn)
}

func (s *registrationService) Register(ctx context.Context, req model.RegisterRequest, verifyURL string) (model.RegistrationResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "RegistrationService.Register")()
	}

	if err := validator.Validate(req); err != nil {
		return model.RegistrationResponse{}, core.ValidationError(err)
	}

	if _, err := s.regRepo.FindByEmail(ctx, req.Email); err == nil {
		return model.RegistrationResponse{}, core.Conflict("email already registered")
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return model.RegistrationResponse{}, core.InternalServerError("failed to check existing registration").WithError(err)
	}

	reg := req.ToModel()
	var rawToken string

	if err := s.locker.WithLock(ctx, "lock:registrations:"+req.Email, 10*time.Second, func(ctx context.Context) error {
		return s.runTransaction(ctx, func(txCtx context.Context) error {
			if err := s.regRepo.Create(txCtx, &reg); err != nil {
				return core.InternalServerError("failed to create registration").WithError(err)
			}

			tRaw, tHash, err := generateToken()
			if err != nil {
				return core.InternalServerError("failed to generate verification token").WithError(err)
			}
			rawToken = tRaw

			ev := model.EmailVerification{
				RegistrationID: reg.ID,
				TokenHash:      tHash,
				ExpiresAt:      time.Now().Add(s.tokenTTL),
			}
			if err := s.evRepo.Create(txCtx, &ev); err != nil {
				return core.InternalServerError("failed to save verification token").WithError(err)
			}
			return nil
		})
	}); err != nil {
		return model.RegistrationResponse{}, err
	}

	if s.mailer != nil && verifyURL != "" {
		link := fmt.Sprintf("%s?token=%s", verifyURL, rawToken)
		body := fmt.Sprintf(
			`<p>Halo %s,</p>
<p>Silakan verifikasi email untuk pendaftaran program %s.</p>
<p><a href="%s">Klik untuk verifikasi</a></p>
<p>Berlaku 24 jam.</p>`, reg.FullName, reg.Program, link)
		if err := s.mailer.Send(reg.Email, "Verifikasi Email ITTS Community", body); err != nil {
			return model.RegistrationToResponse(reg), fmt.Errorf("failed to send verification email: %w", err)
		}
	}

	return model.RegistrationToResponse(reg), nil
}

func (s *registrationService) VerifyEmail(ctx context.Context, rawToken string) (model.RegistrationResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "RegistrationService.VerifyEmail")()
	}

	if rawToken == "" {
		return model.RegistrationResponse{}, core.BadRequest("missing token")
	}

	sum := sha256.Sum256([]byte(rawToken))
	hashHex := hex.EncodeToString(sum[:])

	ev, err := s.evRepo.FindValidByHash(ctx, hashHex)
	if err != nil {
		return model.RegistrationResponse{}, core.BadRequest("invalid or expired token")
	}

	var reg model.Registration
	now := time.Now()

	if err := s.locker.WithLock(ctx, "lock:registrations:verify:"+hashHex, 10*time.Second, func(ctx context.Context) error {
		return s.runTransaction(ctx, func(txCtx context.Context) error {
			if err := s.evRepo.MarkUsed(txCtx, ev.ID, now); err != nil {
				return core.InternalServerError("failed to mark token used").WithError(err)
			}

			r, err := s.regRepo.GetByID(txCtx, ev.RegistrationID)
			if err != nil {
				return core.InternalServerError("failed to load registration").WithError(err)
			}

			if r.EmailVerifiedAt == nil {
				r.EmailVerifiedAt = &now
				if err := s.regRepo.Update(txCtx, r); err != nil {
					return core.InternalServerError("failed to update registration").WithError(err)
				}
			}

			reg = *r
			return nil
		})
	}); err != nil {
		return model.RegistrationResponse{}, err
	}

	return model.RegistrationToResponse(reg), nil
}

func (s *registrationService) AdminList(ctx context.Context, p repository.ListParams) (model.RegistrationListResponse, error) {
	result, err := s.regRepo.List(ctx, p)
	if err != nil {
		return model.RegistrationListResponse{}, core.InternalServerError("failed to list registrations").WithError(err)
	}
	return registrationListToResponse(*result), nil
}

func (s *registrationService) AdminGet(ctx context.Context, id string) (model.RegistrationResponse, error) {
	m, err := s.regRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.RegistrationResponse{}, core.NotFound("registration", id)
		}
		return model.RegistrationResponse{}, core.InternalServerError("failed to fetch registration").WithError(err)
	}
	return model.RegistrationToResponse(*m), nil
}

func (s *registrationService) AdminApprove(ctx context.Context, req model.AdminApproveRequest) (model.RegistrationResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "RegistrationService.AdminApprove")()
	}

	if err := validator.Validate(req); err != nil {
		return model.RegistrationResponse{}, core.ValidationError(err)
	}

	var out model.Registration
	now := time.Now()

	err := s.locker.WithLock(ctx, "lock:registrations:"+req.ID, 10*time.Second, func(ctx context.Context) error {
		return s.runTransaction(ctx, func(txCtx context.Context) error {
			r, err := s.regRepo.GetByID(txCtx, req.ID)
			if err != nil {
				if errors.Is(err, gorm.ErrRecordNotFound) {
					return core.NotFound("registration", req.ID)
				}
				return core.InternalServerError("failed to fetch registration").WithError(err)
			}
			if r.EmailVerifiedAt == nil {
				return core.BadRequest("email not verified")
			}
			if r.Status == model.RegRejected {
				return core.Conflict("registration already rejected")
			}
			r.Status = model.RegApproved
			r.ApprovedBy = &req.AdminID
			r.ApprovedAt = &now
			r.RejectedReason = nil

			if err := s.regRepo.Update(txCtx, r); err != nil {
				return core.InternalServerError("failed to update registration").WithError(err)
			}
			out = *r
			return nil
		})
	})
	if err != nil {
		return model.RegistrationResponse{}, err
	}

	return model.RegistrationToResponse(out), nil
}

func (s *registrationService) AdminReject(ctx context.Context, req model.AdminRejectRequest) (model.RegistrationResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "RegistrationService.AdminReject")()
	}

	if err := validator.Validate(req); err != nil {
		return model.RegistrationResponse{}, core.ValidationError(err)
	}

	var out model.Registration
	now := time.Now()

	err := s.locker.WithLock(ctx, "lock:registrations:"+req.ID, 10*time.Second, func(ctx context.Context) error {
		return s.runTransaction(ctx, func(txCtx context.Context) error {
			r, err := s.regRepo.GetByID(txCtx, req.ID)
			if err != nil {
				if errors.Is(err, gorm.ErrRecordNotFound) {
					return core.NotFound("registration", req.ID)
				}
				return core.InternalServerError("failed to fetch registration").WithError(err)
			}
			if r.Status == model.RegApproved {
				return core.Conflict("registration already approved")
			}
			r.Status = model.RegRejected
			r.ApprovedBy = &req.AdminID
			r.ApprovedAt = &now
			r.RejectedReason = &req.Reason

			if err := s.regRepo.Update(txCtx, r); err != nil {
				return core.InternalServerError("failed to update registration").WithError(err)
			}
			out = *r
			return nil
		})
	})
	if err != nil {
		return model.RegistrationResponse{}, err
	}

	return model.RegistrationToResponse(out), nil
}

func (s *registrationService) AdminDelete(ctx context.Context, id string) error {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "RegistrationService.AdminDelete")()
	}
	if err := s.regRepo.Delete(ctx, id); err != nil {
		return core.InternalServerError("failed to delete registration").WithError(err)
	}
	return nil
}

func generateToken() (raw string, hash string, err error) {
	b := make([]byte, 32)
	if _, err = rand.Read(b); err != nil {
		return "", "", err
	}
	raw = base64.RawURLEncoding.EncodeToString(b)
	sum := sha256.Sum256([]byte(raw))
	hash = hex.EncodeToString(sum[:])
	return raw, hash, nil
}

func registrationListToResponse(pr repository.PageResult[model.Registration]) model.RegistrationListResponse {
	data := make([]model.RegistrationResponse, 0, len(pr.Data))
	for _, m := range pr.Data {
		data = append(data, model.RegistrationToResponse(m))
	}
	return model.RegistrationListResponse{
		Data:       data,
		Total:      pr.Total,
		Page:       pr.Page,
		PageSize:   pr.PageSize,
		TotalPages: pr.TotalPages,
	}
}
