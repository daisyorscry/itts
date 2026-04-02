package service

import (
	"strings"

	"be-itts-community/internal/repository"
	"be-itts-community/pkg/observability/nr"
)

type learningService struct {
	catalogRepo     repository.LearningCatalogRepository
	enrollmentRepo  repository.LearningEnrollmentRepository
	quizRepo        repository.LearningQuizRepository
	certificateRepo repository.LearningCertificateRepository
	assignmentRepo  repository.LearningAssignmentRepository
	analyticsRepo   repository.LearningAnalyticsRepository
	tracer          nr.Tracer
}

func NewLearningService(
	catalogRepo repository.LearningCatalogRepository,
	enrollmentRepo repository.LearningEnrollmentRepository,
	quizRepo repository.LearningQuizRepository,
	certificateRepo repository.LearningCertificateRepository,
	assignmentRepo repository.LearningAssignmentRepository,
	analyticsRepo repository.LearningAnalyticsRepository,
	tracer nr.Tracer,
) *learningService {
	return &learningService{
		catalogRepo:     catalogRepo,
		enrollmentRepo:  enrollmentRepo,
		quizRepo:        quizRepo,
		certificateRepo: certificateRepo,
		assignmentRepo:  assignmentRepo,
		analyticsRepo:   analyticsRepo,
		tracer:          tracer,
	}
}

func learningServiceStrPtr(value string) *string {
	if value == "" {
		return nil
	}
	return &value
}

func learningServiceNilIfEmpty(value string) *string {
	if value == "" {
		return nil
	}
	return &value
}

func equalStringSlices(a, b []string) bool {
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if a[i] != b[i] {
			return false
		}
	}
	return true
}

func generateCertificateNumber(courseID, userID string) string {
	return "CERT-" + shortToken(courseID) + "-" + shortToken(userID)
}

func shortToken(value string) string {
	clean := strings.ReplaceAll(value, "-", "")
	if len(clean) > 8 {
		return strings.ToUpper(clean[:8])
	}
	return strings.ToUpper(clean)
}
