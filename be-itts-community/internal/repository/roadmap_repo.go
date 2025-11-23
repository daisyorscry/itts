package repository

import (
	"context"

	"gorm.io/gorm"

	"be-itts-community/model"
)

type RoadmapRepository interface {
	Create(ctx context.Context, m *model.Roadmap) error
	GetByID(ctx context.Context, id string) (*model.Roadmap, error)
	Update(ctx context.Context, m *model.Roadmap) error
	Delete(ctx context.Context, id string) error

	List(ctx context.Context, p *ListParams) (*PageResult[model.Roadmap], error)
}

type roadmapRepo struct{ db *gorm.DB }

func NewRoadmapRepository(d *gorm.DB) RoadmapRepository {
	return &roadmapRepo{db: d}
}

func (r *roadmapRepo) Create(ctx context.Context, m *model.Roadmap) error {
	return r.db.WithContext(ctx).Create(m).Error
}
func (r *roadmapRepo) GetByID(ctx context.Context, id string) (*model.Roadmap, error) {
	var out model.Roadmap
	if err := r.db.WithContext(ctx).Preload("Items").First(&out, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &out, nil
}
func (r *roadmapRepo) Update(ctx context.Context, m *model.Roadmap) error {
	return r.db.WithContext(ctx).Save(m).Error
}
func (r *roadmapRepo) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&model.Roadmap{}, "id = ?", id).Error
}
func (r *roadmapRepo) List(ctx context.Context, p *ListParams) (*PageResult[model.Roadmap], error) {
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
	q, err := ApplyListQuery(r.db.Model(&model.Roadmap{}), p, searchable, sorts)
	if err != nil {
		return nil, err
	}
	var rows []model.Roadmap
	return Paginate[model.Roadmap](ctx, q, p, &rows)
}
