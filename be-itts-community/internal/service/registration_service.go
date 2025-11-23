package service

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"errors"
	"fmt"
	"strconv"
	"time"

	"gorm.io/gorm"

	"be-itts-community/internal/model"
	"be-itts-community/internal/repository"
	"be-itts-community/pkg/lock"
	"be-itts-community/pkg/observability/nr"
	"be-itts-community/pkg/validator"
)

type Mailer interface {
	Send(to, subject, htmlBody string) error
}

// ========================================
// Request DTOs
// ========================================

type RegisterRequest struct {
	FullName   string            `json:"full_name" validate:"required,min=3"`
	Email      string            `json:"email" validate:"required,email"`
	Program    model.ProgramEnum `json:"program" validate:"required,oneof=networking devsecops programming"`
	StudentID  int               `json:"student_id" validate:"required"`
	IntakeYear int               `json:"intake_year" validate:"required,gte=2000,lte=2100"`
	Motivation string            `json:"motivation" validate:"required,min=10"`
}

type AdminApproveRequest struct {
	ID      string `json:"id" validate:"required"`
	AdminID string `json:"admin_id" validate:"required"`
}

type AdminRejectRequest struct {
	ID      string `json:"id" validate:"required"`
	AdminID string `json:"admin_id" validate:"required"`
	Reason  string `json:"reason" validate:"required,min=5"`
}

// ========================================
// Response DTOs
// ========================================

type RegistrationResponse struct {
	ID              string                    `json:"id"`
	FullName        string                    `json:"full_name"`
	Email           string                    `json:"email"`
	Program         model.ProgramEnum         `json:"program"`
	StudentID       string                    `json:"student_id"`
	IntakeYear      int                       `json:"intake_year"`
	Motivation      string                    `json:"motivation"`
	Status          model.RegistrationStatus  `json:"status"`
	ApprovedBy      *string                   `json:"approved_by,omitempty"`
	ApprovedAt      *time.Time                `json:"approved_at,omitempty"`
	RejectedReason  *string                   `json:"rejected_reason,omitempty"`
	EmailVerifiedAt *time.Time                `json:"email_verified_at,omitempty"`
	CreatedAt       time.Time                 `json:"created_at"`
	UpdatedAt       time.Time                 `json:"updated_at"`
}

type RegistrationListResponse struct {
	Data       []RegistrationResponse `json:"data"`
	Total      int64                  `json:"total"`
	Page       int                    `json:"page"`
	PageSize   int                    `json:"page_size"`
	TotalPages int                    `json:"total_pages"`
}

// ========================================
// Mappers
// ========================================

func (r RegisterRequest) ToModel() model.Registration {
	return model.Registration{
		FullName:   r.FullName,
		Email:      r.Email,
		Program:    r.Program,
		StudentID:  strconv.Itoa(r.StudentID),
		IntakeYear: r.IntakeYear,
		Motivation: r.Motivation,
		Status:     model.RegPending,
	}
}

func RegistrationToResponse(m model.Registration) RegistrationResponse {
	return RegistrationResponse{
		ID:              m.ID,
		FullName:        m.FullName,
		Email:           m.Email,
		Program:         m.Program,
		StudentID:       m.StudentID,
		IntakeYear:      m.IntakeYear,
		Motivation:      m.Motivation,
		Status:          m.Status,
		ApprovedBy:      m.ApprovedBy,
		ApprovedAt:      m.ApprovedAt,
		RejectedReason:  m.RejectedReason,
		EmailVerifiedAt: m.EmailVerifiedAt,
		CreatedAt:       m.CreatedAt,
		UpdatedAt:       m.UpdatedAt,
	}
}

func RegistrationListToResponse(pr repository.PageResult[model.Registration]) RegistrationListResponse {
	data := make([]RegistrationResponse, 0, len(pr.Data))
	for _, m := range pr.Data {
		data = append(data, RegistrationToResponse(m))
	}
	return RegistrationListResponse{
		Data:       data,
		Total:      pr.Total,
		Page:       pr.Page,
		PageSize:   pr.PageSize,
		TotalPages: pr.TotalPages,
	}
}

