package service

import (
	"context"

	"github.com/daisyorscry/itts/core"

	"be-itts-community/internal/model"
	"be-itts-community/internal/repository"
)

func (s *learningService) GetLearningAnalyticsOverview(ctx context.Context) (model.LearningAnalyticsOverviewResponse, error) {
	result, err := s.analyticsRepo.GetLearningAnalyticsOverview(ctx)
	if err != nil {
		return model.LearningAnalyticsOverviewResponse{}, core.InternalServerError("failed to fetch learning analytics overview").WithError(err)
	}
	return result, nil
}

func (s *learningService) ListCourseAnalytics(ctx context.Context, p repository.ListParams) (model.CourseAnalyticsListResponse, error) {
	result, err := s.analyticsRepo.ListCourseAnalytics(ctx, p)
	if err != nil {
		return model.CourseAnalyticsListResponse{}, core.InternalServerError("failed to list course analytics").WithError(err)
	}
	return model.CourseAnalyticsListResponse{
		Data:       result.Data,
		Total:      result.Total,
		Page:       result.Page,
		PageSize:   result.PageSize,
		TotalPages: result.TotalPages,
	}, nil
}
