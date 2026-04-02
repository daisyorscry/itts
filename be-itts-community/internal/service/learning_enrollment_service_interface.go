package service

import (
	"context"

	"be-itts-community/internal/model"
	"be-itts-community/internal/repository"
)

type LearningEnrollmentService interface {
	EnrollCourse(ctx context.Context, authCtx *model.AuthContext, req model.EnrollCourseRequest) (model.CourseEnrollmentResponse, error)
	UpdateLessonProgress(ctx context.Context, authCtx *model.AuthContext, lessonID string, req model.UpdateLessonProgressRequest) (model.CourseEnrollmentResponse, error)
	ListMyEnrollments(ctx context.Context, authCtx *model.AuthContext, p repository.ListParams) (*repository.PageResult[model.CourseEnrollmentResponse], error)
}
