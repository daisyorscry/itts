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

type eventService struct {
	repo   repository.EventRepository
	locker lock.Locker
	tracer nr.Tracer
}

func (s *eventService) Create(ctx context.Context, req model.CreateEventRequest) (model.EventResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "EventService.Create")()
	}

	if err := validator.Validate(req); err != nil {
		return model.EventResponse{}, core.ValidationError(err)
	}

	if req.EndsAt != nil && req.EndsAt.Before(req.StartsAt) {
		return model.EventResponse{}, core.BadRequest("ends_at must be after starts_at")
	}

	ev := req.ToModel()

	if err := s.locker.WithLock(ctx, "lock:events:create", 10*time.Second, func(ctx context.Context) error {
		return s.runTransaction(ctx, func(txCtx context.Context) error {
			return s.repo.CreateEvent(txCtx, &ev)
		})
	}); err != nil {
		return model.EventResponse{}, core.InternalServerError("failed to create event").WithError(err)
	}

	result, err := s.repo.GetEventByID(ctx, ev.ID)
	if err != nil {
		return model.EventResponse{}, core.InternalServerError("failed to load event").WithError(err)
	}
	return model.EventToResponse(*result), nil
}

func (s *eventService) Get(ctx context.Context, id string) (model.EventResponse, error) {
	m, err := s.repo.GetEventByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.EventResponse{}, core.NotFound("event", id)
		}
		return model.EventResponse{}, core.InternalServerError("failed to fetch event").WithError(err)
	}
	return model.EventToResponse(*m), nil
}

func (s *eventService) GetBySlug(ctx context.Context, slug string) (model.EventResponse, error) {
	m, err := s.repo.GetEventBySlug(ctx, slug)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.EventResponse{}, core.NotFound("event", slug)
		}
		return model.EventResponse{}, core.InternalServerError("failed to fetch event").WithError(err)
	}
	return model.EventToResponse(*m), nil
}

func (s *eventService) Update(ctx context.Context, id string, req model.UpdateEventRequest) (model.EventResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "EventService.Update")()
	}

	if err := validator.Validate(req); err != nil {
		return model.EventResponse{}, core.ValidationError(err)
	}

	ev, err := s.repo.GetEventByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.EventResponse{}, core.NotFound("event", id)
		}
		return model.EventResponse{}, core.InternalServerError("failed to fetch event").WithError(err)
	}

	if req.Slug != nil {
		ev.Slug = req.Slug
	}
	if req.Title != nil {
		ev.Title = *req.Title
	}
	if req.Summary != nil {
		ev.Summary = req.Summary
	}
	if req.Description != nil {
		ev.Description = req.Description
	}
	if req.ImageURL != nil {
		ev.ImageURL = req.ImageURL
	}
	if req.Program != nil {
		ev.Program = req.Program
	}
	if req.Status != nil {
		ev.Status = *req.Status
	}
	if req.StartsAt != nil {
		ev.StartsAt = *req.StartsAt
	}
	if req.EndsAt != nil {
		ev.EndsAt = req.EndsAt
	}
	if req.Venue != nil {
		ev.Venue = req.Venue
	}

	if ev.EndsAt != nil && ev.EndsAt.Before(ev.StartsAt) {
		return model.EventResponse{}, core.BadRequest("ends_at must be after starts_at")
	}

	if err := s.locker.WithLock(ctx, "lock:events:"+id, 10*time.Second, func(ctx context.Context) error {
		return s.runTransaction(ctx, func(txCtx context.Context) error {
			return s.repo.UpdateEvent(txCtx, ev)
		})
	}); err != nil {
		return model.EventResponse{}, core.InternalServerError("failed to update event").WithError(err)
	}

	result, err := s.repo.GetEventByID(ctx, id)
	if err != nil {
		return model.EventResponse{}, core.InternalServerError("failed to load event").WithError(err)
	}
	return model.EventToResponse(*result), nil
}

func (s *eventService) Delete(ctx context.Context, id string) error {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "EventService.Delete")()
	}
	return s.locker.WithLock(ctx, "lock:events:"+id, 10*time.Second, func(ctx context.Context) error {
		return s.runTransaction(ctx, func(txCtx context.Context) error {
			if err := s.repo.DeleteEvent(txCtx, id); err != nil {
				return core.InternalServerError("failed to delete event").WithError(err)
			}
			return nil
		})
	})
}

func (s *eventService) List(ctx context.Context, p repository.ListParams) (model.EventListResponse, error) {
	result, err := s.repo.ListEvents(ctx, p)
	if err != nil {
		return model.EventListResponse{}, core.InternalServerError("failed to list events").WithError(err)
	}
	return eventListToResponse(*result), nil
}

func (s *eventService) SetStatus(ctx context.Context, req model.SetEventStatusRequest) (model.EventResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "EventService.SetStatus")()
	}

	if err := validator.Validate(req); err != nil {
		return model.EventResponse{}, core.ValidationError(err)
	}

	ev, err := s.repo.GetEventByID(ctx, req.ID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.EventResponse{}, core.NotFound("event", req.ID)
		}
		return model.EventResponse{}, core.InternalServerError("failed to fetch event").WithError(err)
	}

	ev.Status = req.Status

	if err := s.locker.WithLock(ctx, "lock:events:"+req.ID, 10*time.Second, func(ctx context.Context) error {
		return s.runTransaction(ctx, func(txCtx context.Context) error {
			return s.repo.UpdateEvent(txCtx, ev)
		})
	}); err != nil {
		return model.EventResponse{}, core.InternalServerError("failed to update event").WithError(err)
	}

	result, err := s.repo.GetEventByID(ctx, req.ID)
	if err != nil {
		return model.EventResponse{}, core.InternalServerError("failed to load event").WithError(err)
	}
	return model.EventToResponse(*result), nil
}

func (s *eventService) runTransaction(ctx context.Context, fn func(txCtx context.Context) error) error {
	return s.repo.RunInTransaction(ctx, fn)
}

// ========================================
// List Response Helpers
// ========================================

func eventListToResponse(pr repository.PageResult[model.Event]) model.EventListResponse {
	data := make([]model.EventResponse, 0, len(pr.Data))
	for _, m := range pr.Data {
		data = append(data, model.EventToResponse(m))
	}
	return model.EventListResponse{
		Data:       data,
		Total:      pr.Total,
		Page:       pr.Page,
		PageSize:   pr.PageSize,
		TotalPages: pr.TotalPages,
	}
}
