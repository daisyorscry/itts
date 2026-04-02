package rest

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/go-chi/chi/v5"

	"be-itts-community/internal/middleware"
	"be-itts-community/internal/model"
	"be-itts-community/internal/repository"
	"be-itts-community/internal/service"
	"be-itts-community/pkg/auth"
)

type fakeLearningHandlerService struct {
	listPublicCoursesFn  func(ctx context.Context, p repository.ListParams) (model.CourseListResponse, error)
	enrollCourseFn       func(ctx context.Context, authCtx *model.AuthContext, req model.EnrollCourseRequest) (model.CourseEnrollmentResponse, error)
	submitQuizAttemptFn  func(ctx context.Context, authCtx *model.AuthContext, req model.SubmitQuizAttemptRequest) (model.QuizAttemptResponse, error)
	listMyCertificatesFn func(ctx context.Context, authCtx *model.AuthContext, p repository.ListParams) (model.CourseCertificateListResponse, error)
	verifyCertificateFn  func(ctx context.Context, certificateNumber string) (model.CertificateVerificationResponse, error)
	lastAuthCtx          *model.AuthContext
	lastEnrollRequest    *model.EnrollCourseRequest
	lastQuizAttemptReq   *model.SubmitQuizAttemptRequest
	lastListParams       *repository.ListParams
}

func (f *fakeLearningHandlerService) ListPublicCourses(ctx context.Context, p repository.ListParams) (model.CourseListResponse, error) {
	f.lastListParams = &p
	if f.listPublicCoursesFn != nil {
		return f.listPublicCoursesFn(ctx, p)
	}
	return model.CourseListResponse{}, nil
}

func (f *fakeLearningHandlerService) GetPublicCourseBySlug(ctx context.Context, slug string) (model.CourseResponse, error) {
	return model.CourseResponse{}, nil
}

func (f *fakeLearningHandlerService) ListCourses(ctx context.Context, p repository.ListParams) (model.CourseListResponse, error) {
	return model.CourseListResponse{}, nil
}

func (f *fakeLearningHandlerService) CreateCourse(ctx context.Context, authCtx *model.AuthContext, req model.CreateCourseRequest) (model.CourseResponse, error) {
	return model.CourseResponse{}, nil
}

func (f *fakeLearningHandlerService) GetCourse(ctx context.Context, id string) (model.CourseResponse, error) {
	return model.CourseResponse{}, nil
}

func (f *fakeLearningHandlerService) UpdateCourse(ctx context.Context, authCtx *model.AuthContext, id string, req model.UpdateCourseRequest) (model.CourseResponse, error) {
	return model.CourseResponse{}, nil
}

func (f *fakeLearningHandlerService) DeleteCourse(ctx context.Context, id string) error {
	return nil
}

func (f *fakeLearningHandlerService) CreateSection(ctx context.Context, req model.CreateCourseSectionRequest) (model.CourseSectionResponse, error) {
	return model.CourseSectionResponse{}, nil
}

func (f *fakeLearningHandlerService) GetSection(ctx context.Context, id string) (model.CourseSectionResponse, error) {
	return model.CourseSectionResponse{}, nil
}

func (f *fakeLearningHandlerService) UpdateSection(ctx context.Context, id string, req model.UpdateCourseSectionRequest) (model.CourseSectionResponse, error) {
	return model.CourseSectionResponse{}, nil
}

func (f *fakeLearningHandlerService) DeleteSection(ctx context.Context, id string) error {
	return nil
}

func (f *fakeLearningHandlerService) CreateLesson(ctx context.Context, req model.CreateLessonRequest) (model.LessonResponse, error) {
	return model.LessonResponse{}, nil
}

func (f *fakeLearningHandlerService) GetLesson(ctx context.Context, id string) (model.LessonResponse, error) {
	return model.LessonResponse{}, nil
}

func (f *fakeLearningHandlerService) UpdateLesson(ctx context.Context, id string, req model.UpdateLessonRequest) (model.LessonResponse, error) {
	return model.LessonResponse{}, nil
}

func (f *fakeLearningHandlerService) DeleteLesson(ctx context.Context, id string) error {
	return nil
}

