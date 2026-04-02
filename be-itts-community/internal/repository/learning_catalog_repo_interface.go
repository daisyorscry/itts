package repository

import (
	"context"

	"be-itts-community/internal/db"
	"be-itts-community/internal/model"
)

type LearningCatalogRepository interface {
	RunInTransaction(ctx context.Context, f func(tx context.Context) error) error
	CreateCourse(ctx context.Context, course *model.Course) error
	GetCourseByID(ctx context.Context, id string) (*model.Course, error)
	GetCourseBySlug(ctx context.Context, slug string) (*model.Course, error)
	GetPublishedCourseBySlug(ctx context.Context, slug string) (*model.Course, error)
	UpdateCourse(ctx context.Context, course *model.Course) error
	DeleteCourse(ctx context.Context, id string) error
	ListCourses(ctx context.Context, p ListParams) (*PageResult[model.Course], error)
	ListPublishedCourses(ctx context.Context, p ListParams) (*PageResult[model.Course], error)
	CourseSlugExists(ctx context.Context, slug string, excludeID *string) (bool, error)

	CreateSection(ctx context.Context, section *model.CourseSection) error
	GetSectionByID(ctx context.Context, id string) (*model.CourseSection, error)
	UpdateSection(ctx context.Context, section *model.CourseSection) error
	DeleteSection(ctx context.Context, id string) error

	CreateLesson(ctx context.Context, lesson *model.Lesson) error
	GetLessonByID(ctx context.Context, id string) (*model.Lesson, error)
	GetLessonsByIDs(ctx context.Context, ids []string) ([]model.Lesson, error)
	GetLessonWithSection(ctx context.Context, id string) (*model.Lesson, error)
	UpdateLesson(ctx context.Context, lesson *model.Lesson) error
	DeleteLesson(ctx context.Context, id string) error
	LessonSlugExists(ctx context.Context, courseID, slug string, excludeID *string) (bool, error)
	ReplaceLessonPrerequisites(ctx context.Context, lessonID string, prerequisiteLessonIDs []string) error
}

type learningRepo struct{ db db.Connection }

func NewLearningRepository(db db.Connection) *learningRepo {
	return &learningRepo{db: db}
}
