package repository

import (
	"context"

	"gorm.io/gorm"

	"be-itts-community/internal/model"
)

type EventSpeakerRepository interface {
	Create(ctx context.Context, m *model.EventSpeaker) error
	GetByID(ctx context.Context, id string) (*model.EventSpeaker, error)
	Update(ctx context.Context, m *model.EventSpeaker) error
	Delete(ctx context.Context, id string) error

	List(ctx context.Context, p *ListParams) (*PageResult[model.EventSpeaker], error)
}

type eventSpeakerRepo struct{ db *gorm.DB }

func NewEventSpeakerRepository(d *gorm.DB) EventSpeakerRepository {
	return &eventSpeakerRepo{db: d}
}

func (r *eventSpeakerRepo) Create(ctx context.Context, m *model.EventSpeaker) error {
	return r.db.WithContext(ctx).Create(m).Error
}
func (r *eventSpeakerRepo) GetByID(ctx context.Context, id string) (*model.EventSpeaker, error) {
	var out model.EventSpeaker
	if err := r.db.WithContext(ctx).First(&out, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &out, nil
}
func (r *eventSpeakerRepo) Update(ctx context.Context, m *model.EventSpeaker) error {
	return r.db.WithContext(ctx).Save(m).Error
}
func (r *eventSpeakerRepo) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&model.EventSpeaker{}, "id = ?", id).Error
}
func (r *eventSpeakerRepo) List(ctx context.Context, p *ListParams) (*PageResult[model.EventSpeaker], error) {
	searchable := []string{"name", "title"}
	sorts := map[string]string{
		"id":         "id",
		"event_id":   "event_id",
		"name":       "name",
		"title":      "title",
		"sort_order": "sort_order",
	}
	q, err := ApplyListQuery(r.db.Model(&model.EventSpeaker{}), p, searchable, sorts)
	if err != nil {
		return nil, err
	}
	var rows []model.EventSpeaker
	return Paginate[model.EventSpeaker](ctx, q, p, &rows)
}
