package repository

import (
	"context"

	"be-itts-community/internal/model"
)

func (r *roadmapRepo) RunInTransaction(ctx context.Context, f func(tx context.Context) error) error {
	return r.db.Run(ctx, f)
}

func (r *roadmapRepo) Create(ctx context.Context, m *model.Roadmap) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "roadmaps", "Create")()
	}
	return r.db.Get(ctx).Create(m).Error
}
func (r *roadmapRepo) GetByID(ctx context.Context, id string) (*model.Roadmap, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "roadmaps", "GetByID")()
	}
	var out model.Roadmap
	if err := r.db.Get(ctx).Preload("Items").First(&out, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &out, nil
}
func (r *roadmapRepo) Update(ctx context.Context, m *model.Roadmap) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "roadmaps", "Update")()
	}
	return r.db.Get(ctx).Save(m).Error
}
func (r *roadmapRepo) Delete(ctx context.Context, id string) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "roadmaps", "Delete")()
	}
	return r.db.Get(ctx).Delete(&model.Roadmap{}, "id = ?", id).Error
}
func (r *roadmapRepo) List(ctx context.Context, p ListParams) (*PageResult[model.Roadmap], error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "roadmaps", "List")()
	}
	searchable := []string{"title", "description", "program"}
	sorts := map[string]string{
		"id":           "id",
		"program":      "program",
		"month_number": "month_number",
		"title":        "title",
		"sort_order":   "sort_order",
		"is_active":    "is_active",
		"created_at":   "created_at",
		"updated_at":   "updated_at",
	}
	q, err := ApplyListQuery(r.db.Get(ctx).Model(&model.Roadmap{}), &p, searchable, sorts)
	if err != nil {
		return nil, err
	}
	var rows []model.Roadmap
	return Paginate[model.Roadmap](ctx, q, &p, &rows)
}
