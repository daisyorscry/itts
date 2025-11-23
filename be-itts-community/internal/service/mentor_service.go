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

type CreateMentorRequest struct {
	FullName  string              `json:"full_name" validate:"required,min=3"`
	Title     string              `json:"title"`
	Bio       string              `json:"bio"`
	AvatarURL string              `json:"avatar_url"`
	Programs  []model.ProgramEnum `json:"programs"`
	IsActive  *bool               `json:"is_active"`
	Priority  *int                `json:"priority"`
}

type UpdateMentorRequest struct {
	FullName  *string             `json:"full_name,omitempty" validate:"omitempty,min=3"`
	Title     *string             `json:"title,omitempty"`
	Bio       *string             `json:"bio,omitempty"`
	AvatarURL *string             `json:"avatar_url,omitempty"`
	Programs  []model.ProgramEnum `json:"programs,omitempty"`
	IsActive  *bool               `json:"is_active,omitempty"`
	Priority  *int                `json:"priority,omitempty"`
}

type SetMentorActiveRequest struct {
	ID     string `json:"id" validate:"required"`
	Active bool   `json:"active"`
}

type SetMentorPriorityRequest struct {
	ID       string `json:"id" validate:"required"`
	Priority int    `json:"priority" validate:"gte=0"`
}

// ========================================
// Response DTOs
// ========================================

type MentorResponse struct {
	ID        string              `json:"id"`
	FullName  string              `json:"full_name"`
	Title     string              `json:"title,omitempty"`
	Bio       string              `json:"bio,omitempty"`
	AvatarURL string              `json:"avatar_url,omitempty"`
	Programs  []model.ProgramEnum `json:"programs,omitempty"`
	IsActive  bool                `json:"is_active"`
	Priority  int                 `json:"priority"`
	CreatedAt time.Time           `json:"created_at"`
	UpdatedAt time.Time           `json:"updated_at"`
}

type MentorListResponse struct {
	Data       []MentorResponse `json:"data"`
	Total      int64            `json:"total"`
	Page       int              `json:"page"`
	PageSize   int              `json:"page_size"`
	TotalPages int              `json:"total_pages"`
}

// ========================================
// Mappers
// ========================================

func (r CreateMentorRequest) ToModel() model.Mentor {
	m := model.Mentor{
		FullName:  r.FullName,
		Programs:  r.Programs,
		IsActive:  true,
		Priority:  0,
	}
	if r.Title != "" {
		m.Title = &r.Title
	}
	if r.Bio != "" {
		m.Bio = &r.Bio
	}
	if r.AvatarURL != "" {
		m.AvatarURL = &r.AvatarURL
	}
	if r.IsActive != nil {
		m.IsActive = *r.IsActive
	}
	if r.Priority != nil {
		m.Priority = *r.Priority
	}
	return m
}

func MentorToResponse(m model.Mentor) MentorResponse {
	resp := MentorResponse{
		ID:        m.ID,
		FullName:  m.FullName,
		Programs:  m.Programs,
		IsActive:  m.IsActive,
		Priority:  m.Priority,
		CreatedAt: m.CreatedAt,
		UpdatedAt: m.UpdatedAt,
	}
	if m.Title != nil {
		resp.Title = *m.Title
	}
	if m.Bio != nil {
		resp.Bio = *m.Bio
	}
	if m.AvatarURL != nil {
		resp.AvatarURL = *m.AvatarURL
	}
	return resp
}

func MentorListToResponse(pr repository.PageResult[model.Mentor]) MentorListResponse {
	data := make([]MentorResponse, 0, len(pr.Data))
	for _, m := range pr.Data {
		data = append(data, MentorToResponse(m))
	}
	return MentorListResponse{
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

type MentorService interface {
	Create(ctx context.Context, req CreateMentorRequest) (MentorResponse, error)
	Get(ctx context.Context, id string) (MentorResponse, error)
	Update(ctx context.Context, id string, req UpdateMentorRequest) (MentorResponse, error)
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, p repository.ListParams) (MentorListResponse, error)

	SetActive(ctx context.Context, req SetMentorActiveRequest) (MentorResponse, error)
	SetPriority(ctx context.Context, req SetMentorPriorityRequest) (MentorResponse, error)
}

// ========================================
// Service Implementation
// ========================================

type mentorService struct {
	db     *gorm.DB
	repo   repository.MentorRepository
	locker lock.Locker
	tracer nr.Tracer
}

func NewMentorService(db *gorm.DB, repo repository.MentorRepository, locker lock.Locker, tracer nr.Tracer) MentorService {
	return &mentorService{db: db, repo: repo, locker: locker, tracer: tracer}
}

func (s *mentorService) Create(ctx context.Context, req CreateMentorRequest) (MentorResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "MentorService.Create")()
	}

	// Validation at the beginning
	if err := validator.Validate(req); err != nil {
		return MentorResponse{}, err
	}

	m := req.ToModel()

	if err := s.locker.WithLock(ctx, "lock:mentors:create", 5*time.Second, func(ctx context.Context) error {
		return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
			txRepo := repository.NewMentorRepository(tx)
			return txRepo.Create(ctx, &m)
		})
	}); err != nil {
		return MentorResponse{}, err
	}

	return MentorToResponse(m), nil
}

