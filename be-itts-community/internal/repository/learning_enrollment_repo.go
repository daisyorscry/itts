package repository

import (
	"context"

	"be-itts-community/internal/model"
)

func (r *learningRepo) CreateEnrollment(ctx context.Context, enrollment *model.CourseEnrollment) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "course_enrollments", "Create")()
	}
	return r.db.Get(ctx).Create(enrollment).Error
}

func (r *learningRepo) GetEnrollmentByCourseUser(ctx context.Context, courseID, userID string) (*model.CourseEnrollment, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "course_enrollments", "GetByCourseUser")()
	}
	var enrollment model.CourseEnrollment
	if err := r.db.Get(ctx).
		Preload("Course").
		Preload("User").
		First(&enrollment, "course_id = ? AND user_id = ?", courseID, userID).Error; err != nil {
		return nil, err
	}
	return &enrollment, nil
}

func (r *learningRepo) UpdateEnrollment(ctx context.Context, enrollment *model.CourseEnrollment) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "course_enrollments", "Update")()
	}
	return r.db.Get(ctx).Save(enrollment).Error
}

func (r *learningRepo) ListEnrollmentsByUser(ctx context.Context, userID string, p ListParams) (*PageResult[model.CourseEnrollment], error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "course_enrollments", "ListByUser")()
	}
	base := r.db.Get(ctx).Model(&model.CourseEnrollment{}).Where("user_id = ?", userID)
	sorts := map[string]string{
		"enrolled_at":      "enrolled_at",
		"last_accessed_at": "last_accessed_at",
		"progress_percent": "progress_percent",
		"created_at":       "created_at",
	}
	q, err := ApplyListQuery(base, &p, nil, sorts)
	if err != nil {
		return nil, err
	}
	if len(p.Sort) == 0 {
		q = q.Order("created_at DESC")
	}
	q = q.Preload("Course").Preload("User")
	var rows []model.CourseEnrollment
	return Paginate[model.CourseEnrollment](ctx, q, &p, &rows)
}

func (r *learningRepo) GetLessonProgress(ctx context.Context, lessonID, userID string) (*model.LessonProgress, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "lesson_progress", "GetByLessonUser")()
	}
	var progress model.LessonProgress
	if err := r.db.Get(ctx).First(&progress, "lesson_id = ? AND user_id = ?", lessonID, userID).Error; err != nil {
		return nil, err
	}
	return &progress, nil
}

func (r *learningRepo) CreateLessonProgress(ctx context.Context, progress *model.LessonProgress) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "lesson_progress", "Create")()
	}
	return r.db.Get(ctx).Create(progress).Error
}

func (r *learningRepo) UpdateLessonProgress(ctx context.Context, progress *model.LessonProgress) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "lesson_progress", "Update")()
	}
	return r.db.Get(ctx).Save(progress).Error
}

func (r *learningRepo) CountPublishedLessonsByCourse(ctx context.Context, courseID string) (int64, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "lessons", "CountPublishedByCourse")()
	}
	var count int64
	err := r.db.Get(ctx).Model(&model.Lesson{}).
		Where("course_id = ? AND is_published = ?", courseID, true).
		Count(&count).Error
	return count, err
}

func (r *learningRepo) CountCompletedLessonsByCourse(ctx context.Context, courseID, userID string) (int64, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "lesson_progress", "CountCompletedByCourseUser")()
	}
	var count int64
	err := r.db.Get(ctx).Model(&model.LessonProgress{}).
		Joins("JOIN lessons ON lessons.id = lesson_progress.lesson_id").
		Where("lessons.course_id = ? AND lesson_progress.user_id = ? AND lesson_progress.is_completed = ?", courseID, userID, true).
		Count(&count).Error
	return count, err
}

func (r *learningRepo) CountCompletedLessonsByIDs(ctx context.Context, userID string, lessonIDs []string) (int64, error) {
	if len(lessonIDs) == 0 {
		return 0, nil
	}
	var count int64
	err := r.db.Get(ctx).Model(&model.LessonProgress{}).
		Where("user_id = ? AND lesson_id IN ? AND is_completed = ?", userID, lessonIDs, true).
		Count(&count).Error
	return count, err
}
