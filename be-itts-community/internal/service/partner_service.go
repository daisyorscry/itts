package service

import (
	"context"
	"time"

	"gorm.io/gorm"

	"be-itts-community/internal/model"
	"be-itts-community/internal/repository"
	"be-itts-community/pkg/lock"
	"be-itts-community/pkg/observability/nr"
	"be-itts-community/pkg/validator"
)

// ========================================
// Request DTOs
// ========================================

type CreatePartnerRequest struct {
	Name        string            `json:"name" validate:"required,min=2"`
	Kind        model.PartnerType `json:"kind" validate:"required,oneof=lab partner_academic partner_industry"`
	Subtitle    string            `json:"subtitle"`
	Description string            `json:"description"`
	LogoURL     string            `json:"logo_url"`
	WebsiteURL  string            `json:"website_url"`
	IsActive    *bool             `json:"is_active"`
	Priority    *int              `json:"priority"`
}

type UpdatePartnerRequest struct {
	Name        *string            `json:"name,omitempty" validate:"omitempty,min=2"`
	Kind        *model.PartnerType `json:"kind,omitempty" validate:"omitempty,oneof=lab partner_academic partner_industry"`
	Subtitle    *string            `json:"subtitle,omitempty"`
	Description *string            `json:"description,omitempty"`
	LogoURL     *string            `json:"logo_url,omitempty"`
	WebsiteURL  *string            `json:"website_url,omitempty"`
	IsActive    *bool              `json:"is_active,omitempty"`
	Priority    *int               `json:"priority,omitempty"`
}

type SetPartnerActiveRequest struct {
	ID     string `json:"id" validate:"required"`
	Active bool   `json:"active"`
}

type SetPartnerPriorityRequest struct {
	ID       string `json:"id" validate:"required"`
	Priority int    `json:"priority" validate:"gte=0"`
}

// ========================================
// Response DTOs
// ========================================

type PartnerResponse struct {
	ID          string            `json:"id"`
	Name        string            `json:"name"`
	Kind        model.PartnerType `json:"kind"`
	Subtitle    string            `json:"subtitle,omitempty"`
	Description string            `json:"description,omitempty"`
	LogoURL     string            `json:"logo_url,omitempty"`
	WebsiteURL  string            `json:"website_url,omitempty"`
	IsActive    bool              `json:"is_active"`
	Priority    int               `json:"priority"`
	CreatedAt   time.Time         `json:"created_at"`
	UpdatedAt   time.Time         `json:"updated_at"`
}

type PartnerListResponse struct {
	Data       []PartnerResponse `json:"data"`
	Total      int64             `json:"total"`
	Page       int               `json:"page"`
	PageSize   int               `json:"page_size"`
	TotalPages int               `json:"total_pages"`
}

// ========================================
// Mappers
// ========================================

func (r CreatePartnerRequest) ToModel() model.Partner {
	p := model.Partner{
		Name:     r.Name,
		Kind:     r.Kind,
		IsActive: true,
		Priority: 0,
	}
	if r.Subtitle != "" {
		p.Subtitle = &r.Subtitle
	}
	if r.Description != "" {
		p.Description = &r.Description
	}
	if r.LogoURL != "" {
		p.LogoURL = &r.LogoURL
	}
	if r.WebsiteURL != "" {
		p.WebsiteURL = &r.WebsiteURL
	}
	if r.IsActive != nil {
		p.IsActive = *r.IsActive
	}
	if r.Priority != nil {
		p.Priority = *r.Priority
	}
	return p
}

func PartnerToResponse(m model.Partner) PartnerResponse {
	resp := PartnerResponse{
		ID:        m.ID,
		Name:      m.Name,
		Kind:      m.Kind,
		IsActive:  m.IsActive,
		Priority:  m.Priority,
		CreatedAt: m.CreatedAt,
		UpdatedAt: m.UpdatedAt,
	}
	if m.Subtitle != nil {
		resp.Subtitle = *m.Subtitle
	}
	if m.Description != nil {
		resp.Description = *m.Description
	}
	if m.LogoURL != nil {
		resp.LogoURL = *m.LogoURL
	}
	if m.WebsiteURL != nil {
		resp.WebsiteURL = *m.WebsiteURL
	}
	return resp
}

