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

type CreateRoadmapItemRequest struct {
	RoadmapID string `json:"roadmap_id" validate:"required,uuid4"`
	ItemText  string `json:"item_text" validate:"required,min=1"`
	SortOrder *int   `json:"sort_order"`
}

type UpdateRoadmapItemRequest struct {
	RoadmapID *string `json:"roadmap_id,omitempty" validate:"omitempty,uuid4"`
	ItemText  *string `json:"item_text,omitempty" validate:"omitempty,min=1"`
	SortOrder *int    `json:"sort_order,omitempty"`
}

// ========================================
// Response DTOs
// ========================================

type RoadmapItemDetailResponse struct {
	ID        string `json:"id"`
	RoadmapID string `json:"roadmap_id"`
	ItemText  string `json:"item_text"`
	SortOrder int    `json:"sort_order"`
}

type RoadmapItemListResponse struct {
	Data       []RoadmapItemDetailResponse `json:"data"`
	Total      int64                       `json:"total"`
	Page       int                         `json:"page"`
	PageSize   int                         `json:"page_size"`
	TotalPages int                         `json:"total_pages"`
}

// ========================================
// Mappers
// ========================================

func (r CreateRoadmapItemRequest) ToModel() model.RoadmapItem {
	it := model.RoadmapItem{
		RoadmapID: r.RoadmapID,
		ItemText:  r.ItemText,
		SortOrder: 0,
	}
	if r.SortOrder != nil {
		it.SortOrder = *r.SortOrder
	}
	return it
}

func RoadmapItemDetailToResponse(m model.RoadmapItem) RoadmapItemDetailResponse {
	return RoadmapItemDetailResponse{
		ID:        m.ID,
		RoadmapID: m.RoadmapID,
		ItemText:  m.ItemText,
		SortOrder: m.SortOrder,
	}
}

func RoadmapItemListToResponse(pr repository.PageResult[model.RoadmapItem]) RoadmapItemListResponse {
	data := make([]RoadmapItemDetailResponse, 0, len(pr.Data))
	for _, m := range pr.Data {
		data = append(data, RoadmapItemDetailToResponse(m))
	}
	return RoadmapItemListResponse{
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

type RoadmapItemService interface {
	Create(ctx context.Context, req CreateRoadmapItemRequest) (RoadmapItemDetailResponse, error)
	Get(ctx context.Context, id string) (RoadmapItemDetailResponse, error)
	Update(ctx context.Context, id string, req UpdateRoadmapItemRequest) (RoadmapItemDetailResponse, error)
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, p repository.ListParams) (RoadmapItemListResponse, error)
}

// ========================================
// Service Implementation
// ========================================

type roadmapItemService struct {
	db     *gorm.DB
	repo   repository.RoadmapItemRepository
	locker lock.Locker
	tracer nr.Tracer
}

func NewRoadmapItemService(db *gorm.DB, repo repository.RoadmapItemRepository, locker lock.Locker, tracer nr.Tracer) RoadmapItemService {
	return &roadmapItemService{db: db, repo: repo, locker: locker, tracer: tracer}
}

func (s *roadmapItemService) Create(ctx context.Context, req CreateRoadmapItemRequest) (RoadmapItemDetailResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "RoadmapItemService.Create")()
	}

	// Validation at the beginning
	if err := validator.Validate(req); err != nil {
		return RoadmapItemDetailResponse{}, err
	}

	it := req.ToModel()

	if err := s.locker.WithLock(ctx, "lock:roadmap_items:create", 5*time.Second, func(ctx context.Context) error {
		return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
			txRepo := repository.NewRoadmapItemRepository(tx)
			return txRepo.Create(ctx, &it)
		})
	}); err != nil {
		return RoadmapItemDetailResponse{}, err
	}

	return RoadmapItemDetailToResponse(it), nil
}

func (s *roadmapItemService) Get(ctx context.Context, id string) (RoadmapItemDetailResponse, error) {
	m, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return RoadmapItemDetailResponse{}, err
	}
	return RoadmapItemDetailToResponse(*m), nil
}

func (s *roadmapItemService) Update(ctx context.Context, id string, req UpdateRoadmapItemRequest) (RoadmapItemDetailResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "RoadmapItemService.Update")()
	}

	// Validation at the beginning
	if err := validator.Validate(req); err != nil {
		return RoadmapItemDetailResponse{}, err
	}

	it, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return RoadmapItemDetailResponse{}, err
	}

	if req.RoadmapID != nil {
		it.RoadmapID = *req.RoadmapID
	}
	if req.ItemText != nil {
		it.ItemText = *req.ItemText
	}
	if req.SortOrder != nil {
		it.SortOrder = *req.SortOrder
	}

	if err := s.locker.WithLock(ctx, "lock:roadmap_items:"+id, 5*time.Second, func(ctx context.Context) error {
		return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
			txRepo := repository.NewRoadmapItemRepository(tx)
			return txRepo.Update(ctx, it)
		})
	}); err != nil {
		return RoadmapItemDetailResponse{}, err
	}

	return RoadmapItemDetailToResponse(*it), nil
}

func (s *roadmapItemService) Delete(ctx context.Context, id string) error {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "RoadmapItemService.Delete")()
	}
	return s.locker.WithLock(ctx, "lock:roadmap_items:"+id, 5*time.Second, func(ctx context.Context) error {
		return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
			txRepo := repository.NewRoadmapItemRepository(tx)
			return txRepo.Delete(ctx, id)
		})
	})
}

func (s *roadmapItemService) List(ctx context.Context, p repository.ListParams) (RoadmapItemListResponse, error) {
	result, err := s.repo.List(ctx, p)
	if err != nil {
		return RoadmapItemListResponse{}, err
	}
	return RoadmapItemListToResponse(*result), nil
}
