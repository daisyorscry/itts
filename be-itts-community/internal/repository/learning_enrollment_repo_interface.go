package repository

import (
	"context"

	"be-itts-community/internal/model"
)

type LearningEnrollmentRepository interface {
	RunInTransaction(ctx context.Context, f func(tx context.Context) error) error
	CreateEnrollment(ctx context.Context, enrollment *model.CourseEnrollment) error
	GetEnrollmentByCourseUser(ctx context.Context, courseID, userID string) (*model.CourseEnrollment, error)
	UpdateEnrollment(ctx context.Context, enrollment *model.CourseEnrollment) error
	ListEnrollmentsByUser(ctx context.Context, userID string, p ListParams) (*PageResult[model.CourseEnrollment], error)

	GetLessonProgress(ctx context.Context, lessonID, userID string) (*model.LessonProgress, error)
	CreateLessonProgress(ctx context.Context, progress *model.LessonProgress) error
	UpdateLessonProgress(ctx context.Context, progress *model.LessonProgress) error

	CountPublishedLessonsByCourse(ctx context.Context, courseID string) (int64, error)
	CountCompletedLessonsByCourse(ctx context.Context, courseID, userID string) (int64, error)
	CountCompletedLessonsByIDs(ctx context.Context, userID string, lessonIDs []string) (int64, error)
}
