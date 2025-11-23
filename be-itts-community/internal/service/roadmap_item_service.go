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

type roadmapItemService struct {
	repo   repository.RoadmapItemRepository
	locker lock.Locker
	tracer nr.Tracer
}

func (s *roadmapItemService) Create(ctx context.Context, req model.CreateRoadmapItemRequest) (model.RoadmapItemDetailResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "RoadmapItemService.Create")()
	}

	if err := validator.Validate(req); err != nil {
		return model.RoadmapItemDetailResponse{}, core.ValidationError(err)
	}

	it := req.ToModel()

	if err := s.locker.WithLock(ctx, "lock:roadmap_items:create", 5*time.Second, func(ctx context.Context) error {
		return s.repo.RunInTransaction(ctx, func(txCtx context.Context) error {
			return s.repo.Create(txCtx, &it)
		})
	}); err != nil {
		return model.RoadmapItemDetailResponse{}, core.InternalServerError("failed to create roadmap item").WithError(err)
	}

	return model.RoadmapItemDetailToResponse(it), nil
}

func (s *roadmapItemService) Get(ctx context.Context, id string) (model.RoadmapItemDetailResponse, error) {
	m, err := s.repo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.RoadmapItemDetailResponse{}, core.NotFound("roadmap_item", id)
		}
		return model.RoadmapItemDetailResponse{}, core.InternalServerError("failed to fetch roadmap item").WithError(err)
	}
	return model.RoadmapItemDetailToResponse(*m), nil
}

func (s *roadmapItemService) Update(ctx context.Context, id string, req model.UpdateRoadmapItemRequest) (model.RoadmapItemDetailResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "RoadmapItemService.Update")()
	}

	if err := validator.Validate(req); err != nil {
		return model.RoadmapItemDetailResponse{}, core.ValidationError(err)
	}

	it, err := s.repo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.RoadmapItemDetailResponse{}, core.NotFound("roadmap_item", id)
		}
		return model.RoadmapItemDetailResponse{}, core.InternalServerError("failed to fetch roadmap item").WithError(err)
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
		return s.repo.RunInTransaction(ctx, func(txCtx context.Context) error {
			return s.repo.Update(txCtx, it)
		})
	}); err != nil {
		return model.RoadmapItemDetailResponse{}, core.InternalServerError("failed to update roadmap item").WithError(err)
	}

	return model.RoadmapItemDetailToResponse(*it), nil
}

func (s *roadmapItemService) Delete(ctx context.Context, id string) error {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "RoadmapItemService.Delete")()
	}
	return s.locker.WithLock(ctx, "lock:roadmap_items:"+id, 5*time.Second, func(ctx context.Context) error {
		return s.repo.RunInTransaction(ctx, func(txCtx context.Context) error {
			return s.repo.Delete(txCtx, id)
		})
	})
}

func (s *roadmapItemService) List(ctx context.Context, p repository.ListParams) (model.RoadmapItemListResponse, error) {
	result, err := s.repo.List(ctx, p)
	if err != nil {
		return model.RoadmapItemListResponse{}, err
	}
	return roadmapItemListToResponse(*result), nil
}

func roadmapItemListToResponse(pr repository.PageResult[model.RoadmapItem]) model.RoadmapItemListResponse {
	data := make([]model.RoadmapItemDetailResponse, 0, len(pr.Data))
	for _, m := range pr.Data {
		data = append(data, model.RoadmapItemDetailToResponse(m))
	}
	return model.RoadmapItemListResponse{
		Data:       data,
		Total:      pr.Total,
		Page:       pr.Page,
		PageSize:   pr.PageSize,
		TotalPages: pr.TotalPages,
	}
}
