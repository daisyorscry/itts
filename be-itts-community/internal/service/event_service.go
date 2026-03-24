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
	repo    repository.EventRepository
	regRepo repository.EventRegistrationRepository
	locker  lock.Locker
	tracer  nr.Tracer
}

func (s *eventService) Create(ctx context.Context, req model.CreateEventRequest) (model.EventResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "EventService.Create")()
	}

	if req.ImageURL == "" && req.FilePath != "" {
		req.ImageURL = req.FilePath
	}
	if req.SquareImageURL == "" && req.SquareFilePath != "" {
		req.SquareImageURL = req.SquareFilePath
	}
	if req.LandscapeImageURL == "" && req.LandscapeFilePath != "" {
		req.LandscapeImageURL = req.LandscapeFilePath
	}

	if err := validator.Validate(req); err != nil {
		return model.EventResponse{}, core.ValidationError(err)
	}

	if req.EndsAt != nil && req.EndsAt.Before(req.StartsAt) {
		return model.EventResponse{}, core.BadRequest("ends_at must be after starts_at")
	}
	if req.IsPaid && req.Price <= 0 {
		return model.EventResponse{}, core.BadRequest("price must be greater than zero for paid events")
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
	return s.toEventResponse(ctx, *result)
}

func (s *eventService) Get(ctx context.Context, id string) (model.EventResponse, error) {
	m, err := s.repo.GetEventByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.EventResponse{}, core.NotFound("event", id)
		}
		return model.EventResponse{}, core.InternalServerError("failed to fetch event").WithError(err)
	}
	return s.toEventResponse(ctx, *m)
}

func (s *eventService) GetBySlug(ctx context.Context, slug string) (model.EventResponse, error) {
	m, err := s.repo.GetEventBySlug(ctx, slug)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.EventResponse{}, core.NotFound("event", slug)
		}
		return model.EventResponse{}, core.InternalServerError("failed to fetch event").WithError(err)
	}
	return s.toEventResponse(ctx, *m)
}

func (s *eventService) Update(ctx context.Context, id string, req model.UpdateEventRequest) (model.EventResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "EventService.Update")()
	}

	if req.ImageURL == nil && req.FilePath != nil {
		req.ImageURL = req.FilePath
	}
	if req.SquareImageURL == nil && req.SquareFilePath != nil {
		req.SquareImageURL = req.SquareFilePath
	}
	if req.LandscapeImageURL == nil && req.LandscapeFilePath != nil {
		req.LandscapeImageURL = req.LandscapeFilePath
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
	if req.SquareImageURL != nil {
		ev.SquareImageURL = req.SquareImageURL
	}
	if req.LandscapeImageURL != nil {
		ev.LandscapeImageURL = req.LandscapeImageURL
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
	if req.Benefits != nil {
		ev.Benefits = append(model.StringArray{}, (*req.Benefits)...)
	}
	if req.Capacity != nil {
		ev.Capacity = *req.Capacity
	}
	if req.RegistrationDeadline != nil {
		ev.RegistrationDeadline = req.RegistrationDeadline
	}
	if req.IsPaid != nil {
		ev.IsPaid = *req.IsPaid
		if !ev.IsPaid {
			ev.Price = 0
		}
	}
	if req.Price != nil {
		ev.Price = *req.Price
	}
	if req.Currency != nil {
		ev.Currency = *req.Currency
	}

	if ev.EndsAt != nil && ev.EndsAt.Before(ev.StartsAt) {
		return model.EventResponse{}, core.BadRequest("ends_at must be after starts_at")
	}
	if ev.IsPaid && ev.Price <= 0 {
		return model.EventResponse{}, core.BadRequest("price must be greater than zero for paid events")
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
	return s.toEventResponse(ctx, *result)
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
	return s.eventListToResponse(ctx, *result)
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
	return s.toEventResponse(ctx, *result)
}

func (s *eventService) runTransaction(ctx context.Context, fn func(txCtx context.Context) error) error {
	return s.repo.RunInTransaction(ctx, fn)
}

// ========================================
// List Response Helpers
// ========================================

func (s *eventService) eventListToResponse(ctx context.Context, pr repository.PageResult[model.Event]) (model.EventListResponse, error) {
	data := make([]model.EventResponse, 0, len(pr.Data))
	for _, m := range pr.Data {
		resp, err := s.toEventResponse(ctx, m)
		if err != nil {
			return model.EventListResponse{}, err
		}
		data = append(data, resp)
	}
	return model.EventListResponse{
		Data:       data,
		Total:      pr.Total,
		Page:       pr.Page,
		PageSize:   pr.PageSize,
		TotalPages: pr.TotalPages,
	}, nil
}

func (s *eventService) toEventResponse(ctx context.Context, m model.Event) (model.EventResponse, error) {
	resp := model.EventToResponse(m)
	if m.Capacity <= 0 {
		resp.RemainingSlots = 0
		return resp, nil
	}
	approvedCount, err := s.regRepo.CountByEventAndStatuses(ctx, m.ID, []model.EventRegistrationStatus{model.EventRegistrationApproved})
	if err != nil {
		return model.EventResponse{}, core.InternalServerError("failed to count event registrations").WithError(err)
	}
	remaining := m.Capacity - int(approvedCount)
	if remaining < 0 {
		remaining = 0
	}
	resp.RemainingSlots = remaining
	return resp, nil
}
