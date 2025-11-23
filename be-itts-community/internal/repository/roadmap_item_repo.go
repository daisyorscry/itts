package repository

import (
	"context"

	"gorm.io/gorm"

	"be-itts-community/model"
)

type RoadmapItemRepository interface {
	Create(ctx context.Context, m *model.RoadmapItem) error
	GetByID(ctx context.Context, id string) (*model.RoadmapItem, error)
	Update(ctx context.Context, m *model.RoadmapItem) error
	Delete(ctx context.Context, id string) error

	List(ctx context.Context, p *ListParams) (*PageResult[model.RoadmapItem], error)
}

type roadmapItemRepo struct{ db *gorm.DB }

func NewRoadmapItemRepository(d *gorm.DB) RoadmapItemRepository {
	return &roadmapItemRepo{db: d}
}

func (r *roadmapItemRepo) Create(ctx context.Context, m *model.RoadmapItem) error {
	return r.db.WithContext(ctx).Create(m).Error
}
func (r *roadmapItemRepo) GetByID(ctx context.Context, id string) (*model.RoadmapItem, error) {
	var out model.RoadmapItem
	if err := r.db.WithContext(ctx).First(&out, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &out, nil
}
func (r *roadmapItemRepo) Update(ctx context.Context, m *model.RoadmapItem) error {
	return r.db.WithContext(ctx).Save(m).Error
}
func (r *roadmapItemRepo) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&model.RoadmapItem{}, "id = ?", id).Error
}
func (r *roadmapItemRepo) List(ctx context.Context, p *ListParams) (*PageResult[model.RoadmapItem], error) {
	searchable := []string{"item_text"}
	sorts := map[string]string{
		"id":         "id",
		"roadmap_id": "roadmap_id",
		"item_text":  "item_text",
		"sort_order": "sort_order",
	}
	q, err := ApplyListQuery(r.db.Model(&model.RoadmapItem{}), p, searchable, sorts)
	if err != nil {
		return nil, err
	}
	var rows []model.RoadmapItem
	return Paginate[model.RoadmapItem](ctx, q, p, &rows)
}