func (f *fakeLearningHandlerService) EnrollCourse(ctx context.Context, authCtx *model.AuthContext, req model.EnrollCourseRequest) (model.CourseEnrollmentResponse, error) {
	f.lastAuthCtx = authCtx
	f.lastEnrollRequest = &req
	if f.enrollCourseFn != nil {
		return f.enrollCourseFn(ctx, authCtx, req)
	}
	return model.CourseEnrollmentResponse{}, nil
}

func (f *fakeLearningHandlerService) UpdateLessonProgress(ctx context.Context, authCtx *model.AuthContext, lessonID string, req model.UpdateLessonProgressRequest) (model.CourseEnrollmentResponse, error) {
	return model.CourseEnrollmentResponse{}, nil
}

func (f *fakeLearningHandlerService) ListMyEnrollments(ctx context.Context, authCtx *model.AuthContext, p repository.ListParams) (*repository.PageResult[model.CourseEnrollmentResponse], error) {
	return &repository.PageResult[model.CourseEnrollmentResponse]{}, nil
}

func (f *fakeLearningHandlerService) CreateQuiz(ctx context.Context, req model.CreateQuizRequest) (model.QuizResponse, error) {
	return model.QuizResponse{}, nil
}

func (f *fakeLearningHandlerService) GetQuiz(ctx context.Context, id string) (model.QuizResponse, error) {
	return model.QuizResponse{}, nil
}

func (f *fakeLearningHandlerService) UpdateQuiz(ctx context.Context, id string, req model.UpdateQuizRequest) (model.QuizResponse, error) {
	return model.QuizResponse{}, nil
}

func (f *fakeLearningHandlerService) DeleteQuiz(ctx context.Context, id string) error {
	return nil
}

func (f *fakeLearningHandlerService) SubmitQuizAttempt(ctx context.Context, authCtx *model.AuthContext, req model.SubmitQuizAttemptRequest) (model.QuizAttemptResponse, error) {
	f.lastAuthCtx = authCtx
	f.lastQuizAttemptReq = &req
	if f.submitQuizAttemptFn != nil {
		return f.submitQuizAttemptFn(ctx, authCtx, req)
	}
	return model.QuizAttemptResponse{}, nil
}

func (f *fakeLearningHandlerService) ListCertificates(ctx context.Context, p repository.ListParams) (model.CourseCertificateListResponse, error) {
	return model.CourseCertificateListResponse{}, nil
}

func (f *fakeLearningHandlerService) ListMyCertificates(ctx context.Context, authCtx *model.AuthContext, p repository.ListParams) (model.CourseCertificateListResponse, error) {
	f.lastAuthCtx = authCtx
	if f.listMyCertificatesFn != nil {
		return f.listMyCertificatesFn(ctx, authCtx, p)
	}
	return model.CourseCertificateListResponse{}, nil
}

func (f *fakeLearningHandlerService) VerifyCertificate(ctx context.Context, certificateNumber string) (model.CertificateVerificationResponse, error) {
	if f.verifyCertificateFn != nil {
		return f.verifyCertificateFn(ctx, certificateNumber)
	}
	return model.CertificateVerificationResponse{}, nil
}

func (f *fakeLearningHandlerService) CreateAssignment(ctx context.Context, req model.CreateAssignmentRequest) (model.AssignmentResponse, error) {
	return model.AssignmentResponse{}, nil
}

func (f *fakeLearningHandlerService) GetAssignment(ctx context.Context, id string) (model.AssignmentResponse, error) {
	return model.AssignmentResponse{}, nil
}

func (f *fakeLearningHandlerService) UpdateAssignment(ctx context.Context, id string, req model.UpdateAssignmentRequest) (model.AssignmentResponse, error) {
	return model.AssignmentResponse{}, nil
}

func (f *fakeLearningHandlerService) DeleteAssignment(ctx context.Context, id string) error {
	return nil
}

func (f *fakeLearningHandlerService) SubmitAssignment(ctx context.Context, authCtx *model.AuthContext, req model.SubmitAssignmentRequest) (model.AssignmentSubmissionResponse, error) {
	return model.AssignmentSubmissionResponse{}, nil
}

func (f *fakeLearningHandlerService) ReviewAssignmentSubmission(ctx context.Context, authCtx *model.AuthContext, id string, req model.ReviewAssignmentSubmissionRequest) (model.AssignmentSubmissionResponse, error) {
	return model.AssignmentSubmissionResponse{}, nil
}

