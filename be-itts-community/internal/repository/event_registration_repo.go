package repository

import (
	"context"
	"time"

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
	if err := r.db.Get(ctx).Preload("Event").First(&out, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &out, nil
}

func (r *eventRegistrationRepo) FindValidByVerificationHash(ctx context.Context, hash string, now time.Time) (*model.EventRegistration, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "event_registrations", "FindValidByVerificationHash")()
	}
	var out model.EventRegistration
	if err := r.db.Get(ctx).
		Preload("Event").
		Where("verification_token_hash = ? AND verification_expires_at IS NOT NULL AND verification_expires_at > ?", hash, now).
		First(&out).Error; err != nil {
		return nil, err
	}
	return &out, nil
}

func (r *eventRegistrationRepo) FindByVerificationHash(ctx context.Context, hash string) (*model.EventRegistration, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "event_registrations", "FindByVerificationHash")()
	}
	var out model.EventRegistration
	if err := r.db.Get(ctx).
		Preload("Event").
		Where("verification_token_hash = ?", hash).
		First(&out).Error; err != nil {
		return nil, err
	}
	return &out, nil
}

func (r *eventRegistrationRepo) FindByPaymentReference(ctx context.Context, reference string) (*model.EventRegistration, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "event_registrations", "FindByPaymentReference")()
	}
	var out model.EventRegistration
	if err := r.db.Get(ctx).
		Preload("Event").
		Where("payment_reference = ?", reference).
		First(&out).Error; err != nil {
		return nil, err
	}
	return &out, nil
}

func (r *eventRegistrationRepo) CountByEventAndStatuses(ctx context.Context, eventID string, statuses []model.EventRegistrationStatus) (int64, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "event_registrations", "CountByEventAndStatuses")()
	}
	var total int64
	q := r.db.Get(ctx).Model(&model.EventRegistration{}).Where("event_id = ?", eventID)
	if len(statuses) > 0 {
		q = q.Where("status IN ?", statuses)
	}
	if err := q.Count(&total).Error; err != nil {
		return 0, err
	}
	return total, nil
}

func (r *eventRegistrationRepo) FindOldestByEventAndStatus(ctx context.Context, eventID string, status model.EventRegistrationStatus) (*model.EventRegistration, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "event_registrations", "FindOldestByEventAndStatus")()
	}
	var out model.EventRegistration
	if err := r.db.Get(ctx).
		Preload("Event").
		Where("event_id = ? AND status = ?", eventID, status).
		Order("waitlisted_at ASC NULLS LAST, created_at ASC").
		First(&out).Error; err != nil {
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
		"status":     "status",
		"created_at": "created_at",
	}
	q, err := ApplyListQuery(r.db.Get(ctx).Model(&model.EventRegistration{}), &p, searchable, sorts)
	if err != nil {
		return nil, err
	}
	q = q.Preload("Event")
	var rows []model.EventRegistration
	return Paginate[model.EventRegistration](ctx, q, &p, &rows)
}
