package repository

import (
	"context"

	"be-itts-community/internal/model"
)

func (r *roadmapItemRepo) RunInTransaction(ctx context.Context, f func(tx context.Context) error) error {
	return r.db.Run(ctx, f)
}

func (r *roadmapItemRepo) Create(ctx context.Context, m *model.RoadmapItem) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "roadmap_items", "Create")()
	}
	return r.db.Get(ctx).Create(m).Error
}
func (r *roadmapItemRepo) GetByID(ctx context.Context, id string) (*model.RoadmapItem, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "roadmap_items", "GetByID")()
	}
	var out model.RoadmapItem
	if err := r.db.Get(ctx).First(&out, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &out, nil
}
func (r *roadmapItemRepo) Update(ctx context.Context, m *model.RoadmapItem) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "roadmap_items", "Update")()
	}
	return r.db.Get(ctx).Save(m).Error
}
func (r *roadmapItemRepo) Delete(ctx context.Context, id string) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "roadmap_items", "Delete")()
	}
	return r.db.Get(ctx).Delete(&model.RoadmapItem{}, "id = ?", id).Error
}
func (r *roadmapItemRepo) List(ctx context.Context, p ListParams) (*PageResult[model.RoadmapItem], error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "roadmap_items", "List")()
	}
	searchable := []string{"item_text"}
	sorts := map[string]string{
		"id":         "id",
		"roadmap_id": "roadmap_id",
		"item_text":  "item_text",
		"sort_order": "sort_order",
	}
	q, err := ApplyListQuery(r.db.Get(ctx).Model(&model.RoadmapItem{}), &p, searchable, sorts)
	if err != nil {
		return nil, err
	}
	var rows []model.RoadmapItem
	return Paginate[model.RoadmapItem](ctx, q, &p, &rows)
}
