package repository

import (
	"context"

	"gorm.io/gorm"

	"be-itts-community/internal/model"
)

type PartnerRepository interface {
	Create(ctx context.Context, m *model.Partner) error
	GetByID(ctx context.Context, id string) (*model.Partner, error)
	Update(ctx context.Context, m *model.Partner) error
	Delete(ctx context.Context, id string) error

	List(ctx context.Context, p ListParams) (*PageResult[model.Partner], error)
}

type partnerRepo struct{ db *gorm.DB }

func NewPartnerRepository(d *gorm.DB) PartnerRepository {
	return &partnerRepo{db: d}
}

func (r *partnerRepo) Create(ctx context.Context, m *model.Partner) error {
    if RepoTracer != nil { defer RepoTracer.StartDatastoreSegment(ctx, "partners", "Create")() }
    return r.db.WithContext(ctx).Create(m).Error
}
func (r *partnerRepo) GetByID(ctx context.Context, id string) (*model.Partner, error) {
    if RepoTracer != nil { defer RepoTracer.StartDatastoreSegment(ctx, "partners", "GetByID")() }
    var out model.Partner
	if err := r.db.WithContext(ctx).First(&out, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &out, nil
}
func (r *partnerRepo) Update(ctx context.Context, m *model.Partner) error {
    if RepoTracer != nil { defer RepoTracer.StartDatastoreSegment(ctx, "partners", "Update")() }
    return r.db.WithContext(ctx).Save(m).Error
}
func (r *partnerRepo) Delete(ctx context.Context, id string) error {
    if RepoTracer != nil { defer RepoTracer.StartDatastoreSegment(ctx, "partners", "Delete")() }
    return r.db.WithContext(ctx).Delete(&model.Partner{}, "id = ?", id).Error
}
func (r *partnerRepo) List(ctx context.Context, p ListParams) (*PageResult[model.Partner], error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "partners", "List")()
	}
	searchable := []string{"name", "subtitle", "description", "website_url"}
	sorts := map[string]string{
		"id":         "id",
		"name":       "name",
		"kind":       "kind",
		"is_active":  "is_active",
		"priority":   "priority",
		"created_at": "created_at",
		"updated_at": "updated_at",
	}
	q, err := ApplyListQuery(r.db.Model(&model.Partner{}), &p, searchable, sorts)
	if err != nil {
		return nil, err
	}
	var rows []model.Partner
	return Paginate[model.Partner](ctx, q, &p, &rows)
}