// ========================================
// Service Interface
// ========================================

type RegistrationService interface {
	Register(ctx context.Context, req RegisterRequest, verifyURL string) (RegistrationResponse, error)
	VerifyEmail(ctx context.Context, rawToken string) (RegistrationResponse, error)

	AdminList(ctx context.Context, p repository.ListParams) (RegistrationListResponse, error)
	AdminGet(ctx context.Context, id string) (RegistrationResponse, error)
	AdminApprove(ctx context.Context, req AdminApproveRequest) (RegistrationResponse, error)
	AdminReject(ctx context.Context, req AdminRejectRequest) (RegistrationResponse, error)
	AdminDelete(ctx context.Context, id string) error
}

// ========================================
// Service Implementation
// ========================================

type registrationService struct {
	db       *gorm.DB
	regRepo  repository.RegistrationRepository
	evRepo   repository.EmailVerificationRepository
	mailer   Mailer
	tokenTTL time.Duration
	locker   lock.Locker
	tracer   nr.Tracer
}

func NewRegistrationService(
	db *gorm.DB,
	regRepo repository.RegistrationRepository,
	evRepo repository.EmailVerificationRepository,
	mailer Mailer,
	locker lock.Locker,
	tracer nr.Tracer,
) RegistrationService {
	return &registrationService{
		db: db, regRepo: regRepo, evRepo: evRepo, mailer: mailer,
		tokenTTL: 24 * time.Hour,
		locker:   locker, tracer: tracer,
	}
}

func (s *registrationService) Register(ctx context.Context, req RegisterRequest, verifyURL string) (RegistrationResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "RegistrationService.Register")()
	}

	// Validation at the beginning
	if err := validator.Validate(req); err != nil {
		return RegistrationResponse{}, err
	}

	if _, err := s.regRepo.FindByEmail(ctx, req.Email); err == nil {
		return RegistrationResponse{}, fmt.Errorf("email already registered")
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
		return RegistrationResponse{}, err
	}

	reg := req.ToModel()
	var rawToken string

	if err := s.locker.WithLock(ctx, "lock:registrations:"+req.Email, 10*time.Second, func(ctx context.Context) error {
		return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
			if err := tx.Create(&reg).Error; err != nil {
				return err
			}
			tRaw, tHash, err := generateToken()
			if err != nil {
				return err
			}
			rawToken = tRaw

			ev := model.EmailVerification{
				RegistrationID: reg.ID,
				TokenHash:      tHash,
				ExpiresAt:      time.Now().Add(s.tokenTTL),
			}
			if err := tx.Create(&ev).Error; err != nil {
				return err
			}
			return nil
		})
	}); err != nil {
		return RegistrationResponse{}, err
	}

	if s.mailer != nil && verifyURL != "" {
		link := fmt.Sprintf("%s?token=%s", verifyURL, rawToken)
		body := fmt.Sprintf(
			`<p>Halo %s,</p>
<p>Silakan verifikasi email untuk pendaftaran program %s.</p>
<p><a href="%s">Klik untuk verifikasi</a></p>
<p>Berlaku 24 jam.</p>`, reg.FullName, reg.Program, link)
		if err := s.mailer.Send(reg.Email, "Verifikasi Email ITTS Community", body); err != nil {
			return RegistrationToResponse(reg), fmt.Errorf("failed to send verification email: %w", err)
		}
	}

	return RegistrationToResponse(reg), nil
}

