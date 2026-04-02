package service

import (
	"context"

	"be-itts-community/internal/model"
	"be-itts-community/internal/repository"
)

type LearningCatalogService interface {
	ListPublicCourses(ctx context.Context, p repository.ListParams) (model.CourseListResponse, error)
	GetPublicCourseBySlug(ctx context.Context, slug string) (model.CourseResponse, error)
	ListCourses(ctx context.Context, p repository.ListParams) (model.CourseListResponse, error)
	CreateCourse(ctx context.Context, authCtx *model.AuthContext, req model.CreateCourseRequest) (model.CourseResponse, error)
	GetCourse(ctx context.Context, id string) (model.CourseResponse, error)
	UpdateCourse(ctx context.Context, authCtx *model.AuthContext, id string, req model.UpdateCourseRequest) (model.CourseResponse, error)
	DeleteCourse(ctx context.Context, id string) error
	CreateSection(ctx context.Context, req model.CreateCourseSectionRequest) (model.CourseSectionResponse, error)
	GetSection(ctx context.Context, id string) (model.CourseSectionResponse, error)
	UpdateSection(ctx context.Context, id string, req model.UpdateCourseSectionRequest) (model.CourseSectionResponse, error)
	DeleteSection(ctx context.Context, id string) error
	CreateLesson(ctx context.Context, req model.CreateLessonRequest) (model.LessonResponse, error)
	GetLesson(ctx context.Context, id string) (model.LessonResponse, error)
	UpdateLesson(ctx context.Context, id string, req model.UpdateLessonRequest) (model.LessonResponse, error)
	DeleteLesson(ctx context.Context, id string) error
}
