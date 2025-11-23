package repository

import (
	"be-itts-community/internal/model"
	"context"

	"gorm.io/gorm"
)

type EventRegistrationRepository interface {
	Create(ctx context.Context, m *model.EventRegistration) error
	GetByID(ctx context.Context, id string) (*model.EventRegistration, error)
	Update(ctx context.Context, m *model.EventRegistration) error
	Delete(ctx context.Context, id string) error

	List(ctx context.Context, p *ListParams) (*PageResult[model.EventRegistration], error)
}

type eventRegRepo struct{ db *gorm.DB }

func NewEventRegistrationRepository(d *gorm.DB) EventRegistrationRepository {
	return &eventRegRepo{db: d}
}

func (r *eventRegRepo) Create(ctx context.Context, m *model.EventRegistration) error {
    if RepoTracer != nil { defer RepoTracer.StartDatastoreSegment(ctx, "event_registrations", "Create")() }
    return r.db.WithContext(ctx).Create(m).Error
}
func (r *eventRegRepo) GetByID(ctx context.Context, id string) (*model.EventRegistration, error) {
    if RepoTracer != nil { defer RepoTracer.StartDatastoreSegment(ctx, "event_registrations", "GetByID")() }
    var out model.EventRegistration
	if err := r.db.WithContext(ctx).First(&out, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &out, nil
}
func (r *eventRegRepo) Update(ctx context.Context, m *model.EventRegistration) error {
    if RepoTracer != nil { defer RepoTracer.StartDatastoreSegment(ctx, "event_registrations", "Update")() }
    return r.db.WithContext(ctx).Save(m).Error
}
func (r *eventRegRepo) Delete(ctx context.Context, id string) error {
    if RepoTracer != nil { defer RepoTracer.StartDatastoreSegment(ctx, "event_registrations", "Delete")() }
    return r.db.WithContext(ctx).Delete(&model.EventRegistration{}, "id = ?", id).Error
}
func (r *eventRegRepo) List(ctx context.Context, p *ListParams) (*PageResult[model.EventRegistration], error) {
    if RepoTracer != nil { defer RepoTracer.StartDatastoreSegment(ctx, "event_registrations", "List")() }
    searchable := []string{"full_name", "email"}
	sorts := map[string]string{
		"id":         "id",
		"event_id":   "event_id",
		"full_name":  "full_name",
		"email":      "email",
		"created_at": "created_at",
	}
	q, err := ApplyListQuery(r.db.Model(&model.EventRegistration{}), p, searchable, sorts)
	if err != nil {
		return nil, err
	}
	var rows []model.EventRegistration
	return Paginate[model.EventRegistration](ctx, q, p, &rows)
}
