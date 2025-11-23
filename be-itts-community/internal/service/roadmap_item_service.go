package service

import (
	"context"
	"time"

	"gorm.io/gorm"

	"be-itts-community/internal/model"
	"be-itts-community/internal/repository"
	"be-itts-community/pkg/lock"
	"be-itts-community/pkg/observability/nr"
)

type RoadmapItemService interface {
	Create(ctx context.Context, in CreateRoadmapItem) (*model.RoadmapItem, error)
	Get(ctx context.Context, id string) (*model.RoadmapItem, error)
	Update(ctx context.Context, id string, in UpdateRoadmapItem) (*model.RoadmapItem, error)
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, p *repository.ListParams) (*repository.PageResult[model.RoadmapItem], error)
}

type CreateRoadmapItem struct {
	RoadmapID string `json:"roadmap_id" validate:"required,uuid4"`
	ItemText  string `json:"item_text" validate:"required"`
	SortOrder *int   `json:"sort_order"`
}
type UpdateRoadmapItem struct {
	RoadmapID *string `json:"roadmap_id,omitempty"`
	ItemText  *string `json:"item_text,omitempty"`
	SortOrder *int    `json:"sort_order,omitempty"`
}

type roadmapItemService struct {
	db     *gorm.DB
	repo   repository.RoadmapItemRepository
	locker lock.Locker
	tracer nr.Tracer
}

func NewRoadmapItemService(db *gorm.DB, repo repository.RoadmapItemRepository, locker lock.Locker, tracer nr.Tracer) RoadmapItemService {
	return &roadmapItemService{db: db, repo: repo, locker: locker, tracer: tracer}
}

func (s *roadmapItemService) Create(ctx context.Context, in CreateRoadmapItem) (*model.RoadmapItem, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "RoadmapItemService.Create")()
	}
	it := &model.RoadmapItem{
		RoadmapID: in.RoadmapID,
		ItemText:  in.ItemText,
	}
	if in.SortOrder != nil {
		it.SortOrder = *in.SortOrder
	}
	if err := s.locker.WithLock(ctx, "lock:roadmap_items:create", 5*time.Second, func(ctx context.Context) error {
		return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
			txRepo := repository.NewRoadmapItemRepository(tx)
			return txRepo.Create(ctx, it)
		})
	}); err != nil {
		return nil, err
	}
	return it, nil
}

func (s *roadmapItemService) Get(ctx context.Context, id string) (*model.RoadmapItem, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *roadmapItemService) Update(ctx context.Context, id string, in UpdateRoadmapItem) (*model.RoadmapItem, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "RoadmapItemService.Update")()
	}
	it, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if in.RoadmapID != nil {
		it.RoadmapID = *in.RoadmapID
	}
	if in.ItemText != nil {
		it.ItemText = *in.ItemText
	}
	if in.SortOrder != nil {
		it.SortOrder = *in.SortOrder
	}
	if err := s.locker.WithLock(ctx, "lock:roadmap_items:"+id, 5*time.Second, func(ctx context.Context) error {
		return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
			txRepo := repository.NewRoadmapItemRepository(tx)
			return txRepo.Update(ctx, it)
		})
	}); err != nil {
		return nil, err
	}
	return it, nil
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

func (s *roadmapItemService) List(ctx context.Context, p *repository.ListParams) (*repository.PageResult[model.RoadmapItem], error) {
	return s.repo.List(ctx, p)
}
