package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgconn"
	"gorm.io/gorm"

	"be-itts-community/internal/model"
	"be-itts-community/internal/repository"
	"be-itts-community/pkg/validator"
)

// ========================================
// Request DTOs
// ========================================

type RegisterToEventRequest struct {
	EventID  string `json:"event_id" validate:"required,uuid4"`
	FullName string `json:"full_name" validate:"required,min=3"`
	Email    string `json:"email" validate:"required,email"`
}

type UpdateEventRegistrationRequest struct {
	FullName *string `json:"full_name,omitempty" validate:"omitempty,min=3"`
	Email    *string `json:"email,omitempty" validate:"omitempty,email"`
}

// ========================================
// Response DTOs
// ========================================

type EventRegResponse struct {
	ID        string    `json:"id"`
	EventID   string    `json:"event_id"`
	FullName  string    `json:"full_name"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"created_at"`
}

type EventRegListResponse struct {
	Data       []EventRegResponse `json:"data"`
	Total      int64              `json:"total"`
	Page       int                `json:"page"`
	PageSize   int                `json:"page_size"`
	TotalPages int                `json:"total_pages"`
}

// ========================================
// Mappers
// ========================================

func (r RegisterToEventRequest) ToModel() model.EventRegistration {
	return model.EventRegistration{
		EventID:  r.EventID,
		FullName: r.FullName,
		Email:    r.Email,
	}
}

func EventRegToResponse(m model.EventRegistration) EventRegResponse {
	return EventRegResponse{
		ID:        m.ID,
		EventID:   m.EventID,
		FullName:  m.FullName,
		Email:     m.Email,
		CreatedAt: m.CreatedAt,
	}
}

func EventRegListToResponse(pr repository.PageResult[model.EventRegistration]) EventRegListResponse {
	data := make([]EventRegResponse, 0, len(pr.Data))
	for _, m := range pr.Data {
		data = append(data, EventRegToResponse(m))
	}
	return EventRegListResponse{
		Data:       data,
		Total:      pr.Total,
		Page:       pr.Page,
		PageSize:   pr.PageSize,
		TotalPages: pr.TotalPages,
	}
}

// ========================================
// Service Interface
// ========================================

type EventRegistrationService interface {
	// Public
	Register(ctx context.Context, req RegisterToEventRequest) (EventRegResponse, error)

	// Admin
	AdminList(ctx context.Context, p repository.ListParams) (EventRegListResponse, error)
	AdminGet(ctx context.Context, id string) (EventRegResponse, error)
	AdminUpdate(ctx context.Context, id string, req UpdateEventRegistrationRequest) (EventRegResponse, error)
	AdminDelete(ctx context.Context, id string) error
}

// ========================================
// Service Implementation
// ========================================

type eventRegistrationService struct {
	db   *gorm.DB
	repo repository.EventRegistrationRepository
}

func NewEventRegistrationService(db *gorm.DB, repo repository.EventRegistrationRepository) EventRegistrationService {
	return &eventRegistrationService{db: db, repo: repo}
}

func (s *eventRegistrationService) Register(ctx context.Context, req RegisterToEventRequest) (EventRegResponse, error) {
	// Validation at the beginning
	if err := validator.Validate(req); err != nil {
		return EventRegResponse{}, err
	}

	reg := req.ToModel()

	if err := s.repo.Create(ctx, &reg); err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return EventRegResponse{}, fmt.Errorf("email already registered for this event")
		}
		return EventRegResponse{}, err
	}

	return EventRegToResponse(reg), nil
}

func (s *eventRegistrationService) AdminList(ctx context.Context, p repository.ListParams) (EventRegListResponse, error) {
	result, err := s.repo.List(ctx, p)
	if err != nil {
		return EventRegListResponse{}, err
	}
	return EventRegListToResponse(*result), nil
}

func (s *eventRegistrationService) AdminGet(ctx context.Context, id string) (EventRegResponse, error) {
	m, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return EventRegResponse{}, err
	}
	return EventRegToResponse(*m), nil
}

func (s *eventRegistrationService) AdminUpdate(ctx context.Context, id string, req UpdateEventRegistrationRequest) (EventRegResponse, error) {
	// Validation at the beginning
	if err := validator.Validate(req); err != nil {
		return EventRegResponse{}, err
	}

	r, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return EventRegResponse{}, err
	}

	if req.FullName != nil {
		r.FullName = *req.FullName
	}
	if req.Email != nil {
		r.Email = *req.Email
	}

	if err := s.repo.Update(ctx, r); err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return EventRegResponse{}, fmt.Errorf("email already registered for this event")
		}
		return EventRegResponse{}, err
	}

	return EventRegToResponse(*r), nil
}

func (s *eventRegistrationService) AdminDelete(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}
