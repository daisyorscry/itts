package repository

import (
	"context"

	"be-itts-community/internal/model"
	"gorm.io/gorm"
)

func (r *learningRepo) RunInTransaction(ctx context.Context, f func(tx context.Context) error) error {
	return r.db.Run(ctx, f)
}

func (r *learningRepo) listCourses(ctx context.Context, base *gorm.DB, p ListParams) (*PageResult[model.Course], error) {
	searchable := []string{"slug", "title", "subtitle", "description"}
	sorts := map[string]string{
		"title":        "title",
		"slug":         "slug",
		"status":       "status",
		"level":        "level",
		"published_at": "published_at",
		"created_at":   "created_at",
		"updated_at":   "updated_at",
	}

	q, err := ApplyListQuery(base, &p, searchable, sorts)
	if err != nil {
		return nil, err
	}

	if len(p.Sort) == 0 {
		q = q.Order("created_at DESC")
	}

	q = q.Preload("Sections", func(db *gorm.DB) *gorm.DB {
		return db.Order("sort_order ASC")
	}).Preload("Sections.Lessons", func(db *gorm.DB) *gorm.DB {
		return db.Order("sort_order ASC")
	}).Preload("Sections.Lessons.Prerequisites").
		Preload("Sections.Lessons.Quiz").
		Preload("Sections.Lessons.Assignment")

	var rows []model.Course
	return Paginate[model.Course](ctx, q, &p, &rows)
}

func (r *learningRepo) baseCourseQuery(ctx context.Context) *gorm.DB {
	return r.db.Get(ctx).Model(&model.Course{}).
		Preload("Sections", func(db *gorm.DB) *gorm.DB {
			return db.Order("sort_order ASC")
		}).
		Preload("Sections.Lessons", func(db *gorm.DB) *gorm.DB {
			return db.Order("sort_order ASC")
		}).
		Preload("Sections.Lessons.Prerequisites").
		Preload("Sections.Lessons.Quiz").
		Preload("Sections.Lessons.Assignment")
}

func (r *learningRepo) listCertificates(ctx context.Context, base *gorm.DB, p ListParams) (*PageResult[model.CourseCertificate], error) {
	sorts := map[string]string{
		"issued_at":  "issued_at",
		"created_at": "created_at",
		"updated_at": "updated_at",
		"status":     "status",
	}
	q, err := ApplyListQuery(base, &p, []string{"certificate_number"}, sorts)
	if err != nil {
		return nil, err
	}
	if len(p.Sort) == 0 {
		q = q.Order("issued_at DESC").Order("created_at DESC")
	}
	var rows []model.CourseCertificate
	return Paginate[model.CourseCertificate](ctx, q, &p, &rows)
}
