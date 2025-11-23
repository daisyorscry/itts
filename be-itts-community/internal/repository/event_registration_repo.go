package repository

import (
	"context"

	"be-itts-community/internal/db"
	"be-itts-community/internal/model"
)

type eventRegistrationRepo struct{ db db.Connection }

func NewEventRegistrationRepository(conn db.Connection) EventRegistrationRepository {
	return &eventRegistrationRepo{db: conn}
}

func (r *eventRegistrationRepo) Create(ctx context.Context, m *model.EventRegistration) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "event_registrations", "Create")()
	}
	return r.db.Get(ctx).Create(m).Error
}

func (r *eventRegistrationRepo) GetByID(ctx context.Context, id string) (*model.EventRegistration, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "event_registrations", "GetByID")()
	}
	var out model.EventRegistration
	if err := r.db.Get(ctx).First(&out, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &out, nil
}

func (r *eventRegistrationRepo) Update(ctx context.Context, m *model.EventRegistration) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "event_registrations", "Update")()
	}
	return r.db.Get(ctx).Save(m).Error
}

func (r *eventRegistrationRepo) Delete(ctx context.Context, id string) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "event_registrations", "Delete")()
	}
	return r.db.Get(ctx).Delete(&model.EventRegistration{}, "id = ?", id).Error
}

func (r *eventRegistrationRepo) List(ctx context.Context, p ListParams) (*PageResult[model.EventRegistration], error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "event_registrations", "List")()
	}
	searchable := []string{"full_name", "email"}
	sorts := map[string]string{
		"id":         "id",
		"event_id":   "event_id",
		"full_name":  "full_name",
		"email":      "email",
		"created_at": "created_at",
	}
	q, err := ApplyListQuery(r.db.Get(ctx).Model(&model.EventRegistration{}), &p, searchable, sorts)
	if err != nil {
		return nil, err
	}
	var rows []model.EventRegistration
	return Paginate[model.EventRegistration](ctx, q, &p, &rows)
}
