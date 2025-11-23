package service

import (
	"context"
	"time"

	"be-itts-community/internal/model"
	"be-itts-community/internal/repository"
	"be-itts-community/pkg/lock"
	"be-itts-community/pkg/observability/nr"
	"be-itts-community/pkg/validator"

	"github.com/daisyorscry/itts/core"
)

type eventSpeakerService struct {
	repo   repository.EventSpeakerRepository
	locker lock.Locker
	tracer nr.Tracer
}

func (s *eventSpeakerService) Create(ctx context.Context, req model.CreateSpeakerRequest) (model.SpeakerResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "EventSpeakerService.Create")()
	}
	if err := validator.Validate(req); err != nil {
		return model.SpeakerResponse{}, core.ValidationError(err)
	}
	sp := req.ToModel()
	if err := s.locker.WithLock(ctx, "lock:event_speakers:"+req.EventID, 5*time.Second, func(ctx context.Context) error {
		return s.repo.Create(ctx, &sp)
	}); err != nil {
		return model.SpeakerResponse{}, core.InternalServerError("failed to create speaker").WithError(err)
	}
	return model.SpeakerToResponse(sp), nil
}

func (s *eventSpeakerService) Get(ctx context.Context, id string) (model.SpeakerResponse, error) {
	m, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return model.SpeakerResponse{}, core.InternalServerError("failed to fetch speaker").WithError(err)
	}
	return model.SpeakerToResponse(*m), nil
}

func (s *eventSpeakerService) Update(ctx context.Context, id string, req model.UpdateSpeakerRequest) (model.SpeakerResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "EventSpeakerService.Update")()
	}
	if err := validator.Validate(req); err != nil {
		return model.SpeakerResponse{}, core.ValidationError(err)
	}
	sp, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return model.SpeakerResponse{}, core.InternalServerError("failed to fetch speaker").WithError(err)
	}
	if req.EventID != nil {
		sp.EventID = *req.EventID
	}
	if req.Name != nil {
		sp.Name = *req.Name
	}
	if req.Title != nil {
		sp.Title = req.Title
	}
	if req.AvatarURL != nil {
		sp.AvatarURL = req.AvatarURL
	}
	if req.SortOrder != nil {
		sp.SortOrder = *req.SortOrder
	}
	if err := s.locker.WithLock(ctx, "lock:event_speakers:"+id, 5*time.Second, func(ctx context.Context) error {
		return s.repo.Update(ctx, sp)
	}); err != nil {
		return model.SpeakerResponse{}, core.InternalServerError("failed to update speaker").WithError(err)
	}
	return model.SpeakerToResponse(*sp), nil
}

func (s *eventSpeakerService) Delete(ctx context.Context, id string) error {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "EventSpeakerService.Delete")()
	}
	return s.locker.WithLock(ctx, "lock:event_speakers:"+id, 5*time.Second, func(ctx context.Context) error {
		return s.repo.Delete(ctx, id)
	})
}

func (s *eventSpeakerService) List(ctx context.Context, p repository.ListParams) (model.SpeakerListResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "EventSpeakerService.List")()
	}
	result, err := s.repo.List(ctx, p)
	if err != nil {
		return model.SpeakerListResponse{}, core.InternalServerError("failed to list speakers").WithError(err)
	}
	return model.SpeakerListToResponse(result.Data, result.Total, result.Page, result.PageSize, result.TotalPages), nil
}

func (s *eventSpeakerService) SetOrder(ctx context.Context, req model.SetSpeakerOrderRequest) (model.SpeakerResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "EventSpeakerService.SetOrder")()
	}
	if err := validator.Validate(req); err != nil {
		return model.SpeakerResponse{}, core.ValidationError(err)
	}
	sp, err := s.repo.GetByID(ctx, req.ID)
	if err != nil {
		return model.SpeakerResponse{}, core.InternalServerError("failed to fetch speaker").WithError(err)
	}
	sp.SortOrder = req.Order
	if err := s.locker.WithLock(ctx, "lock:event_speakers:"+req.ID, 5*time.Second, func(ctx context.Context) error {
		return s.repo.Update(ctx, sp)
	}); err != nil {
		return model.SpeakerResponse{}, core.InternalServerError("failed to update speaker order").WithError(err)
	}
	return model.SpeakerToResponse(*sp), nil
}
