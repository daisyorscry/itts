package rest

import (
	"net/http"

	"be-itts-community/internal/model"
	"be-itts-community/internal/service"
)

type LearningHandler struct {
	catalogSvc     service.LearningCatalogService
	enrollmentSvc  service.LearningEnrollmentService
	quizSvc        service.LearningQuizService
	certificateSvc service.LearningCertificateService
	assignmentSvc  service.LearningAssignmentService
	analyticsSvc   service.LearningAnalyticsService
}

func NewLearningHandler(
	catalogSvc service.LearningCatalogService,
	enrollmentSvc service.LearningEnrollmentService,
	quizSvc service.LearningQuizService,
	certificateSvc service.LearningCertificateService,
	assignmentSvc service.LearningAssignmentService,
	analyticsSvc service.LearningAnalyticsService,
) *LearningHandler {
	return &LearningHandler{
		catalogSvc:     catalogSvc,
		enrollmentSvc:  enrollmentSvc,
		quizSvc:        quizSvc,
		certificateSvc: certificateSvc,
		assignmentSvc:  assignmentSvc,
		analyticsSvc:   analyticsSvc,
	}
}

func withAbsoluteCourseThumbnailURL(r *http.Request, course model.CourseResponse) model.CourseResponse {
	if course.ThumbnailURL != "" {
		course.ThumbnailURL = buildAbsoluteAssetURL(r, course.ThumbnailURL)
	}
	return course
}

func withAbsoluteCourseListThumbnailURL(r *http.Request, list model.CourseListResponse) model.CourseListResponse {
	for idx := range list.Data {
		list.Data[idx] = withAbsoluteCourseThumbnailURL(r, list.Data[idx])
	}
	return list
}
