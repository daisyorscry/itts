package repository

import (
	"context"

	"be-itts-community/internal/db"
	"be-itts-community/internal/model"
)

type EventRepository interface {
	RunInTransaction(ctx context.Context, f func(tx context.Context) error) error

	// Events
	CreateEvent(ctx context.Context, e *model.Event) error
	GetEventByID(ctx context.Context, id string) (*model.Event, error)
	GetEventBySlug(ctx context.Context, slug string) (*model.Event, error)
	UpdateEvent(ctx context.Context, e *model.Event) error
	DeleteEvent(ctx context.Context, id string) error
	ListEvents(ctx context.Context, p ListParams) (*PageResult[model.Event], error)

	// Speakers
	CreateSpeaker(ctx context.Context, sp *model.EventSpeaker) error
	UpdateSpeaker(ctx context.Context, sp *model.EventSpeaker) error
	DeleteSpeaker(ctx context.Context, id string) error
	ListSpeakers(ctx context.Context, p *ListParams) (*PageResult[model.EventSpeaker], error)

	// Registrations
	CreateRegistration(ctx context.Context, reg *model.EventRegistration) error
	DeleteRegistration(ctx context.Context, id string) error
	ListRegistrations(ctx context.Context, p *ListParams) (*PageResult[model.EventRegistration], error)
}
type eventRepo struct{ db db.Connection }

func NewEventRepository(db db.Connection) EventRepository {
	return &eventRepo{db: db}
}
