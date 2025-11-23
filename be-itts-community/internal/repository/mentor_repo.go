package repository

import (
	"context"

	"gorm.io/gorm"

	"be-itts-community/model"
)

type MentorRepository interface {
	Create(ctx context.Context, m *model.Mentor) error
	GetByID(ctx context.Context, id string) (*model.Mentor, error)
	Update(ctx context.Context, m *model.Mentor) error
	Delete(ctx context.Context, id string) error

	List(ctx context.Context, p *ListParams) (*PageResult[model.Mentor], error)
}

type mentorRepo struct{ db *gorm.DB }

func NewMentorRepository(d *gorm.DB) MentorRepository {
	return &mentorRepo{db: d}
}

func (r *mentorRepo) Create(ctx context.Context, m *model.Mentor) error {
	return r.db.WithContext(ctx).Create(m).Error
}
func (r *mentorRepo) GetByID(ctx context.Context, id string) (*model.Mentor, error) {
	var out model.Mentor
	if err := r.db.WithContext(ctx).First(&out, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &out, nil
}
func (r *mentorRepo) Update(ctx context.Context, m *model.Mentor) error {
	return r.db.WithContext(ctx).Save(m).Error
}
func (r *mentorRepo) Delete(ctx context.Context, id string) error {
	return r.db.WithContext(ctx).Delete(&model.Mentor{}, "id = ?", id).Error
}
func (r *mentorRepo) List(ctx context.Context, p *ListParams) (*PageResult[model.Mentor], error) {
	searchable := []string{"full_name", "title", "bio"}
	sorts := map[string]string{
		"id":         "id",
		"full_name":  "full_name",
		"is_active":  "is_active",
		"priority":   "priority",
		"created_at": "created_at",
		"updated_at": "updated_at",
	}
	q, err := ApplyListQuery(r.db.Model(&model.Mentor{}), p, searchable, sorts)
	if err != nil {
		return nil, err
	}
	var rows []model.Mentor
	return Paginate[model.Mentor](ctx, q, p, &rows)
}
