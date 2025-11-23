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

type CreateRoadmapRequest struct {
	Program     model.ProgramEnum `json:"program" validate:"omitempty,oneof=networking devsecops programming"`
	MonthNumber int               `json:"month_number" validate:"required,gte=1,lte=12"`
	Title       string            `json:"title" validate:"required,min=3"`
	Description string            `json:"description"`
	SortOrder   *int              `json:"sort_order"`
	IsActive    *bool             `json:"is_active"`
}

type UpdateRoadmapRequest struct {
	Program     *model.ProgramEnum `json:"program,omitempty" validate:"omitempty,oneof=networking devsecops programming"`
	MonthNumber *int               `json:"month_number,omitempty" validate:"omitempty,gte=1,lte=12"`
	Title       *string            `json:"title,omitempty" validate:"omitempty,min=3"`
	Description *string            `json:"description,omitempty"`
	SortOrder   *int               `json:"sort_order,omitempty"`
	IsActive    *bool              `json:"is_active,omitempty"`
}

// ========================================
// Response DTOs
// ========================================

type RoadmapItemResponse struct {
	ID        string `json:"id"`
	RoadmapID string `json:"roadmap_id"`
	ItemText  string `json:"item_text"`
	SortOrder int    `json:"sort_order"`
}

type RoadmapResponse struct {
	ID          string                `json:"id"`
	Program     string                `json:"program,omitempty"`
	MonthNumber int                   `json:"month_number"`
	Title       string                `json:"title"`
	Description string                `json:"description,omitempty"`
	SortOrder   int                   `json:"sort_order"`
	IsActive    bool                  `json:"is_active"`
	Items       []RoadmapItemResponse `json:"items,omitempty"`
	CreatedAt   time.Time             `json:"created_at"`
	UpdatedAt   time.Time             `json:"updated_at"`
}

type RoadmapListResponse struct {
	Data       []RoadmapResponse `json:"data"`
	Total      int64             `json:"total"`
	Page       int               `json:"page"`
	PageSize   int               `json:"page_size"`
	TotalPages int               `json:"total_pages"`
}

// ========================================
// Mappers
// ========================================

func (r CreateRoadmapRequest) ToModel() model.Roadmap {
	rm := model.Roadmap{
		MonthNumber: r.MonthNumber,
		Title:       r.Title,
		SortOrder:   0,
		IsActive:    true,
	}
	if r.Program != "" {
		rm.Program = &r.Program
	}
	if r.Description != "" {
		rm.Description = &r.Description
	}
	if r.SortOrder != nil {
		rm.SortOrder = *r.SortOrder
	}
	if r.IsActive != nil {
		rm.IsActive = *r.IsActive
	}
	return rm
}

func RoadmapItemToResponse(m model.RoadmapItem) RoadmapItemResponse {
	return RoadmapItemResponse{
		ID:        m.ID,
		RoadmapID: m.RoadmapID,
		ItemText:  m.ItemText,
		SortOrder: m.SortOrder,
	}
}

func RoadmapToResponse(m model.Roadmap) RoadmapResponse {
	resp := RoadmapResponse{
		ID:          m.ID,
		MonthNumber: m.MonthNumber,
		Title:       m.Title,
		SortOrder:   m.SortOrder,
		IsActive:    m.IsActive,
		CreatedAt:   m.CreatedAt,
		UpdatedAt:   m.UpdatedAt,
	}
	if m.Program != nil {
		resp.Program = string(*m.Program)
	}
	if m.Description != nil {
		resp.Description = *m.Description
	}
	if len(m.Items) > 0 {
		resp.Items = make([]RoadmapItemResponse, 0, len(m.Items))
		for _, item := range m.Items {
			resp.Items = append(resp.Items, RoadmapItemToResponse(item))
		}
	}
	return resp
}

func RoadmapListToResponse(pr repository.PageResult[model.Roadmap]) RoadmapListResponse {
	data := make([]RoadmapResponse, 0, len(pr.Data))
	for _, m := range pr.Data {
		data = append(data, RoadmapToResponse(m))
	}
	return RoadmapListResponse{
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

type RoadmapService interface {
	Create(ctx context.Context, req CreateRoadmapRequest) (RoadmapResponse, error)
	Get(ctx context.Context, id string) (RoadmapResponse, error)
	Update(ctx context.Context, id string, req UpdateRoadmapRequest) (RoadmapResponse, error)
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, p repository.ListParams) (RoadmapListResponse, error)
}

// ========================================
// Service Implementation
// ========================================

type roadmapService struct {
	db     *gorm.DB
	repo   repository.RoadmapRepository
	locker lock.Locker
	tracer nr.Tracer
}

func NewRoadmapService(db *gorm.DB, repo repository.RoadmapRepository, locker lock.Locker, tracer nr.Tracer) RoadmapService {
	return &roadmapService{db: db, repo: repo, locker: locker, tracer: tracer}
}

func (s *roadmapService) Create(ctx context.Context, req CreateRoadmapRequest) (RoadmapResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "RoadmapService.Create")()
	}

	// Validation at the beginning
	if err := validator.Validate(req); err != nil {
		return RoadmapResponse{}, err
	}

	rm := req.ToModel()

	if err := s.locker.WithLock(ctx, "lock:roadmaps:create", 5*time.Second, func(ctx context.Context) error {
		return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
			txRepo := repository.NewRoadmapRepository(tx)
			return txRepo.Create(ctx, &rm)
		})
	}); err != nil {
		return RoadmapResponse{}, err
	}

	return RoadmapToResponse(rm), nil
}

func (s *roadmapService) Get(ctx context.Context, id string) (RoadmapResponse, error) {
	m, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return RoadmapResponse{}, err
	}
	return RoadmapToResponse(*m), nil
}

func (s *roadmapService) Update(ctx context.Context, id string, req UpdateRoadmapRequest) (RoadmapResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "RoadmapService.Update")()
	}

	// Validation at the beginning
	if err := validator.Validate(req); err != nil {
		return RoadmapResponse{}, err
	}

	rm, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return RoadmapResponse{}, err
	}

	if req.Program != nil {
		rm.Program = req.Program
	}
	if req.MonthNumber != nil {
		rm.MonthNumber = *req.MonthNumber
	}
	if req.Title != nil {
		rm.Title = *req.Title
	}
	if req.Description != nil {
		rm.Description = req.Description
	}
	if req.SortOrder != nil {
		rm.SortOrder = *req.SortOrder
	}
	if req.IsActive != nil {
		rm.IsActive = *req.IsActive
	}

	if err := s.locker.WithLock(ctx, "lock:roadmaps:"+id, 5*time.Second, func(ctx context.Context) error {
		return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
			txRepo := repository.NewRoadmapRepository(tx)
			return txRepo.Update(ctx, rm)
		})
	}); err != nil {
		return RoadmapResponse{}, err
	}

	return RoadmapToResponse(*rm), nil
}

func (s *roadmapService) Delete(ctx context.Context, id string) error {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "RoadmapService.Delete")()
	}
	return s.locker.WithLock(ctx, "lock:roadmaps:"+id, 5*time.Second, func(ctx context.Context) error {
		return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
			txRepo := repository.NewRoadmapRepository(tx)
			return txRepo.Delete(ctx, id)
		})
	})
}

func (s *roadmapService) List(ctx context.Context, p repository.ListParams) (RoadmapListResponse, error) {
	result, err := s.repo.List(ctx, p)
	if err != nil {
		return RoadmapListResponse{}, err
	}
	return RoadmapListToResponse(*result), nil
}
