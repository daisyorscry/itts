package service

import (
	"context"

	"be-itts-community/internal/model"
	"be-itts-community/internal/repository"
	"be-itts-community/pkg/lock"
	"be-itts-community/pkg/observability/nr"
)

type RoadmapService interface {
	Create(ctx context.Context, req model.CreateRoadmapRequest) (model.RoadmapResponse, error)
	Get(ctx context.Context, id string) (model.RoadmapResponse, error)
	Update(ctx context.Context, id string, req model.UpdateRoadmapRequest) (model.RoadmapResponse, error)
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, p repository.ListParams) (model.RoadmapListResponse, error)
}

func NewRoadmapService(repo repository.RoadmapRepository, locker lock.Locker, tracer nr.Tracer) RoadmapService {
	return &roadmapService{repo: repo, locker: locker, tracer: tracer}
}
