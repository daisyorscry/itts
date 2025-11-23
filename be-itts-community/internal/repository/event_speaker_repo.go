package repository

import (
	"context"

	"be-itts-community/internal/db"
	"be-itts-community/internal/model"
)

type eventSpeakerRepo struct{ db db.Connection }

func NewEventSpeakerRepository(conn db.Connection) EventSpeakerRepository {
	return &eventSpeakerRepo{db: conn}
}

func (r *eventSpeakerRepo) Create(ctx context.Context, m *model.EventSpeaker) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "event_speakers", "Create")()
	}
	return r.db.Get(ctx).Create(m).Error
}

func (r *eventSpeakerRepo) GetByID(ctx context.Context, id string) (*model.EventSpeaker, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "event_speakers", "GetByID")()
	}
	var out model.EventSpeaker
	if err := r.db.Get(ctx).First(&out, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &out, nil
}

func (r *eventSpeakerRepo) Update(ctx context.Context, m *model.EventSpeaker) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "event_speakers", "Update")()
	}
	return r.db.Get(ctx).Save(m).Error
}

func (r *eventSpeakerRepo) Delete(ctx context.Context, id string) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "event_speakers", "Delete")()
	}
	return r.db.Get(ctx).Delete(&model.EventSpeaker{}, "id = ?", id).Error
}

func (r *eventSpeakerRepo) List(ctx context.Context, p ListParams) (*PageResult[model.EventSpeaker], error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "event_speakers", "List")()
	}
	searchable := []string{"name", "title", "event_id"}
	sorts := map[string]string{
		"id":         "id",
		"event_id":   "event_id",
		"name":       "name",
		"sort_order": "sort_order",
	}
	q, err := ApplyListQuery(r.db.Get(ctx).Model(&model.EventSpeaker{}), &p, searchable, sorts)
	if err != nil {
		return nil, err
	}
	var rows []model.EventSpeaker
	return Paginate[model.EventSpeaker](ctx, q, &p, &rows)
}
