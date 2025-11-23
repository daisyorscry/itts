package service

import (
	"context"

	"be-itts-community/internal/model"
	"be-itts-community/internal/repository"
	"be-itts-community/pkg/lock"
	"be-itts-community/pkg/observability/nr"
)

type RoadmapItemService interface {
	Create(ctx context.Context, req model.CreateRoadmapItemRequest) (model.RoadmapItemDetailResponse, error)
	Get(ctx context.Context, id string) (model.RoadmapItemDetailResponse, error)
	Update(ctx context.Context, id string, req model.UpdateRoadmapItemRequest) (model.RoadmapItemDetailResponse, error)
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, p repository.ListParams) (model.RoadmapItemListResponse, error)
}

func NewRoadmapItemService(repo repository.RoadmapItemRepository, locker lock.Locker, tracer nr.Tracer) RoadmapItemService {
	return &roadmapItemService{repo: repo, locker: locker, tracer: tracer}
}