func PartnerListToResponse(pr repository.PageResult[model.Partner]) PartnerListResponse {
	data := make([]PartnerResponse, 0, len(pr.Data))
	for _, m := range pr.Data {
		data = append(data, PartnerToResponse(m))
	}
	return PartnerListResponse{
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

type PartnerService interface {
	Create(ctx context.Context, req CreatePartnerRequest) (PartnerResponse, error)
	Get(ctx context.Context, id string) (PartnerResponse, error)
	Update(ctx context.Context, id string, req UpdatePartnerRequest) (PartnerResponse, error)
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, p repository.ListParams) (PartnerListResponse, error)

	SetActive(ctx context.Context, req SetPartnerActiveRequest) (PartnerResponse, error)
	SetPriority(ctx context.Context, req SetPartnerPriorityRequest) (PartnerResponse, error)
}

// ========================================
// Service Implementation
// ========================================

type partnerService struct {
	db     *gorm.DB
	repo   repository.PartnerRepository
	locker lock.Locker
	tracer nr.Tracer
}

func NewPartnerService(db *gorm.DB, repo repository.PartnerRepository, locker lock.Locker, tracer nr.Tracer) PartnerService {
	return &partnerService{db: db, repo: repo, locker: locker, tracer: tracer}
}

func (s *partnerService) Create(ctx context.Context, req CreatePartnerRequest) (PartnerResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "PartnerService.Create")()
	}

	// Validation at the beginning
	if err := validator.Validate(req); err != nil {
		return PartnerResponse{}, err
	}

	p := req.ToModel()

	if err := s.locker.WithLock(ctx, "lock:partners:create", 5*time.Second, func(ctx context.Context) error {
		return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
			txRepo := repository.NewPartnerRepository(tx)
			return txRepo.Create(ctx, &p)
		})
	}); err != nil {
		return PartnerResponse{}, err
	}

	return PartnerToResponse(p), nil
}

func (s *partnerService) Get(ctx context.Context, id string) (PartnerResponse, error) {
	m, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return PartnerResponse{}, err
	}
	return PartnerToResponse(*m), nil
}

func (s *partnerService) Update(ctx context.Context, id string, req UpdatePartnerRequest) (PartnerResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "PartnerService.Update")()
	}

	// Validation at the beginning
	if err := validator.Validate(req); err != nil {
		return PartnerResponse{}, err
	}

	p, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return PartnerResponse{}, err
	}

	if req.Name != nil {
		p.Name = *req.Name
	}
	if req.Kind != nil {
		p.Kind = *req.Kind
	}
	if req.Subtitle != nil {
		p.Subtitle = req.Subtitle
	}
	if req.Description != nil {
		p.Description = req.Description
	}
	if req.LogoURL != nil {
		p.LogoURL = req.LogoURL
	}
	if req.WebsiteURL != nil {
		p.WebsiteURL = req.WebsiteURL
	}
	if req.IsActive != nil {
		p.IsActive = *req.IsActive
	}
	if req.Priority != nil {
		p.Priority = *req.Priority
	}

	if err := s.locker.WithLock(ctx, "lock:partners:"+id, 5*time.Second, func(ctx context.Context) error {
		return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
			txRepo := repository.NewPartnerRepository(tx)
			return txRepo.Update(ctx, p)
		})
	}); err != nil {
		return PartnerResponse{}, err
	}

	return PartnerToResponse(*p), nil
}

func (s *partnerService) Delete(ctx context.Context, id string) error {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "PartnerService.Delete")()
	}
	return s.locker.WithLock(ctx, "lock:partners:"+id, 5*time.Second, func(ctx context.Context) error {
		return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
			txRepo := repository.NewPartnerRepository(tx)
			return txRepo.Delete(ctx, id)
		})
	})
}

func (s *partnerService) List(ctx context.Context, p repository.ListParams) (PartnerListResponse, error) {
	result, err := s.repo.List(ctx, p)
	if err != nil {
		return PartnerListResponse{}, err
	}
	return PartnerListToResponse(*result), nil
}

func (s *partnerService) SetActive(ctx context.Context, req SetPartnerActiveRequest) (PartnerResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "PartnerService.SetActive")()
	}

	// Validation at the beginning
	if err := validator.Validate(req); err != nil {
		return PartnerResponse{}, err
	}

	p, err := s.repo.GetByID(ctx, req.ID)
	if err != nil {
		return PartnerResponse{}, err
	}

	p.IsActive = req.Active

	if err := s.locker.WithLock(ctx, "lock:partners:"+req.ID, 5*time.Second, func(ctx context.Context) error {
		return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
			txRepo := repository.NewPartnerRepository(tx)
			return txRepo.Update(ctx, p)
		})
	}); err != nil {
		return PartnerResponse{}, err
	}

	return PartnerToResponse(*p), nil
}

func (s *partnerService) SetPriority(ctx context.Context, req SetPartnerPriorityRequest) (PartnerResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "PartnerService.SetPriority")()
	}

	// Validation at the beginning
	if err := validator.Validate(req); err != nil {
		return PartnerResponse{}, err
	}

	p, err := s.repo.GetByID(ctx, req.ID)
	if err != nil {
		return PartnerResponse{}, err
	}

	p.Priority = req.Priority

	if err := s.locker.WithLock(ctx, "lock:partners:"+req.ID, 5*time.Second, func(ctx context.Context) error {
		return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
			txRepo := repository.NewPartnerRepository(tx)
			return txRepo.Update(ctx, p)
		})
	}); err != nil {
		return PartnerResponse{}, err
	}

	return PartnerToResponse(*p), nil
}
