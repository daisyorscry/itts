package service

import (
	"context"

	"be-itts-community/internal/model"
	"be-itts-community/internal/repository"
	"be-itts-community/pkg/lock"
	"be-itts-community/pkg/observability/nr"
)

type EventService interface {
	// Events
	Create(ctx context.Context, req model.CreateEventRequest) (model.EventResponse, error)
	Get(ctx context.Context, id string) (model.EventResponse, error)
	GetBySlug(ctx context.Context, slug string) (model.EventResponse, error)
	Update(ctx context.Context, id string, req model.UpdateEventRequest) (model.EventResponse, error)
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, p repository.ListParams) (model.EventListResponse, error)
	SetStatus(ctx context.Context, req model.SetEventStatusRequest) (model.EventResponse, error)
}

func NewEventService(repo repository.EventRepository, locker lock.Locker, tracer nr.Tracer) EventService {
	return &eventService{repo: repo, locker: locker, tracer: tracer}
}
