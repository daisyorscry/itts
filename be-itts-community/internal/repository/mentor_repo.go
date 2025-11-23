package repository

import (
	"context"

	"be-itts-community/internal/model"
)

func (r *mentorRepo) RunInTransaction(ctx context.Context, f func(tx context.Context) error) error {
	return r.db.Run(ctx, f)
}

func (r *mentorRepo) Create(ctx context.Context, m *model.Mentor) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "mentors", "Create")()
	}
	return r.db.Get(ctx).Create(m).Error
}
func (r *mentorRepo) GetByID(ctx context.Context, id string) (*model.Mentor, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "mentors", "GetByID")()
	}
	var out model.Mentor
	if err := r.db.Get(ctx).First(&out, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &out, nil
}
func (r *mentorRepo) Update(ctx context.Context, m *model.Mentor) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "mentors", "Update")()
	}
	return r.db.Get(ctx).Save(m).Error
}
func (r *mentorRepo) Delete(ctx context.Context, id string) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "mentors", "Delete")()
	}
	return r.db.Get(ctx).Delete(&model.Mentor{}, "id = ?", id).Error
}
func (r *mentorRepo) List(ctx context.Context, p ListParams) (*PageResult[model.Mentor], error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "mentors", "List")()
	}
	searchable := []string{"full_name", "title", "bio"}
	sorts := map[string]string{
		"id":         "id",
		"full_name":  "full_name",
		"is_active":  "is_active",
		"priority":   "priority",
		"created_at": "created_at",
		"updated_at": "updated_at",
	}
	q, err := ApplyListQuery(r.db.Get(ctx).Model(&model.Mentor{}), &p, searchable, sorts)
	if err != nil {
		return nil, err
	}
	var rows []model.Mentor
	return Paginate[model.Mentor](ctx, q, &p, &rows)
}
