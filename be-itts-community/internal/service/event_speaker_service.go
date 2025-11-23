package service

import (
	"context"

	"gorm.io/gorm"

	"be-itts-community/internal/repository"
	"be-itts-community/model"
)

type EventSpeakerService interface {
	Create(ctx context.Context, in CreateEventSpeaker) (*model.EventSpeaker, error)
	Get(ctx context.Context, id string) (*model.EventSpeaker, error)
	Update(ctx context.Context, id string, in UpdateEventSpeaker) (*model.EventSpeaker, error)
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, p *repository.ListParams) (*repository.PageResult[model.EventSpeaker], error)

	SetOrder(ctx context.Context, id string, order int) (*model.EventSpeaker, error)
}

type CreateEventSpeaker struct {
	EventID   string  `json:"event_id" validate:"required,uuid4"`
	Name      string  `json:"name" validate:"required"`
	Title     *string `json:"title"`
	AvatarURL *string `json:"avatar_url"`
	SortOrder *int    `json:"sort_order"`
}
type UpdateEventSpeaker struct {
	EventID   *string `json:"event_id,omitempty"`
	Name      *string `json:"name,omitempty"`
	Title     *string `json:"title,omitempty"`
	AvatarURL *string `json:"avatar_url,omitempty"`
	SortOrder *int    `json:"sort_order,omitempty"`
}

type eventSpeakerService struct {
	db   *gorm.DB
	repo repository.EventSpeakerRepository
}

func NewEventSpeakerService(db *gorm.DB, repo repository.EventSpeakerRepository) EventSpeakerService {
	return &eventSpeakerService{db: db, repo: repo}
}

func (s *eventSpeakerService) Create(ctx context.Context, in CreateEventSpeaker) (*model.EventSpeaker, error) {
	sp := &model.EventSpeaker{
		EventID:   in.EventID,
		Name:      in.Name,
		Title:     in.Title,
		AvatarURL: in.AvatarURL,
	}
	if in.SortOrder != nil {
		sp.SortOrder = *in.SortOrder
	}
	if err := s.repo.Create(ctx, sp); err != nil {
		return nil, err
	}
	return sp, nil
}

func (s *eventSpeakerService) Get(ctx context.Context, id string) (*model.EventSpeaker, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *eventSpeakerService) Update(ctx context.Context, id string, in UpdateEventSpeaker) (*model.EventSpeaker, error) {
	sp, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if in.EventID != nil {
		sp.EventID = *in.EventID
	}
	if in.Name != nil {
		sp.Name = *in.Name
	}
	if in.Title != nil {
		sp.Title = in.Title
	}
	if in.AvatarURL != nil {
		sp.AvatarURL = in.AvatarURL
	}
	if in.SortOrder != nil {
		sp.SortOrder = *in.SortOrder
	}
	if err := s.repo.Update(ctx, sp); err != nil {
		return nil, err
	}
	return sp, nil
}

func (s *eventSpeakerService) Delete(ctx context.Context, id string) error {
	return s.repo.Delete(ctx, id)
}

func (s *eventSpeakerService) List(ctx context.Context, p *repository.ListParams) (*repository.PageResult[model.EventSpeaker], error) {
	return s.repo.List(ctx, p)
}

func (s *eventSpeakerService) SetOrder(ctx context.Context, id string, order int) (*model.EventSpeaker, error) {
	sp, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	sp.SortOrder = order
	if err := s.repo.Update(ctx, sp); err != nil {
		return nil, err
	}
	return sp, nil
}
