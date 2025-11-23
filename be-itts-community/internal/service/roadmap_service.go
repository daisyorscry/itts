package service

import (
	"context"
	"errors"
	"time"

	"github.com/daisyorscry/itts/core"
	"gorm.io/gorm"

	"be-itts-community/internal/model"
	"be-itts-community/internal/repository"
	"be-itts-community/pkg/lock"
	"be-itts-community/pkg/observability/nr"
	"be-itts-community/pkg/validator"
)

type roadmapService struct {
	repo   repository.RoadmapRepository
	locker lock.Locker
	tracer nr.Tracer
}

func (s *roadmapService) Create(ctx context.Context, req model.CreateRoadmapRequest) (model.RoadmapResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "RoadmapService.Create")()
	}

	if err := validator.Validate(req); err != nil {
		return model.RoadmapResponse{}, core.ValidationError(err)
	}

	rm := req.ToModel()

	if err := s.locker.WithLock(ctx, "lock:roadmaps:create", 5*time.Second, func(ctx context.Context) error {
		return s.repo.RunInTransaction(ctx, func(txCtx context.Context) error {
			return s.repo.Create(txCtx, &rm)
		})
	}); err != nil {
		return model.RoadmapResponse{}, core.InternalServerError("failed to create roadmap").WithError(err)
	}

	return model.RoadmapToResponse(rm), nil
}

func (s *roadmapService) Get(ctx context.Context, id string) (model.RoadmapResponse, error) {
	m, err := s.repo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.RoadmapResponse{}, core.NotFound("roadmap", id)
		}
		return model.RoadmapResponse{}, core.InternalServerError("failed to fetch roadmap").WithError(err)
	}
	return model.RoadmapToResponse(*m), nil
}

func (s *roadmapService) Update(ctx context.Context, id string, req model.UpdateRoadmapRequest) (model.RoadmapResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "RoadmapService.Update")()
	}

	if err := validator.Validate(req); err != nil {
		return model.RoadmapResponse{}, core.ValidationError(err)
	}

	rm, err := s.repo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.RoadmapResponse{}, core.NotFound("roadmap", id)
		}
		return model.RoadmapResponse{}, core.InternalServerError("failed to fetch roadmap").WithError(err)
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
		return s.repo.RunInTransaction(ctx, func(txCtx context.Context) error {
			return s.repo.Update(txCtx, rm)
		})
	}); err != nil {
		return model.RoadmapResponse{}, core.InternalServerError("failed to update roadmap").WithError(err)
	}

	return model.RoadmapToResponse(*rm), nil
}

func (s *roadmapService) Delete(ctx context.Context, id string) error {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "RoadmapService.Delete")()
	}
	return s.locker.WithLock(ctx, "lock:roadmaps:"+id, 5*time.Second, func(ctx context.Context) error {
		return s.repo.RunInTransaction(ctx, func(txCtx context.Context) error {
			return s.repo.Delete(txCtx, id)
		})
	})
}

func (s *roadmapService) List(ctx context.Context, p repository.ListParams) (model.RoadmapListResponse, error) {
	result, err := s.repo.List(ctx, p)
	if err != nil {
		return model.RoadmapListResponse{}, core.InternalServerError("failed to list roadmaps").WithError(err)
	}
	return roadmapListToResponse(*result), nil
}

func roadmapListToResponse(pr repository.PageResult[model.Roadmap]) model.RoadmapListResponse {
	data := make([]model.RoadmapResponse, 0, len(pr.Data))
	for _, m := range pr.Data {
		data = append(data, model.RoadmapToResponse(m))
	}
	return model.RoadmapListResponse{
		Data:       data,
		Total:      pr.Total,
		Page:       pr.Page,
		PageSize:   pr.PageSize,
		TotalPages: pr.TotalPages,
	}
}