func (s *mentorService) Get(ctx context.Context, id string) (MentorResponse, error) {
	m, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return MentorResponse{}, err
	}
	return MentorToResponse(*m), nil
}

func (s *mentorService) Update(ctx context.Context, id string, req UpdateMentorRequest) (MentorResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "MentorService.Update")()
	}

	// Validation at the beginning
	if err := validator.Validate(req); err != nil {
		return MentorResponse{}, err
	}

	m, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return MentorResponse{}, err
	}

	if req.FullName != nil {
		m.FullName = *req.FullName
	}
	if req.Title != nil {
		m.Title = req.Title
	}
	if req.Bio != nil {
		m.Bio = req.Bio
	}
	if req.AvatarURL != nil {
		m.AvatarURL = req.AvatarURL
	}
	if req.Programs != nil {
		m.Programs = req.Programs
	}
	if req.IsActive != nil {
		m.IsActive = *req.IsActive
	}
	if req.Priority != nil {
		m.Priority = *req.Priority
	}

	if err := s.locker.WithLock(ctx, "lock:mentors:"+id, 5*time.Second, func(ctx context.Context) error {
		return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
			txRepo := repository.NewMentorRepository(tx)
			return txRepo.Update(ctx, m)
		})
	}); err != nil {
		return MentorResponse{}, err
	}

	return MentorToResponse(*m), nil
}

func (s *mentorService) Delete(ctx context.Context, id string) error {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "MentorService.Delete")()
	}
	return s.locker.WithLock(ctx, "lock:mentors:"+id, 5*time.Second, func(ctx context.Context) error {
		return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
			txRepo := repository.NewMentorRepository(tx)
			return txRepo.Delete(ctx, id)
		})
	})
}

func (s *mentorService) List(ctx context.Context, p repository.ListParams) (MentorListResponse, error) {
	result, err := s.repo.List(ctx, p)
	if err != nil {
		return MentorListResponse{}, err
	}
	return MentorListToResponse(*result), nil
}

func (s *mentorService) SetActive(ctx context.Context, req SetMentorActiveRequest) (MentorResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "MentorService.SetActive")()
	}

	// Validation at the beginning
	if err := validator.Validate(req); err != nil {
		return MentorResponse{}, err
	}

	m, err := s.repo.GetByID(ctx, req.ID)
	if err != nil {
		return MentorResponse{}, err
	}

	m.IsActive = req.Active

	if err := s.locker.WithLock(ctx, "lock:mentors:"+req.ID, 5*time.Second, func(ctx context.Context) error {
		return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
			txRepo := repository.NewMentorRepository(tx)
			return txRepo.Update(ctx, m)
		})
	}); err != nil {
		return MentorResponse{}, err
	}

	return MentorToResponse(*m), nil
}

func (s *mentorService) SetPriority(ctx context.Context, req SetMentorPriorityRequest) (MentorResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "MentorService.SetPriority")()
	}

	// Validation at the beginning
	if err := validator.Validate(req); err != nil {
		return MentorResponse{}, err
	}

	m, err := s.repo.GetByID(ctx, req.ID)
	if err != nil {
		return MentorResponse{}, err
	}

	m.Priority = req.Priority

	if err := s.locker.WithLock(ctx, "lock:mentors:"+req.ID, 5*time.Second, func(ctx context.Context) error {
		return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
			txRepo := repository.NewMentorRepository(tx)
			return txRepo.Update(ctx, m)
		})
	}); err != nil {
		return MentorResponse{}, err
	}

	return MentorToResponse(*m), nil
}