func (f *fakeLearningHandlerService) ListAssignmentSubmissions(ctx context.Context, assignmentID string, p repository.ListParams) (model.AssignmentSubmissionListResponse, error) {
	return model.AssignmentSubmissionListResponse{}, nil
}

func (f *fakeLearningHandlerService) ListMyAssignmentSubmissions(ctx context.Context, authCtx *model.AuthContext, p repository.ListParams) (model.AssignmentSubmissionListResponse, error) {
	return model.AssignmentSubmissionListResponse{}, nil
}

func (f *fakeLearningHandlerService) GetLearningAnalyticsOverview(ctx context.Context) (model.LearningAnalyticsOverviewResponse, error) {
	return model.LearningAnalyticsOverviewResponse{}, nil
}

func (f *fakeLearningHandlerService) ListCourseAnalytics(ctx context.Context, p repository.ListParams) (model.CourseAnalyticsListResponse, error) {
	return model.CourseAnalyticsListResponse{}, nil
}

var (
	_ service.LearningCatalogService     = (*fakeLearningHandlerService)(nil)
	_ service.LearningEnrollmentService  = (*fakeLearningHandlerService)(nil)
	_ service.LearningQuizService        = (*fakeLearningHandlerService)(nil)
	_ service.LearningCertificateService = (*fakeLearningHandlerService)(nil)
	_ service.LearningAssignmentService  = (*fakeLearningHandlerService)(nil)
	_ service.LearningAnalyticsService   = (*fakeLearningHandlerService)(nil)
)

func TestLearningHandlerListPublicCourses(t *testing.T) {
	t.Setenv("ASSET_BASE_URL", "https://cdn.itts.test")
	t.Setenv("ASSET_BUCKET", "assets")

	svc := &fakeLearningHandlerService{
		listPublicCoursesFn: func(ctx context.Context, p repository.ListParams) (model.CourseListResponse, error) {
			return model.CourseListResponse{
				Data: []model.CourseResponse{
					{ID: "course-1", Title: "Go Basics", ThumbnailURL: "/courses/go-basics.png"},
				},
				Total: 1,
			}, nil
		},
	}
	h := NewLearningHandler(svc, svc, svc, svc, svc, svc)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/learning/courses?search=go&page=2&page_size=5", nil)
	rec := httptest.NewRecorder()
	h.ListPublicCourses(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d, body=%s", http.StatusOK, rec.Code, rec.Body.String())
	}
	if svc.lastListParams == nil || svc.lastListParams.Search != "go" || svc.lastListParams.Page != 2 || svc.lastListParams.PageSize != 5 {
		t.Fatalf("unexpected list params: %#v", svc.lastListParams)
	}

	var response struct {
		Data model.CourseListResponse `json:"data"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &response); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if len(response.Data.Data) != 1 {
		t.Fatalf("expected one course, got %#v", response.Data.Data)
	}
	if response.Data.Data[0].ThumbnailURL != "https://cdn.itts.test/assets/courses/go-basics.png" {
		t.Fatalf("unexpected thumbnail url %q", response.Data.Data[0].ThumbnailURL)
	}
}

func TestLearningHandlerEnrollCourseUsesAuthContext(t *testing.T) {
	svc := &fakeLearningHandlerService{
		enrollCourseFn: func(ctx context.Context, authCtx *model.AuthContext, req model.EnrollCourseRequest) (model.CourseEnrollmentResponse, error) {
			return model.CourseEnrollmentResponse{
				ID:       "enrollment-1",
				CourseID: req.CourseID,
				UserID:   authCtx.UserID,
				Status:   model.EnrollmentStatusActive,
			}, nil
		},
	}
	h := NewLearningHandler(svc, svc, svc, svc, svc, svc)

	body := bytes.NewBufferString(`{"course_id":"course-1"}`)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/learning/enrollments", body)
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	serveLearningAuthenticated(t, http.HandlerFunc(h.EnrollCourse), rec, req, "user-1")

	if rec.Code != http.StatusCreated {
		t.Fatalf("expected status %d, got %d, body=%s", http.StatusCreated, rec.Code, rec.Body.String())
	}
	if svc.lastAuthCtx == nil || svc.lastAuthCtx.UserID != "user-1" {
		t.Fatalf("unexpected auth context: %#v", svc.lastAuthCtx)
	}
	if svc.lastEnrollRequest == nil || svc.lastEnrollRequest.CourseID != "course-1" {
		t.Fatalf("unexpected enroll request: %#v", svc.lastEnrollRequest)
	}

	var response struct {
		Data model.CourseEnrollmentResponse `json:"data"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &response); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if response.Data.UserID != "user-1" || response.Data.CourseID != "course-1" {
		t.Fatalf("unexpected response payload: %#v", response.Data)
	}
}