func (s *registrationService) VerifyEmail(ctx context.Context, rawToken string) (RegistrationResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "RegistrationService.VerifyEmail")()
	}

	if rawToken == "" {
		return RegistrationResponse{}, errors.New("missing token")
	}

	sum := sha256.Sum256([]byte(rawToken))
	hashHex := hex.EncodeToString(sum[:])

	ev, err := s.evRepo.FindValidByHash(ctx, hashHex)
	if err != nil {
		return RegistrationResponse{}, fmt.Errorf("invalid or expired token")
	}

	var reg model.Registration
	now := time.Now()

	if err := s.locker.WithLock(ctx, "lock:registrations:verify:"+hashHex, 10*time.Second, func(ctx context.Context) error {
		return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
			if err := s.evRepo.MarkUsed(ctx, ev.ID, now); err != nil {
				return err
			}
			if err := tx.First(&reg, "id = ?", ev.RegistrationID).Error; err != nil {
				return err
			}
			if reg.EmailVerifiedAt == nil {
				reg.EmailVerifiedAt = &now
				if err := tx.Save(&reg).Error; err != nil {
					return err
				}
			}
			return nil
		})
	}); err != nil {
		return RegistrationResponse{}, err
	}

	return RegistrationToResponse(reg), nil
}

func (s *registrationService) AdminList(ctx context.Context, p repository.ListParams) (RegistrationListResponse, error) {
	result, err := s.regRepo.List(ctx, p)
	if err != nil {
		return RegistrationListResponse{}, err
	}
	return RegistrationListToResponse(*result), nil
}

func (s *registrationService) AdminGet(ctx context.Context, id string) (RegistrationResponse, error) {
	m, err := s.regRepo.GetByID(ctx, id)
	if err != nil {
		return RegistrationResponse{}, err
	}
	return RegistrationToResponse(*m), nil
}

func (s *registrationService) AdminApprove(ctx context.Context, req AdminApproveRequest) (RegistrationResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "RegistrationService.AdminApprove")()
	}

	// Validation at the beginning
	if err := validator.Validate(req); err != nil {
		return RegistrationResponse{}, err
	}

	var out model.Registration
	now := time.Now()

	err := s.locker.WithLock(ctx, "lock:registrations:"+req.ID, 10*time.Second, func(ctx context.Context) error {
		return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
			r, err := s.regRepo.GetByID(ctx, req.ID)
			if err != nil {
				return err
			}
			if r.EmailVerifiedAt == nil {
				return fmt.Errorf("email not verified")
			}
			if r.Status == model.RegRejected {
				return fmt.Errorf("already rejected")
			}
			r.Status = model.RegApproved
			r.ApprovedBy = &req.AdminID
			r.ApprovedAt = &now
			r.RejectedReason = nil

			if err := s.regRepo.Update(ctx, r); err != nil {
				return err
			}
			out = *r
			return nil
		})
	})
	if err != nil {
		return RegistrationResponse{}, err
	}

	return RegistrationToResponse(out), nil
}

func (s *registrationService) AdminReject(ctx context.Context, req AdminRejectRequest) (RegistrationResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "RegistrationService.AdminReject")()
	}

	// Validation at the beginning
	if err := validator.Validate(req); err != nil {
		return RegistrationResponse{}, err
	}

	var out model.Registration
	now := time.Now()

	err := s.locker.WithLock(ctx, "lock:registrations:"+req.ID, 10*time.Second, func(ctx context.Context) error {
		return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
			r, err := s.regRepo.GetByID(ctx, req.ID)
			if err != nil {
				return err
			}
			if r.Status == model.RegApproved {
				return fmt.Errorf("already approved")
			}
			r.Status = model.RegRejected
			r.ApprovedBy = &req.AdminID
			r.ApprovedAt = &now
			r.RejectedReason = &req.Reason

			if err := s.regRepo.Update(ctx, r); err != nil {
				return err
			}
			out = *r
			return nil
		})
	})
	if err != nil {
		return RegistrationResponse{}, err
	}

	return RegistrationToResponse(out), nil
}

func (s *registrationService) AdminDelete(ctx context.Context, id string) error {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "RegistrationService.AdminDelete")()
	}
	return s.regRepo.Delete(ctx, id)
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
