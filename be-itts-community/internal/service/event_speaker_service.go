package service

import (
	"context"

	"gorm.io/gorm"

	"be-itts-community/internal/model"
	"be-itts-community/internal/repository"
	"be-itts-community/pkg/validator"
)

// ========================================
// Request DTOs
// ========================================

type CreateEventSpeakerRequest struct {
	EventID   string `json:"event_id" validate:"required,uuid4"`
	Name      string `json:"name" validate:"required,min=2"`
	Title     string `json:"title"`
	AvatarURL string `json:"avatar_url"`
	SortOrder *int   `json:"sort_order"`
}

type UpdateEventSpeakerRequest struct {
	EventID   *string `json:"event_id,omitempty" validate:"omitempty,uuid4"`
	Name      *string `json:"name,omitempty" validate:"omitempty,min=2"`
	Title     *string `json:"title,omitempty"`
	AvatarURL *string `json:"avatar_url,omitempty"`
	SortOrder *int    `json:"sort_order,omitempty"`
}

type SetEventSpeakerOrderRequest struct {
	ID    string `json:"id" validate:"required"`
	Order int    `json:"order" validate:"gte=0"`
}

// ========================================
// Response DTOs
// ========================================

type EventSpeakerResponse struct {
	ID        string `json:"id"`
	EventID   string `json:"event_id"`
	Name      string `json:"name"`
	Title     string `json:"title,omitempty"`
	AvatarURL string `json:"avatar_url,omitempty"`
	SortOrder int    `json:"sort_order"`
}

type EventSpeakerListResponse struct {
	Data       []EventSpeakerResponse `json:"data"`
	Total      int64                  `json:"total"`
	Page       int                    `json:"page"`
	PageSize   int                    `json:"page_size"`
	TotalPages int                    `json:"total_pages"`
}

// ========================================
// Mappers
// ========================================

func (r CreateEventSpeakerRequest) ToModel() model.EventSpeaker {
	sp := model.EventSpeaker{
		EventID:   r.EventID,
		Name:      r.Name,
		SortOrder: 0,
	}
	if r.Title != "" {
		sp.Title = &r.Title
	}
	if r.AvatarURL != "" {
		sp.AvatarURL = &r.AvatarURL
	}
	if r.SortOrder != nil {
		sp.SortOrder = *r.SortOrder
	}
	return sp
}

func EventSpeakerToResponse(m model.EventSpeaker) EventSpeakerResponse {
	resp := EventSpeakerResponse{
		ID:        m.ID,
		EventID:   m.EventID,
		Name:      m.Name,
		SortOrder: m.SortOrder,
	}
	if m.Title != nil {
		resp.Title = *m.Title
	}
	if m.AvatarURL != nil {
		resp.AvatarURL = *m.AvatarURL
	}
	return resp
}

func EventSpeakerListToResponse(pr repository.PageResult[model.EventSpeaker]) EventSpeakerListResponse {
	data := make([]EventSpeakerResponse, 0, len(pr.Data))
	for _, m := range pr.Data {
		data = append(data, EventSpeakerToResponse(m))
	}
	return EventSpeakerListResponse{
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

type EventSpeakerService interface {
	Create(ctx context.Context, req CreateEventSpeakerRequest) (EventSpeakerResponse, error)
	Get(ctx context.Context, id string) (EventSpeakerResponse, error)
	Update(ctx context.Context, id string, req UpdateEventSpeakerRequest) (EventSpeakerResponse, error)
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, p repository.ListParams) (EventSpeakerListResponse, error)

	SetOrder(ctx context.Context, req SetEventSpeakerOrderRequest) (EventSpeakerResponse, error)
}

// ========================================
// Service Implementation
// ========================================

type eventSpeakerService struct {
	db   *gorm.DB
	repo repository.EventSpeakerRepository
}

func NewEventSpeakerService(db *gorm.DB, repo repository.EventSpeakerRepository) EventSpeakerService {
	return &eventSpeakerService{db: db, repo: repo}
}

func (s *eventSpeakerService) Create(ctx context.Context, req CreateEventSpeakerRequest) (EventSpeakerResponse, error) {
	// Validation at the beginning
	if err := validator.Validate(req); err != nil {
		return EventSpeakerResponse{}, err
	}

	sp := req.ToModel()

	if err := s.repo.Create(ctx, &sp); err != nil {
		return EventSpeakerResponse{}, err
	}

	return EventSpeakerToResponse(sp), nil
}

func (s *eventSpeakerService) Get(ctx context.Context, id string) (EventSpeakerResponse, error) {
	m, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return EventSpeakerResponse{}, err
	}
	return EventSpeakerToResponse(*m), nil
}

func (s *eventSpeakerService) Update(ctx context.Context, id string, req UpdateEventSpeakerRequest) (EventSpeakerResponse, error) {
	// Validation at the beginning
	if err := validator.Validate(req); err != nil {
		return EventSpeakerResponse{}, err
	}

	sp, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return EventSpeakerResponse{}, err
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

	if err := s.repo.Update(ctx, sp); err != nil {
		return EventSpeakerResponse{}, err
	}

	return EventSpeakerToResponse(*sp), nil
}

func (s *eventSpeakerService) Delete(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}

func (s *eventSpeakerService) List(ctx context.Context, p repository.ListParams) (EventSpeakerListResponse, error) {
	result, err := s.repo.List(ctx, p)
	if err != nil {
		return EventSpeakerListResponse{}, err
	}
	return EventSpeakerListToResponse(*result), nil
}

func (s *eventSpeakerService) SetOrder(ctx context.Context, req SetEventSpeakerOrderRequest) (EventSpeakerResponse, error) {
	// Validation at the beginning
	if err := validator.Validate(req); err != nil {
		return EventSpeakerResponse{}, err
	}

	sp, err := s.repo.GetByID(ctx, req.ID)
	if err != nil {
		return EventSpeakerResponse{}, err
	}

	sp.SortOrder = req.Order

	if err := s.repo.Update(ctx, sp); err != nil {
		return EventSpeakerResponse{}, err
	}

	return EventSpeakerToResponse(*sp), nil
}
