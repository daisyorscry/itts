// internal/repository/event.go
package repository

import (
	"context"

	"gorm.io/gorm"

	"be-itts-community/internal/model"
)

// Satu repo untuk Event + Speakers + EventRegistrations
type EventRepository interface {
	// Event CRUD
	CreateEvent(ctx context.Context, m *model.Event) error
	GetEventByID(ctx context.Context, id string) (*model.Event, error)
	GetEventBySlug(ctx context.Context, slug string) (*model.Event, error)
	UpdateEvent(ctx context.Context, m *model.Event) error
	DeleteEvent(ctx context.Context, id string) error
	ListEvents(ctx context.Context, p *ListParams) (*PageResult[model.Event], error)

	// Speakers CRUD
	CreateSpeaker(ctx context.Context, m *model.EventSpeaker) error
	UpdateSpeaker(ctx context.Context, m *model.EventSpeaker) error
	DeleteSpeaker(ctx context.Context, id string) error
	ListSpeakers(ctx context.Context, p *ListParams) (*PageResult[model.EventSpeaker], error)

	// Registrations (biasanya create + list + delete saja)
	CreateRegistration(ctx context.Context, m *model.EventRegistration) error
	DeleteRegistration(ctx context.Context, id string) error
	ListRegistrations(ctx context.Context, p *ListParams) (*PageResult[model.EventRegistration], error)
}

type eventRepo struct{ db *gorm.DB }

func NewEventRepository(d *gorm.DB) EventRepository {
	return &eventRepo{db: d}
}

// =====================
// Event
// =====================

func (r *eventRepo) CreateEvent(ctx context.Context, m *model.Event) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "events", "Create")()
	}
	return r.db.WithContext(ctx).Create(m).Error
}

func (r *eventRepo) preloadChildren(db *gorm.DB) *gorm.DB {
	// urutkan speakers by sort_order ASC
	return db.Preload("Speakers", func(tx *gorm.DB) *gorm.DB {
		return tx.Order("sort_order ASC")
	})
}

func (r *eventRepo) GetEventByID(ctx context.Context, id string) (*model.Event, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "events", "GetByID")()
	}
	var out model.Event
	if err := r.preloadChildren(r.db.WithContext(ctx)).
		First(&out, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &out, nil
}

func (r *eventRepo) GetEventBySlug(ctx context.Context, slug string) (*model.Event, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "events", "GetBySlug")()
	}
	var out model.Event
	if err := r.preloadChildren(r.db.WithContext(ctx)).
		First(&out, "slug = ?", slug).Error; err != nil {
		return nil, err
	}
	return &out, nil
}

func (r *eventRepo) UpdateEvent(ctx context.Context, m *model.Event) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "events", "Update")()
	}
	return r.db.WithContext(ctx).Save(m).Error
}

func (r *eventRepo) DeleteEvent(ctx context.Context, id string) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "events", "Delete")()
	}
	return r.db.WithContext(ctx).Delete(&model.Event{}, "id = ?", id).Error
}

func (r *eventRepo) ListEvents(ctx context.Context, p *ListParams) (*PageResult[model.Event], error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "events", "List")()
	}
	// kolom untuk search
	searchable := []string{"title", "summary", "description", "slug", "venue", "program", "status"}
	// whitelist sort
	sorts := map[string]string{
		"id":         "id",
		"title":      "title",
		"slug":       "slug",
		"program":    "program",
		"status":     "status",
		"starts_at":  "starts_at",
		"ends_at":    "ends_at",
		"created_at": "created_at",
		"updated_at": "updated_at",
	}

	base := r.db.Model(&model.Event{})
	q, err := ApplyListQuery(base, p, searchable, sorts)
	if err != nil {
		return nil, err
	}

	// Pastikan hasil rows sudah include Speakers (ASC)
	q = r.preloadChildren(q)

	var rows []model.Event
	return Paginate[model.Event](ctx, q, p, &rows)
}

// =====================
// Speakers
// =====================

func (r *eventRepo) CreateSpeaker(ctx context.Context, m *model.EventSpeaker) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "event_speakers", "Create")()
	}
	return r.db.WithContext(ctx).Create(m).Error
}

func (r *eventRepo) UpdateSpeaker(ctx context.Context, m *model.EventSpeaker) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "event_speakers", "Update")()
	}
	return r.db.WithContext(ctx).Save(m).Error
}

func (r *eventRepo) DeleteSpeaker(ctx context.Context, id string) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "event_speakers", "Delete")()
	}
	return r.db.WithContext(ctx).Delete(&model.EventSpeaker{}, "id = ?", id).Error
}

func (r *eventRepo) ListSpeakers(ctx context.Context, p *ListParams) (*PageResult[model.EventSpeaker], error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "event_speakers", "List")()
	}
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

// =====================
// Event Registrations
// =====================

func (r *eventRepo) CreateRegistration(ctx context.Context, m *model.EventRegistration) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "event_registrations", "Create")()
	}
	return r.db.WithContext(ctx).Create(m).Error
}

func (r *eventRepo) DeleteRegistration(ctx context.Context, id string) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "event_registrations", "Delete")()
	}
	return r.db.WithContext(ctx).Delete(&model.EventRegistration{}, "id = ?", id).Error
}

func (r *eventRepo) ListRegistrations(ctx context.Context, p *ListParams) (*PageResult[model.EventRegistration], error) {
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
	q, err := ApplyListQuery(r.db.Model(&model.EventRegistration{}), p, searchable, sorts)
	if err != nil {
		return nil, err
	}
	var rows []model.EventRegistration
	return Paginate[model.EventRegistration](ctx, q, p, &rows)
}
