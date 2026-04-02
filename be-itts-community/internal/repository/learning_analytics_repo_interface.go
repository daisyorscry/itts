package repository

import (
	"context"

	"be-itts-community/internal/model"
)

type LearningAnalyticsRepository interface {
	GetLearningAnalyticsOverview(ctx context.Context) (model.LearningAnalyticsOverviewResponse, error)
	ListCourseAnalytics(ctx context.Context, p ListParams) (*PageResult[model.CourseAnalyticsResponse], error)
}
