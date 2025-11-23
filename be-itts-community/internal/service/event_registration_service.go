package service

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5/pgconn"
	"gorm.io/gorm"

	"be-itts-community/internal/model"
	"be-itts-community/internal/repository"
	"be-itts-community/pkg/lock"
	"be-itts-community/pkg/observability/nr"
	"be-itts-community/pkg/validator"

	"github.com/daisyorscry/itts/core"
)

type eventRegistrationService struct {
	eventRepo repository.EventRepository
	regRepo   repository.EventRegistrationRepository
	locker    lock.Locker
	tracer    nr.Tracer
}

func (s *eventRegistrationService) Register(ctx context.Context, req model.CreateEventRegistrationRequest) (model.EventRegistrationResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "EventRegistrationService.Register")()
	}
	if err := validator.Validate(req); err != nil {
		return model.EventRegistrationResponse{}, core.ValidationError(err)
	}
	if _, err := s.eventRepo.GetEventByID(ctx, req.EventID); err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.EventRegistrationResponse{}, core.NotFound("event", req.EventID)
		}
		return model.EventRegistrationResponse{}, core.InternalServerError("failed to fetch event").WithError(err)
	}
	reg := req.ToModel()
	if err := s.locker.WithLock(ctx, "lock:event_reg:"+req.EventID+":"+req.Email, 10*time.Second, func(ctx context.Context) error {
		return s.regRepo.Create(ctx, &reg)
	}); err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return model.EventRegistrationResponse{}, core.Conflict("email already registered for this event")
		}
		return model.EventRegistrationResponse{}, core.InternalServerError("failed to register for event").WithError(err)
	}
	return model.EventRegistrationToResponse(reg), nil
}

func (s *eventRegistrationService) AdminList(ctx context.Context, p repository.ListParams) (model.EventRegistrationListResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "EventRegistrationService.AdminList")()
	}
	result, err := s.regRepo.List(ctx, p)
	if err != nil {
		return model.EventRegistrationListResponse{}, core.InternalServerError("failed to list registrations").WithError(err)
	}
	return model.EventRegistrationListToResponse(result.Data, result.Total, result.Page, result.PageSize, result.TotalPages), nil
}

func (s *eventRegistrationService) AdminGet(ctx context.Context, id string) (model.EventRegistrationResponse, error) {
	m, err := s.regRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.EventRegistrationResponse{}, core.NotFound("event_registration", id)
		}
		return model.EventRegistrationResponse{}, core.InternalServerError("failed to load registration").WithError(err)
	}
	return model.EventRegistrationToResponse(*m), nil
}

func (s *eventRegistrationService) AdminUpdate(ctx context.Context, id string, req model.UpdateEventRegistrationRequest) (model.EventRegistrationResponse, error) {
	if err := validator.Validate(req); err != nil {
		return model.EventRegistrationResponse{}, core.ValidationError(err)
	}
	r, err := s.regRepo.GetByID(ctx, id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return model.EventRegistrationResponse{}, core.NotFound("event_registration", id)
		}
		return model.EventRegistrationResponse{}, core.InternalServerError("failed to load registration").WithError(err)
	}
	if req.FullName != nil {
		r.FullName = *req.FullName
	}
	if req.Email != nil {
		r.Email = *req.Email
	}
	if err := s.regRepo.Update(ctx, r); err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return model.EventRegistrationResponse{}, core.Conflict("email already registered for this event")
		}
		return model.EventRegistrationResponse{}, core.InternalServerError("failed to update registration").WithError(err)
	}
	return model.EventRegistrationToResponse(*r), nil
}

func (s *eventRegistrationService) AdminDelete(ctx context.Context, id string) error {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "EventRegistrationService.AdminDelete")()
	}
	return s.locker.WithLock(ctx, "lock:event_reg:"+id, 5*time.Second, func(ctx context.Context) error {
		return s.regRepo.Delete(ctx, id)
	})
}