func TestLearningHandlerSubmitQuizAttemptUsesAuthContext(t *testing.T) {
	svc := &fakeLearningHandlerService{
		submitQuizAttemptFn: func(ctx context.Context, authCtx *model.AuthContext, req model.SubmitQuizAttemptRequest) (model.QuizAttemptResponse, error) {
			score := 100
			passed := true
			now := time.Now()
			return model.QuizAttemptResponse{
				ID:          "attempt-1",
				QuizID:      req.QuizID,
				UserID:      authCtx.UserID,
				Status:      model.QuizAttemptStatusGraded,
				Score:       &score,
				Passed:      &passed,
				StartedAt:   now,
				SubmittedAt: &now,
				GradedAt:    &now,
			}, nil
		},
	}
	h := NewLearningHandler(svc, svc, svc, svc, svc, svc)

	body := bytes.NewBufferString(`{"quiz_id":"quiz-1","answers":[{"question_id":"question-1","selected_option_ids":["option-1"]}]}`)
	req := httptest.NewRequest(http.MethodPost, "/api/v1/learning/quiz-attempts", body)
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()

	serveLearningAuthenticated(t, http.HandlerFunc(h.SubmitQuizAttempt), rec, req, "user-99")

	if rec.Code != http.StatusCreated {
		t.Fatalf("expected status %d, got %d, body=%s", http.StatusCreated, rec.Code, rec.Body.String())
	}
	if svc.lastAuthCtx == nil || svc.lastAuthCtx.UserID != "user-99" {
		t.Fatalf("unexpected auth context: %#v", svc.lastAuthCtx)
	}
	if svc.lastQuizAttemptReq == nil || svc.lastQuizAttemptReq.QuizID != "quiz-1" {
		t.Fatalf("unexpected quiz attempt request: %#v", svc.lastQuizAttemptReq)
	}

	var response struct {
		Data model.QuizAttemptResponse `json:"data"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &response); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if response.Data.UserID != "user-99" || response.Data.QuizID != "quiz-1" {
		t.Fatalf("unexpected response payload: %#v", response.Data)
	}
}

func TestLearningHandlerVerifyCertificate(t *testing.T) {
	svc := &fakeLearningHandlerService{
		verifyCertificateFn: func(ctx context.Context, certificateNumber string) (model.CertificateVerificationResponse, error) {
			return model.CertificateVerificationResponse{
				Verified: true,
				Certificate: model.CourseCertificateResponse{
					CertificateNumber: certificateNumber,
					Status:            model.CertificateStatusIssued,
				},
			}, nil
		},
	}
	h := NewLearningHandler(svc, svc, svc, svc, svc, svc)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/learning/certificates/verify/CERT-123", nil)
	rec := httptest.NewRecorder()
	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("certificate_number", "CERT-123")
	req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))

	h.VerifyCertificate(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status %d, got %d, body=%s", http.StatusOK, rec.Code, rec.Body.String())
	}

	var response struct {
		Data model.CertificateVerificationResponse `json:"data"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &response); err != nil {
		t.Fatalf("decode response: %v", err)
	}
	if !response.Data.Verified || response.Data.Certificate.CertificateNumber != "CERT-123" {
		t.Fatalf("unexpected verification response: %#v", response.Data)
	}
}

func serveLearningAuthenticated(t *testing.T, next http.Handler, rec *httptest.ResponseRecorder, req *http.Request, userID string) {
	t.Helper()

	jwtManager := auth.NewJWTManager("test-secret", time.Hour, time.Hour, "test")
	token, err := jwtManager.GenerateAccessToken(userID, userID+"@example.com", false, nil, nil)
	if err != nil {
		t.Fatalf("generate access token: %v", err)
	}
	req.Header.Set("Authorization", "Bearer "+token)

	handler := middleware.JWTMiddleware(jwtManager)(middleware.RequireAuth()(next))
	handler.ServeHTTP(rec, req)
}
