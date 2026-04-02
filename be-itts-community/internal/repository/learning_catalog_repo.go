package repository

import (
	"context"

	"be-itts-community/internal/model"

	"gorm.io/gorm"
)

func (r *learningRepo) CreateCourse(ctx context.Context, course *model.Course) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "courses", "Create")()
	}
	return r.db.Get(ctx).Create(course).Error
}

func (r *learningRepo) GetCourseByID(ctx context.Context, id string) (*model.Course, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "courses", "GetByID")()
	}
	var course model.Course
	if err := r.baseCourseQuery(ctx).First(&course, "courses.id = ?", id).Error; err != nil {
		return nil, err
	}
	return &course, nil
}

func (r *learningRepo) GetCourseBySlug(ctx context.Context, slug string) (*model.Course, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "courses", "GetBySlug")()
	}
	var course model.Course
	if err := r.baseCourseQuery(ctx).First(&course, "courses.slug = ?", slug).Error; err != nil {
		return nil, err
	}
	return &course, nil
}

func (r *learningRepo) GetPublishedCourseBySlug(ctx context.Context, slug string) (*model.Course, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "courses", "GetPublishedBySlug")()
	}
	var course model.Course
	if err := r.baseCourseQuery(ctx).
		Where("courses.status = ?", model.CourseStatusPublished).
		First(&course, "courses.slug = ?", slug).Error; err != nil {
		return nil, err
	}
	return &course, nil
}

func (r *learningRepo) UpdateCourse(ctx context.Context, course *model.Course) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "courses", "Update")()
	}
	return r.db.Get(ctx).Save(course).Error
}

func (r *learningRepo) DeleteCourse(ctx context.Context, id string) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "courses", "Delete")()
	}
	return r.db.Get(ctx).Delete(&model.Course{}, "id = ?", id).Error
}

func (r *learningRepo) ListCourses(ctx context.Context, p ListParams) (*PageResult[model.Course], error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "courses", "List")()
	}
	return r.listCourses(ctx, r.db.Get(ctx).Model(&model.Course{}), p)
}

func (r *learningRepo) ListPublishedCourses(ctx context.Context, p ListParams) (*PageResult[model.Course], error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "courses", "ListPublished")()
	}
	base := r.db.Get(ctx).Model(&model.Course{}).Where("status = ?", model.CourseStatusPublished)
	return r.listCourses(ctx, base, p)
}

func (r *learningRepo) CourseSlugExists(ctx context.Context, slug string, excludeID *string) (bool, error) {
	var count int64
	q := r.db.Get(ctx).Model(&model.Course{}).Where("slug = ?", slug)
	if excludeID != nil && *excludeID != "" {
		q = q.Where("id <> ?", *excludeID)
	}
	if err := q.Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

func (r *learningRepo) CreateSection(ctx context.Context, section *model.CourseSection) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "course_sections", "Create")()
	}
	return r.db.Get(ctx).Create(section).Error
}

func (r *learningRepo) GetSectionByID(ctx context.Context, id string) (*model.CourseSection, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "course_sections", "GetByID")()
	}
	var section model.CourseSection
	if err := r.db.Get(ctx).Preload("Lessons", func(db *gorm.DB) *gorm.DB {
		return db.Order("sort_order ASC")
	}).Preload("Lessons.Prerequisites").
		Preload("Lessons.Quiz").
		Preload("Lessons.Assignment").
		First(&section, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &section, nil
}

func (r *learningRepo) UpdateSection(ctx context.Context, section *model.CourseSection) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "course_sections", "Update")()
	}
	return r.db.Get(ctx).Save(section).Error
}

func (r *learningRepo) DeleteSection(ctx context.Context, id string) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "course_sections", "Delete")()
	}
	return r.db.Get(ctx).Delete(&model.CourseSection{}, "id = ?", id).Error
}

func (r *learningRepo) CreateLesson(ctx context.Context, lesson *model.Lesson) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "lessons", "Create")()
	}
	return r.db.Get(ctx).Create(lesson).Error
}

func (r *learningRepo) GetLessonByID(ctx context.Context, id string) (*model.Lesson, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "lessons", "GetByID")()
	}
	var lesson model.Lesson
	if err := r.db.Get(ctx).Preload("Prerequisites").Preload("Quiz").Preload("Assignment").First(&lesson, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &lesson, nil
}

func (r *learningRepo) GetLessonsByIDs(ctx context.Context, ids []string) ([]model.Lesson, error) {
	if len(ids) == 0 {
		return []model.Lesson{}, nil
	}
	var lessons []model.Lesson
	if err := r.db.Get(ctx).
		Preload("Prerequisites").
		Preload("Quiz").
		Preload("Assignment").
		Where("id IN ?", ids).
		Find(&lessons).Error; err != nil {
		return nil, err
	}
	return lessons, nil
}

func (r *learningRepo) GetLessonWithSection(ctx context.Context, id string) (*model.Lesson, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "lessons", "GetWithSection")()
	}
	var lesson model.Lesson
	if err := r.db.Get(ctx).Preload("Prerequisites").Preload("Quiz").Preload("Assignment").First(&lesson, "id = ?", id).Error; err != nil {
		return nil, err
	}
	return &lesson, nil
}

func (r *learningRepo) UpdateLesson(ctx context.Context, lesson *model.Lesson) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "lessons", "Update")()
	}
	return r.db.Get(ctx).Save(lesson).Error
}

func (r *learningRepo) DeleteLesson(ctx context.Context, id string) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "lessons", "Delete")()
	}
	return r.db.Get(ctx).Delete(&model.Lesson{}, "id = ?", id).Error
}

func (r *learningRepo) LessonSlugExists(ctx context.Context, courseID, slug string, excludeID *string) (bool, error) {
	var count int64
	q := r.db.Get(ctx).Model(&model.Lesson{}).Where("course_id = ? AND slug = ?", courseID, slug)
	if excludeID != nil && *excludeID != "" {
		q = q.Where("id <> ?", *excludeID)
	}
	if err := q.Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

func (r *learningRepo) ReplaceLessonPrerequisites(ctx context.Context, lessonID string, prerequisiteLessonIDs []string) error {
	if err := r.db.Get(ctx).Where("lesson_id = ?", lessonID).Delete(&model.LessonPrerequisite{}).Error; err != nil {
		return err
	}
	if len(prerequisiteLessonIDs) == 0 {
		return nil
	}
	rows := make([]model.LessonPrerequisite, 0, len(prerequisiteLessonIDs))
	for _, prerequisiteLessonID := range prerequisiteLessonIDs {
		rows = append(rows, model.LessonPrerequisite{
			LessonID:             lessonID,
			PrerequisiteLessonID: prerequisiteLessonID,
		})
	}
	return r.db.Get(ctx).Create(&rows).Error
}
