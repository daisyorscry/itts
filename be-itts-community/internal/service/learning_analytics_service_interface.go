package service

import (
	"context"

	"be-itts-community/internal/model"
	"be-itts-community/internal/repository"
)

type LearningAnalyticsService interface {
	GetLearningAnalyticsOverview(ctx context.Context) (model.LearningAnalyticsOverviewResponse, error)
	ListCourseAnalytics(ctx context.Context, p repository.ListParams) (model.CourseAnalyticsListResponse, error)
}
