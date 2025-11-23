package repository

import (
	"context"

	"be-itts-community/internal/model"
)

type EventSpeakerRepository interface {
	Create(ctx context.Context, m *model.EventSpeaker) error
	GetByID(ctx context.Context, id string) (*model.EventSpeaker, error)
	Update(ctx context.Context, m *model.EventSpeaker) error
	Delete(ctx context.Context, id string) error

	List(ctx context.Context, p ListParams) (*PageResult[model.EventSpeaker], error)
}
