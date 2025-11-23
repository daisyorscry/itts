package service

import (
	"context"

	"be-itts-community/internal/model"
	"be-itts-community/internal/repository"
	"be-itts-community/pkg/lock"
	"be-itts-community/pkg/observability/nr"
)

type EventSpeakerService interface {
	Create(ctx context.Context, req model.CreateSpeakerRequest) (model.SpeakerResponse, error)
	Get(ctx context.Context, id string) (model.SpeakerResponse, error)
	Update(ctx context.Context, id string, req model.UpdateSpeakerRequest) (model.SpeakerResponse, error)
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, p repository.ListParams) (model.SpeakerListResponse, error)
	SetOrder(ctx context.Context, req model.SetSpeakerOrderRequest) (model.SpeakerResponse, error)
}

func NewEventSpeakerService(repo repository.EventSpeakerRepository, locker lock.Locker, tracer nr.Tracer) EventSpeakerService {
	return &eventSpeakerService{repo: repo, locker: locker, tracer: tracer}
}
