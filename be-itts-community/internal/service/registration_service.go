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

    "be-itts-community/internal/repository"
    "be-itts-community/internal/model"
    "be-itts-community/pkg/lock"
    "be-itts-community/pkg/observability/nr"
)

type Mailer interface {
	Send(to, subject, htmlBody string) error
}

type RegisterRequest struct {
	FullName   string            `json:"full_name" validate:"required,min=3"`
	Email      string            `json:"email" validate:"required,email"`
	Program    model.ProgramEnum `json:"program" validate:"required,oneof=networking devsecops programming"`
	StudentID  int               `json:"student_id" validate:"required"`
	IntakeYear int               `json:"intake_year" validate:"required,gte=2000,lte=2100"`
	Motivation string            `json:"motivation" validate:"required,min=10"`
}

type RegistrationService interface {
	Register(ctx context.Context, req RegisterRequest, verifyURL string) (*model.Registration, error)
	VerifyEmail(ctx context.Context, rawToken string) (*model.Registration, error)

	AdminList(ctx context.Context, p *repository.ListParams) (*repository.PageResult[model.Registration], error)
	AdminGet(ctx context.Context, id string) (*model.Registration, error)
	AdminApprove(ctx context.Context, id, adminID string) (*model.Registration, error)
	AdminReject(ctx context.Context, id, adminID, reason string) (*model.Registration, error)
	AdminDelete(ctx context.Context, id string) error
}

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
        locker: locker, tracer: tracer,
    }
}

func (s *registrationService) Register(ctx context.Context, req RegisterRequest, verifyURL string) (*model.Registration, error) {
    if s.tracer != nil { defer s.tracer.StartSegment(ctx, "RegistrationService.Register")() }
    if _, err := s.regRepo.FindByEmail(ctx, req.Email); err == nil {
        return nil, fmt.Errorf("email already registered")
    } else if !errors.Is(err, gorm.ErrRecordNotFound) {
        return nil, err
    }

	reg := &model.Registration{
		FullName:   req.FullName,
		Email:      req.Email,
		Program:    req.Program,
		StudentID:  strconv.Itoa(req.StudentID),
		IntakeYear: req.IntakeYear,
		Motivation: req.Motivation,
		Status:     model.RegPending,
	}

	var rawToken string

    if err := s.locker.WithLock(ctx, "lock:registrations:"+req.Email, 10*time.Second, func(ctx context.Context) error {
        return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
            if err := tx.Create(reg).Error; err != nil {
                return err
            }
            tRaw, tHash, err := generateToken()
            if err != nil {
                return err
            }
            rawToken = tRaw

		ev := &model.EmailVerification{
			RegistrationID: reg.ID,
			TokenHash:      tHash,
			ExpiresAt:      time.Now().Add(s.tokenTTL),
		}
		if err := tx.Create(ev).Error; err != nil {
			return err
		}
            return nil
        })
    }); err != nil {
        return nil, err
    }

	if s.mailer != nil && verifyURL != "" {
		link := fmt.Sprintf("%s?token=%s", verifyURL, rawToken)
		body := fmt.Sprintf(
			`<p>Halo %s,</p>
<p>Silakan verifikasi email untuk pendaftaran program %s.</p>
<p><a href="%s">Klik untuk verifikasi</a></p>
<p>Berlaku 24 jam.</p>`, reg.FullName, reg.Program, link)
		if err := s.mailer.Send(reg.Email, "Verifikasi Email ITTS Community", body); err != nil {
			return reg, fmt.Errorf("failed to send verification email: %w", err)
		}
	}

	return reg, nil
}

func (s *registrationService) VerifyEmail(ctx context.Context, rawToken string) (*model.Registration, error) {
    if s.tracer != nil { defer s.tracer.StartSegment(ctx, "RegistrationService.VerifyEmail")() }
    if rawToken == "" {
        return nil, errors.New("missing token")
    }
	sum := sha256.Sum256([]byte(rawToken))
	hashHex := hex.EncodeToString(sum[:])

	ev, err := s.evRepo.FindValidByHash(ctx, hashHex)
	if err != nil {
		return nil, fmt.Errorf("invalid or expired token")
	}

	var reg *model.Registration
	now := time.Now()

    if err := s.locker.WithLock(ctx, "lock:registrations:verify:"+hashHex, 10*time.Second, func(ctx context.Context) error {
        return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
            if err := s.evRepo.MarkUsed(ctx, ev.ID, now); err != nil {
                return err
            }
            var r model.Registration
            if err := tx.First(&r, "id = ?", ev.RegistrationID).Error; err != nil {
                return err
            }
            if r.EmailVerifiedAt == nil {
                r.EmailVerifiedAt = &now
                if err := tx.Save(&r).Error; err != nil {
                    return err
                }
            }
            reg = &r
            return nil
        })
    }); err != nil {
        return nil, err
    }
    return reg, nil
}

func (s *registrationService) AdminList(ctx context.Context, p *repository.ListParams) (*repository.PageResult[model.Registration], error) {
	return s.regRepo.List(ctx, p)
}

func (s *registrationService) AdminGet(ctx context.Context, id string) (*model.Registration, error) {
	return s.regRepo.GetByID(ctx, id)
}

func (s *registrationService) AdminApprove(ctx context.Context, id, adminID string) (*model.Registration, error) {
    if s.tracer != nil { defer s.tracer.StartSegment(ctx, "RegistrationService.AdminApprove")() }
    var out *model.Registration
    now := time.Now()

    err := s.locker.WithLock(ctx, "lock:registrations:"+id, 10*time.Second, func(ctx context.Context) error {
        return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
            r, err := s.regRepo.GetByID(ctx, id)
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
            r.ApprovedBy = &adminID
            r.ApprovedAt = &now
            r.RejectedReason = nil

            if err := s.regRepo.Update(ctx, r); err != nil {
                return err
            }
            out = r
            return nil
        })
    })
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (s *registrationService) AdminReject(ctx context.Context, id, adminID, reason string) (*model.Registration, error) {
    if s.tracer != nil { defer s.tracer.StartSegment(ctx, "RegistrationService.AdminReject")() }
    var out *model.Registration
    now := time.Now()

    err := s.locker.WithLock(ctx, "lock:registrations:"+id, 10*time.Second, func(ctx context.Context) error {
        return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
            r, err := s.regRepo.GetByID(ctx, id)
            if err != nil {
                return err
            }
            if r.Status == model.RegApproved {
                return fmt.Errorf("already approved")
            }
            r.Status = model.RegRejected
            r.ApprovedBy = &adminID
            r.ApprovedAt = &now
            r.RejectedReason = &reason

            if err := s.regRepo.Update(ctx, r); err != nil {
                return err
            }
            out = r
            return nil
        })
    })
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (s *registrationService) AdminDelete(ctx context.Context, id string) error {
    if s.tracer != nil { defer s.tracer.StartSegment(ctx, "RegistrationService.AdminDelete")() }
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
