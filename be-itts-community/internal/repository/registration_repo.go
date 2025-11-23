package repository

import (
	"context"

	"gorm.io/gorm"

	"be-itts-community/internal/model"
)

type RegistrationRepository interface {
	Create(ctx context.Context, m *model.Registration) error
	GetByID(ctx context.Context, id string) (*model.Registration, error)
	FindByEmail(ctx context.Context, email string) (*model.Registration, error)
	Update(ctx context.Context, m *model.Registration) error
	Delete(ctx context.Context, id string) error
	List(ctx context.Context, p ListParams) (*PageResult[model.Registration], error)
}

type registrationRepo struct{ db *gorm.DB }

func NewRegistrationRepository(d *gorm.DB) RegistrationRepository {
	return &registrationRepo{db: d}
}

func (r *registrationRepo) Create(ctx context.Context, m *model.Registration) error {
    if RepoTracer != nil { defer RepoTracer.StartDatastoreSegment(ctx, "registrations", "Create")() }
    return r.db.WithContext(ctx).Create(m).Error
}

func (r *registrationRepo) GetByID(ctx context.Context, id string) (*model.Registration, error) {
    if RepoTracer != nil { defer RepoTracer.StartDatastoreSegment(ctx, "registrations", "GetByID")() }
    var out model.Registration
    if err := r.db.WithContext(ctx).First(&out, "id = ?", id).Error; err != nil {
        return nil, err
    }
    return &out, nil
}

func (r *registrationRepo) FindByEmail(ctx context.Context, email string) (*model.Registration, error) {
    if RepoTracer != nil { defer RepoTracer.StartDatastoreSegment(ctx, "registrations", "FindByEmail")() }
    var out model.Registration
    if err := r.db.WithContext(ctx).First(&out, "email = ?", email).Error; err != nil {
        return nil, err
    }
    return &out, nil
}

func (r *registrationRepo) Update(ctx context.Context, m *model.Registration) error {
    if RepoTracer != nil { defer RepoTracer.StartDatastoreSegment(ctx, "registrations", "Update")() }
    return r.db.WithContext(ctx).Save(m).Error
}

func (r *registrationRepo) Delete(ctx context.Context, id string) error {
    if RepoTracer != nil { defer RepoTracer.StartDatastoreSegment(ctx, "registrations", "Delete")() }
    return r.db.WithContext(ctx).Delete(&model.Registration{}, "id = ?", id).Error
}

func (r *registrationRepo) List(ctx context.Context, p ListParams) (*PageResult[model.Registration], error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "registrations", "List")()
	}
	searchable := []string{"full_name", "email", "student_id", "motivation", "status", "program"}
	sorts := map[string]string{
		"id":          "id",
		"full_name":   "full_name",
		"email":       "email",
		"program":     "program",
		"student_id":  "student_id",
		"intake_year": "intake_year",
		"status":      "status",
		"approved_at": "approved_at",
		"created_at":  "created_at",
		"updated_at":  "updated_at",
	}
	q, err := ApplyListQuery(r.db.Model(&model.Registration{}), &p, searchable, sorts)
	if err != nil {
		return nil, err
	}
	var rows []model.Registration
	return Paginate[model.Registration](ctx, q, &p, &rows)
}
