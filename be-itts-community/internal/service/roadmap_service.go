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

type RoadmapService interface {
	Create(ctx context.Context, in CreateRoadmap) (*model.Roadmap, error)
	Get(ctx context.Context, id string) (*model.Roadmap, error)
	Update(ctx context.Context, id string, in UpdateRoadmap) (*model.Roadmap, error)
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, p *repository.ListParams) (*repository.PageResult[model.Roadmap], error)
}

type CreateRoadmap struct {
	Program     *model.ProgramEnum `json:"program"` // nullable
	MonthNumber int                `json:"month_number" validate:"required,gte=1,lte=12"`
	Title       string             `json:"title" validate:"required"`
	Description *string            `json:"description"`
	SortOrder   *int               `json:"sort_order"`
	IsActive    *bool              `json:"is_active"`
}
type UpdateRoadmap struct {
	Program     *model.ProgramEnum `json:"program"`
	MonthNumber *int               `json:"month_number" validate:"omitempty,gte=1,lte=12"`
	Title       *string            `json:"title"`
	Description *string            `json:"description"`
	SortOrder   *int               `json:"sort_order"`
	IsActive    *bool              `json:"is_active"`
}

type roadmapService struct {
	db     *gorm.DB
	repo   repository.RoadmapRepository
	locker lock.Locker
	tracer nr.Tracer
}

func NewRoadmapService(db *gorm.DB, repo repository.RoadmapRepository, locker lock.Locker, tracer nr.Tracer) RoadmapService {
	return &roadmapService{db: db, repo: repo, locker: locker, tracer: tracer}
}

func (s *roadmapService) Create(ctx context.Context, in CreateRoadmap) (*model.Roadmap, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "RoadmapService.Create")()
	}
	rm := &model.Roadmap{
		Program:     in.Program,
		MonthNumber: in.MonthNumber,
		Title:       in.Title,
		Description: in.Description,
	}
	if in.SortOrder != nil {
		rm.SortOrder = *in.SortOrder
	}
	if in.IsActive != nil {
		rm.IsActive = *in.IsActive
	}
	if err := s.locker.WithLock(ctx, "lock:roadmaps:create", 5*time.Second, func(ctx context.Context) error {
		return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
			txRepo := repository.NewRoadmapRepository(tx)
			return txRepo.Create(ctx, rm)
		})
	}); err != nil {
		return nil, err
	}
	return rm, nil
}

func (s *roadmapService) Get(ctx context.Context, id string) (*model.Roadmap, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *roadmapService) Update(ctx context.Context, id string, in UpdateRoadmap) (*model.Roadmap, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "RoadmapService.Update")()
	}
	rm, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if in.Program != nil {
		rm.Program = in.Program
	}
	if in.MonthNumber != nil {
		rm.MonthNumber = *in.MonthNumber
	}
	if in.Title != nil {
		rm.Title = *in.Title
	}
	if in.Description != nil {
		rm.Description = in.Description
	}
	if in.SortOrder != nil {
		rm.SortOrder = *in.SortOrder
	}
	if in.IsActive != nil {
		rm.IsActive = *in.IsActive
	}
	if err := s.locker.WithLock(ctx, "lock:roadmaps:"+id, 5*time.Second, func(ctx context.Context) error {
		return s.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
			txRepo := repository.NewRoadmapRepository(tx)
			return txRepo.Update(ctx, rm)
		})
	}); err != nil {
		return nil, err
	}
	return rm, nil
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

func (s *roadmapService) List(ctx context.Context, p *repository.ListParams) (*repository.PageResult[model.Roadmap], error) {
	return s.repo.List(ctx, p)
}
