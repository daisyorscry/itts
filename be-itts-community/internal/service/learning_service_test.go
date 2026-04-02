package service

import (
	"context"
	"strings"
	"testing"
	"time"

	"be-itts-community/internal/model"
	"be-itts-community/internal/repository"

	"gorm.io/gorm"
)

type fakeLearningRepo struct {
	courseSlugExists       bool
	course                 *model.Course
	section                *model.CourseSection
	quiz                   *model.Quiz
	lesson                 *model.Lesson
	lessonsByID            map[string]*model.Lesson
	enrollment             *model.CourseEnrollment
	publishedLessonsCount  int64
	completedLessonsCount  int64
	quizAttemptsCount      int64
	lessonProgress         *model.LessonProgress
	lessonProgressByLesson map[string]*model.LessonProgress
	certificate            *model.CourseCertificate
	createdCourse          *model.Course
	createdAttempt         *model.QuizAttempt
	createdAttemptAnswers  []model.QuizAttemptAnswer
	createdCertificate     *model.CourseCertificate
	updatedEnrollment      *model.CourseEnrollment
	assignment             *model.Assignment
	assignmentSubmission   *model.AssignmentSubmission
	updatedSections        []model.CourseSection
	updatedLessons         []model.Lesson
	createdSection         *model.CourseSection
	createdLesson          *model.Lesson
}

func learningServiceIntPtr(value int) *int {
	return &value
}

func (f *fakeLearningRepo) RunInTransaction(ctx context.Context, fn func(tx context.Context) error) error {
	return fn(ctx)
}

func (f *fakeLearningRepo) CreateCourse(ctx context.Context, course *model.Course) error {
	f.createdCourse = course
	return nil
}

func (f *fakeLearningRepo) GetCourseByID(ctx context.Context, id string) (*model.Course, error) {
	if f.course == nil {
		return nil, gorm.ErrRecordNotFound
	}
	return f.course, nil
}

func (f *fakeLearningRepo) GetCourseBySlug(ctx context.Context, slug string) (*model.Course, error) {
	return nil, gorm.ErrRecordNotFound
}

func (f *fakeLearningRepo) GetPublishedCourseBySlug(ctx context.Context, slug string) (*model.Course, error) {
	return nil, gorm.ErrRecordNotFound
}

func (f *fakeLearningRepo) UpdateCourse(ctx context.Context, course *model.Course) error { return nil }
func (f *fakeLearningRepo) DeleteCourse(ctx context.Context, id string) error            { return nil }

func (f *fakeLearningRepo) ListCourses(ctx context.Context, p repository.ListParams) (*repository.PageResult[model.Course], error) {
	return &repository.PageResult[model.Course]{}, nil
}

func (f *fakeLearningRepo) ListPublishedCourses(ctx context.Context, p repository.ListParams) (*repository.PageResult[model.Course], error) {
	return &repository.PageResult[model.Course]{}, nil
}

func (f *fakeLearningRepo) CourseSlugExists(ctx context.Context, slug string, excludeID *string) (bool, error) {
	return f.courseSlugExists, nil
}

func (f *fakeLearningRepo) CreateSection(ctx context.Context, section *model.CourseSection) error {
	copied := *section
	f.createdSection = &copied
	return nil
}
func (f *fakeLearningRepo) GetSectionByID(ctx context.Context, id string) (*model.CourseSection, error) {
	if f.section != nil && f.section.ID == id {
		return f.section, nil
	}
	return nil, gorm.ErrRecordNotFound
}
func (f *fakeLearningRepo) UpdateSection(ctx context.Context, section *model.CourseSection) error {
	copied := *section
	f.updatedSections = append(f.updatedSections, copied)
	if f.section != nil && f.section.ID == section.ID {
		f.section = &copied
	}
	if f.course != nil {
		for index := range f.course.Sections {
			if f.course.Sections[index].ID == section.ID {
				f.course.Sections[index] = copied
			}
		}
	}
	return nil
}
func (f *fakeLearningRepo) DeleteSection(ctx context.Context, id string) error { return nil }
func (f *fakeLearningRepo) CreateLesson(ctx context.Context, lesson *model.Lesson) error {
	copied := *lesson
	f.createdLesson = &copied
	return nil
}

func (f *fakeLearningRepo) GetLessonByID(ctx context.Context, id string) (*model.Lesson, error) {
	if f.lessonsByID != nil {
		if lesson, ok := f.lessonsByID[id]; ok {
			return lesson, nil
		}
		return nil, gorm.ErrRecordNotFound
	}
	if f.lesson == nil {
		return nil, gorm.ErrRecordNotFound
	}
	return f.lesson, nil
}

func (f *fakeLearningRepo) GetLessonWithSection(ctx context.Context, id string) (*model.Lesson, error) {
	return f.GetLessonByID(ctx, id)
}

func (f *fakeLearningRepo) GetLessonsByIDs(ctx context.Context, ids []string) ([]model.Lesson, error) {
	if f.lessonsByID != nil {
		out := make([]model.Lesson, 0, len(ids))
		for _, id := range ids {
			if lesson, ok := f.lessonsByID[id]; ok {
				out = append(out, *lesson)
			}
		}
		return out, nil
	}
	if f.lesson == nil {
		return []model.Lesson{}, nil
	}
	return []model.Lesson{*f.lesson}, nil
}

func (f *fakeLearningRepo) UpdateLesson(ctx context.Context, lesson *model.Lesson) error {
	copied := *lesson
	f.updatedLessons = append(f.updatedLessons, copied)
	if f.lesson != nil && f.lesson.ID == lesson.ID {
		f.lesson = &copied
	}
	if f.lessonsByID != nil {
		f.lessonsByID[lesson.ID] = &copied
	}
	if f.section != nil {
		for index := range f.section.Lessons {
			if f.section.Lessons[index].ID == lesson.ID {
				f.section.Lessons[index] = copied
			}
		}
	}
	return nil
}
func (f *fakeLearningRepo) DeleteLesson(ctx context.Context, id string) error { return nil }
func (f *fakeLearningRepo) LessonSlugExists(ctx context.Context, courseID, slug string, excludeID *string) (bool, error) {
	return false, nil
}
func (f *fakeLearningRepo) ReplaceLessonPrerequisites(ctx context.Context, lessonID string, prerequisiteLessonIDs []string) error {
	return nil
}

func (f *fakeLearningRepo) CreateQuiz(ctx context.Context, quiz *model.Quiz) error { return nil }
func (f *fakeLearningRepo) CreateQuizQuestion(ctx context.Context, question *model.QuizQuestion) error {
	return nil
}
func (f *fakeLearningRepo) CreateQuizOption(ctx context.Context, option *model.QuizOption) error {
	return nil
}

func (f *fakeLearningRepo) GetQuizByID(ctx context.Context, id string) (*model.Quiz, error) {
	if f.quiz == nil {
		return nil, gorm.ErrRecordNotFound
	}
	return f.quiz, nil
}

func (f *fakeLearningRepo) GetQuizByLessonID(ctx context.Context, lessonID string) (*model.Quiz, error) {
	return nil, gorm.ErrRecordNotFound
}

func (f *fakeLearningRepo) UpdateQuiz(ctx context.Context, quiz *model.Quiz) error       { return nil }
func (f *fakeLearningRepo) DeleteQuiz(ctx context.Context, id string) error              { return nil }
func (f *fakeLearningRepo) DeleteQuizQuestions(ctx context.Context, quizID string) error { return nil }

func (f *fakeLearningRepo) CreateQuizAttempt(ctx context.Context, attempt *model.QuizAttempt) error {
	attempt.ID = "attempt-1"
	f.createdAttempt = attempt
	return nil
}

func (f *fakeLearningRepo) CreateQuizAttemptAnswer(ctx context.Context, answer *model.QuizAttemptAnswer) error {
	f.createdAttemptAnswers = append(f.createdAttemptAnswers, *answer)
	return nil
}

func (f *fakeLearningRepo) CountQuizAttemptsByUser(ctx context.Context, quizID, userID string) (int64, error) {
	return f.quizAttemptsCount, nil
}

func (f *fakeLearningRepo) GetCertificateByCourseUser(ctx context.Context, courseID, userID string) (*model.CourseCertificate, error) {
	if f.createdCertificate != nil && f.createdCertificate.CourseID == courseID && f.createdCertificate.UserID == userID {
		return f.createdCertificate, nil
	}
	if f.certificate == nil {
		return nil, gorm.ErrRecordNotFound
	}
	return f.certificate, nil
}

func (f *fakeLearningRepo) CreateCertificate(ctx context.Context, certificate *model.CourseCertificate) error {
	f.createdCertificate = certificate
	f.certificate = certificate
	return nil
}

func (f *fakeLearningRepo) GetCertificateByNumber(ctx context.Context, certificateNumber string) (*model.CourseCertificate, error) {
	if f.createdCertificate != nil && f.createdCertificate.CertificateNumber == certificateNumber {
		return f.createdCertificate, nil
	}
	if f.certificate == nil {
		return nil, gorm.ErrRecordNotFound
	}
	return f.certificate, nil
}

func (f *fakeLearningRepo) ListCertificates(ctx context.Context, p repository.ListParams) (*repository.PageResult[model.CourseCertificate], error) {
	return &repository.PageResult[model.CourseCertificate]{}, nil
}

func (f *fakeLearningRepo) ListCertificatesByUser(ctx context.Context, userID string, p repository.ListParams) (*repository.PageResult[model.CourseCertificate], error) {
	return &repository.PageResult[model.CourseCertificate]{}, nil
}

func (f *fakeLearningRepo) CreateEnrollment(ctx context.Context, enrollment *model.CourseEnrollment) error {
	f.enrollment = enrollment
	return nil
}

func (f *fakeLearningRepo) GetEnrollmentByCourseUser(ctx context.Context, courseID, userID string) (*model.CourseEnrollment, error) {
	if f.enrollment == nil {
		return nil, gorm.ErrRecordNotFound
	}
	return f.enrollment, nil
}

func (f *fakeLearningRepo) UpdateEnrollment(ctx context.Context, enrollment *model.CourseEnrollment) error {
	copied := *enrollment
	f.updatedEnrollment = &copied
	return nil
}

func (f *fakeLearningRepo) ListEnrollmentsByUser(ctx context.Context, userID string, p repository.ListParams) (*repository.PageResult[model.CourseEnrollment], error) {
	return &repository.PageResult[model.CourseEnrollment]{}, nil
}

func (f *fakeLearningRepo) GetLessonProgress(ctx context.Context, lessonID, userID string) (*model.LessonProgress, error) {
	if f.lessonProgressByLesson != nil {
		progress, ok := f.lessonProgressByLesson[lessonID]
		if !ok || progress == nil {
			return nil, gorm.ErrRecordNotFound
		}
		return progress, nil
	}
	if f.lessonProgress == nil {
		return nil, gorm.ErrRecordNotFound
	}
	return f.lessonProgress, nil
}

func (f *fakeLearningRepo) CreateLessonProgress(ctx context.Context, progress *model.LessonProgress) error {
	if f.lessonProgressByLesson != nil {
		f.lessonProgressByLesson[progress.LessonID] = progress
	}
	f.lessonProgress = progress
	return nil
}

func (f *fakeLearningRepo) UpdateLessonProgress(ctx context.Context, progress *model.LessonProgress) error {
	if f.lessonProgressByLesson != nil {
		f.lessonProgressByLesson[progress.LessonID] = progress
	}
	f.lessonProgress = progress
	return nil
}

func (f *fakeLearningRepo) CountPublishedLessonsByCourse(ctx context.Context, courseID string) (int64, error) {
	if f.lessonsByID != nil {
		var count int64
		for _, lesson := range f.lessonsByID {
			if lesson.CourseID == courseID && lesson.IsPublished {
				count++
			}
		}
		return count, nil
	}
	return f.publishedLessonsCount, nil
}

func (f *fakeLearningRepo) CountCompletedLessonsByCourse(ctx context.Context, courseID, userID string) (int64, error) {
	if f.lessonsByID != nil && f.lessonProgressByLesson != nil {
		var count int64
		for lessonID, lesson := range f.lessonsByID {
			progress := f.lessonProgressByLesson[lessonID]
			if lesson.CourseID == courseID && progress != nil && progress.UserID == userID && progress.IsCompleted {
				count++
			}
		}
		return count, nil
	}
	return f.completedLessonsCount, nil
}

func (f *fakeLearningRepo) CountCompletedLessonsByIDs(ctx context.Context, userID string, lessonIDs []string) (int64, error) {
	if f.lessonProgressByLesson != nil {
		var count int64
		for _, lessonID := range lessonIDs {
			progress := f.lessonProgressByLesson[lessonID]
			if progress != nil && progress.UserID == userID && progress.IsCompleted {
				count++
			}
		}
		return count, nil
	}
	return int64(len(lessonIDs)), nil
}

func (f *fakeLearningRepo) CreateAssignment(ctx context.Context, assignment *model.Assignment) error {
	f.assignment = assignment
	return nil
}

func (f *fakeLearningRepo) GetAssignmentByID(ctx context.Context, id string) (*model.Assignment, error) {
	if f.assignment == nil {
		return nil, gorm.ErrRecordNotFound
	}
	return f.assignment, nil
}

func (f *fakeLearningRepo) GetAssignmentByLessonID(ctx context.Context, lessonID string) (*model.Assignment, error) {
	if f.assignment == nil {
		return nil, gorm.ErrRecordNotFound
	}
	return f.assignment, nil
}

func (f *fakeLearningRepo) UpdateAssignment(ctx context.Context, assignment *model.Assignment) error {
	f.assignment = assignment
	return nil
}

func (f *fakeLearningRepo) DeleteAssignment(ctx context.Context, id string) error { return nil }

func (f *fakeLearningRepo) CreateAssignmentSubmission(ctx context.Context, submission *model.AssignmentSubmission) error {
	f.assignmentSubmission = submission
	return nil
}

func (f *fakeLearningRepo) GetAssignmentSubmissionByID(ctx context.Context, id string) (*model.AssignmentSubmission, error) {
	if f.assignmentSubmission == nil {
		return nil, gorm.ErrRecordNotFound
	}
	return f.assignmentSubmission, nil
}

func (f *fakeLearningRepo) GetAssignmentSubmissionByAssignmentUser(ctx context.Context, assignmentID, userID string) (*model.AssignmentSubmission, error) {
	if f.assignmentSubmission == nil {
		return nil, gorm.ErrRecordNotFound
	}
	return f.assignmentSubmission, nil
}

func (f *fakeLearningRepo) UpdateAssignmentSubmission(ctx context.Context, submission *model.AssignmentSubmission) error {
	f.assignmentSubmission = submission
	return nil
}

func (f *fakeLearningRepo) ListAssignmentSubmissions(ctx context.Context, assignmentID string, p repository.ListParams) (*repository.PageResult[model.AssignmentSubmission], error) {
	return &repository.PageResult[model.AssignmentSubmission]{}, nil
}

func (f *fakeLearningRepo) ListAssignmentSubmissionsByUser(ctx context.Context, userID string, p repository.ListParams) (*repository.PageResult[model.AssignmentSubmission], error) {
	return &repository.PageResult[model.AssignmentSubmission]{}, nil
}

func (f *fakeLearningRepo) GetLearningAnalyticsOverview(ctx context.Context) (model.LearningAnalyticsOverviewResponse, error) {
	return model.LearningAnalyticsOverviewResponse{}, nil
}

func (f *fakeLearningRepo) ListCourseAnalytics(ctx context.Context, p repository.ListParams) (*repository.PageResult[model.CourseAnalyticsResponse], error) {
	return &repository.PageResult[model.CourseAnalyticsResponse]{}, nil
}

func TestLearningServiceCreateCourseReturnsConflictOnDuplicateSlug(t *testing.T) {
	repo := &fakeLearningRepo{courseSlugExists: true}
	svc := NewLearningService(repo, repo, repo, repo, repo, repo, nil)

	_, err := svc.CreateCourse(context.Background(), &model.AuthContext{UserID: "user-1"}, model.CreateCourseRequest{
		Slug:  "golang-fundamentals",
		Title: "Golang Fundamentals",
		Level: model.CourseLevelBeginner,
	})
	if err == nil {
		t.Fatal("expected error, got nil")
	}
	if !strings.Contains(err.Error(), "Course slug already exists") {
		t.Fatalf("expected duplicate slug error, got %v", err)
	}
}

func TestLearningServiceCreateSectionAppendsNextSortOrder(t *testing.T) {
	repo := &fakeLearningRepo{
		course: &model.Course{
			ID: "course-1",
			Sections: []model.CourseSection{
				{ID: "section-1", CourseID: "course-1", SortOrder: 0},
				{ID: "section-2", CourseID: "course-1", SortOrder: 3},
			},
		},
	}
	svc := NewLearningService(repo, repo, repo, repo, repo, repo, nil)

	resp, err := svc.CreateSection(context.Background(), model.CreateCourseSectionRequest{
		CourseID:    "course-1",
		Title:       "New section",
		Description: "Description",
		SortOrder:   1,
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if repo.createdSection == nil {
		t.Fatal("expected section to be created")
	}
	if repo.createdSection.SortOrder != 4 {
		t.Fatalf("expected next sort order 4, got %d", repo.createdSection.SortOrder)
	}
	if resp.SortOrder != 4 {
		t.Fatalf("expected response sort order 4, got %d", resp.SortOrder)
	}
}

func TestLearningServiceUpdateSectionReordersWithoutSortConflict(t *testing.T) {
	repo := &fakeLearningRepo{
		course: &model.Course{
			ID: "course-1",
			Sections: []model.CourseSection{
				{ID: "section-1", CourseID: "course-1", Title: "First", SortOrder: 0},
				{ID: "section-2", CourseID: "course-1", Title: "Second", SortOrder: 1},
			},
		},
		section: &model.CourseSection{
			ID:          "section-1",
			CourseID:    "course-1",
			Title:       "First",
			Description: learningServiceStrPtr("old"),
			SortOrder:   0,
		},
	}
	svc := NewLearningService(repo, repo, repo, repo, repo, repo, nil)

	resp, err := svc.UpdateSection(context.Background(), "section-1", model.UpdateCourseSectionRequest{
		Title:       learningServiceStrPtr("Moved"),
		Description: learningServiceStrPtr("updated"),
		SortOrder:   learningServiceIntPtr(1),
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if len(repo.updatedSections) != 3 {
		t.Fatalf("expected 3 section updates in reorder transaction, got %d", len(repo.updatedSections))
	}
	if repo.updatedSections[0].SortOrder != -1 {
		t.Fatalf("expected temporary section sort order -1, got %d", repo.updatedSections[0].SortOrder)
	}
	if repo.updatedSections[1].ID != "section-2" || repo.updatedSections[1].SortOrder != 0 {
		t.Fatalf("expected sibling section to shift to 0, got %#v", repo.updatedSections[1])
	}
	if repo.updatedSections[2].ID != "section-1" || repo.updatedSections[2].SortOrder != 1 {
		t.Fatalf("expected moved section final sort order 1, got %#v", repo.updatedSections[2])
	}
	if resp.SortOrder != 1 {
		t.Fatalf("expected response sort order 1, got %d", resp.SortOrder)
	}
	if resp.Title != "Moved" {
		t.Fatalf("expected updated title, got %q", resp.Title)
	}
}

func TestLearningServiceSubmitQuizAttemptIssuesCertificateOnCourseCompletion(t *testing.T) {
	repo := &fakeLearningRepo{
		quiz: &model.Quiz{
			ID:        "quiz-1",
			LessonID:  "lesson-1",
			PassScore: 70,
			IsActive:  true,
			Questions: []model.QuizQuestion{
				{
					ID:           "question-1",
					QuestionType: model.QuizQuestionTypeSingleChoice,
					Points:       10,
					Options: []model.QuizOption{
						{ID: "opt-correct", IsCorrect: true},
						{ID: "opt-wrong", IsCorrect: false},
					},
				},
			},
		},
		lesson: &model.Lesson{
			ID:       "lesson-1",
			CourseID: "course-1",
		},
		enrollment: &model.CourseEnrollment{
			ID:       "enrollment-1",
			CourseID: "course-1",
			UserID:   "user-1",
			Status:   model.EnrollmentStatusActive,
		},
		publishedLessonsCount: 1,
		completedLessonsCount: 1,
	}
	svc := NewLearningService(repo, repo, repo, repo, repo, repo, nil)

	resp, err := svc.SubmitQuizAttempt(context.Background(), &model.AuthContext{UserID: "user-1"}, model.SubmitQuizAttemptRequest{
		QuizID: "quiz-1",
		Answers: []model.SubmitQuizAnswerRequest{
			{
				QuestionID:        "question-1",
				SelectedOptionIDs: []string{"opt-correct"},
			},
		},
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if resp.Score == nil || *resp.Score != 100 {
		t.Fatalf("expected score 100, got %#v", resp.Score)
	}
	if resp.Passed == nil || !*resp.Passed {
		t.Fatalf("expected passed=true, got %#v", resp.Passed)
	}
	if repo.createdCertificate == nil {
		t.Fatal("expected certificate to be created")
	}
	if repo.updatedEnrollment == nil {
		t.Fatal("expected enrollment to be updated")
	}
	if repo.updatedEnrollment.Status != model.EnrollmentStatusCompleted {
		t.Fatalf("expected enrollment completed, got %s", repo.updatedEnrollment.Status)
	}
	if repo.updatedEnrollment.ProgressPercent != 100 {
		t.Fatalf("expected progress 100, got %v", repo.updatedEnrollment.ProgressPercent)
	}
	if repo.createdCertificate.UserID != "user-1" || repo.createdCertificate.CourseID != "course-1" {
		t.Fatalf("unexpected certificate payload: %#v", repo.createdCertificate)
	}
	if repo.createdCertificate.IssuedAt.Before(time.Now().Add(-1 * time.Minute)) {
		t.Fatalf("expected recent issued_at, got %v", repo.createdCertificate.IssuedAt)
	}
}

func TestLearningServiceUpdateLessonProgressCompletesEnrollmentAndIssuesCertificate(t *testing.T) {
	repo := &fakeLearningRepo{
		lesson: &model.Lesson{
			ID:       "lesson-1",
			CourseID: "course-1",
		},
		enrollment: &model.CourseEnrollment{
			ID:       "enrollment-1",
			CourseID: "course-1",
			UserID:   "user-1",
			Status:   model.EnrollmentStatusActive,
		},
		publishedLessonsCount: 1,
		completedLessonsCount: 1,
	}
	svc := NewLearningService(repo, repo, repo, repo, repo, repo, nil)

	resp, err := svc.UpdateLessonProgress(context.Background(), &model.AuthContext{UserID: "user-1"}, "lesson-1", model.UpdateLessonProgressRequest{
		LastPositionSeconds: 120,
		TimeSpentSeconds:    300,
		IsCompleted:         true,
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if repo.lessonProgress == nil {
		t.Fatal("expected lesson progress to be created")
	}
	if repo.lessonProgress.LessonID != "lesson-1" || repo.lessonProgress.UserID != "user-1" {
		t.Fatalf("unexpected lesson progress identity: %#v", repo.lessonProgress)
	}
	if repo.lessonProgress.LastPositionSeconds != 120 || repo.lessonProgress.TimeSpentSeconds != 300 {
		t.Fatalf("unexpected lesson progress payload: %#v", repo.lessonProgress)
	}
	if !repo.lessonProgress.IsCompleted || repo.lessonProgress.CompletedAt == nil {
		t.Fatalf("expected completed lesson progress, got %#v", repo.lessonProgress)
	}
	if repo.updatedEnrollment == nil {
		t.Fatal("expected enrollment to be updated")
	}
	if repo.updatedEnrollment.Status != model.EnrollmentStatusCompleted {
		t.Fatalf("expected enrollment completed, got %s", repo.updatedEnrollment.Status)
	}
	if repo.updatedEnrollment.ProgressPercent != 100 {
		t.Fatalf("expected progress 100, got %v", repo.updatedEnrollment.ProgressPercent)
	}
	if repo.updatedEnrollment.CompletedAt == nil {
		t.Fatal("expected completed_at to be set")
	}
	if repo.createdCertificate == nil {
		t.Fatal("expected certificate to be created")
	}
	if repo.createdCertificate.CourseID != "course-1" || repo.createdCertificate.UserID != "user-1" {
		t.Fatalf("unexpected certificate payload: %#v", repo.createdCertificate)
	}
	if resp.Status != model.EnrollmentStatusCompleted {
		t.Fatalf("expected response status completed, got %s", resp.Status)
	}
	if resp.ProgressPercent != 100 {
		t.Fatalf("expected response progress 100, got %v", resp.ProgressPercent)
	}
}

func TestLearningServiceCreateQuizRejectsInvalidSingleChoiceConfig(t *testing.T) {
	repo := &fakeLearningRepo{
		lesson: &model.Lesson{
			ID:         "lesson-quiz",
			CourseID:   "course-1",
			LessonType: model.LessonTypeQuiz,
		},
	}
	svc := NewLearningService(repo, repo, repo, repo, repo, repo, nil)

	_, err := svc.CreateQuiz(context.Background(), model.CreateQuizRequest{
		LessonID:  "lesson-quiz",
		Title:     "Invalid Quiz",
		PassScore: 70,
		IsActive:  true,
		Questions: []model.CreateQuizQuestionRequest{
			{
				QuestionText: "Choose one",
				QuestionType: model.QuizQuestionTypeSingleChoice,
				Points:       10,
				Options: []model.CreateQuizOptionRequest{
					{OptionText: "A", IsCorrect: true},
					{OptionText: "B", IsCorrect: true},
				},
			},
		},
	})
	if err == nil {
		t.Fatalf("expected single_choice validation error, got %v", err)
	}
}

func TestLearningServiceSubmitAssignmentAutoApproveCompletesCourse(t *testing.T) {
	repo := &fakeLearningRepo{
		assignment: &model.Assignment{
			ID:                  "assignment-1",
			LessonID:            "lesson-assignment",
			Title:               "Final Task",
			AllowTextSubmission: true,
			IsActive:            true,
			IsAutoApprove:       true,
		},
		lesson: &model.Lesson{
			ID:          "lesson-assignment",
			CourseID:    "course-1",
			LessonType:  model.LessonTypeAssignment,
			IsPublished: true,
		},
		enrollment: &model.CourseEnrollment{
			ID:       "enrollment-1",
			CourseID: "course-1",
			UserID:   "user-1",
			Status:   model.EnrollmentStatusActive,
		},
		publishedLessonsCount: 1,
		completedLessonsCount: 1,
	}
	svc := NewLearningService(repo, repo, repo, repo, repo, repo, nil)

	resp, err := svc.SubmitAssignment(context.Background(), &model.AuthContext{UserID: "user-1"}, model.SubmitAssignmentRequest{
		AssignmentID:   "assignment-1",
		SubmissionText: "done",
	})
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if resp.Status != model.AssignmentSubmissionStatusApproved {
		t.Fatalf("expected approved submission, got %s", resp.Status)
	}
	if repo.assignmentSubmission == nil {
		t.Fatal("expected assignment submission to be created")
	}
	if repo.updatedEnrollment == nil || repo.updatedEnrollment.Status != model.EnrollmentStatusCompleted {
		t.Fatalf("expected completed enrollment, got %#v", repo.updatedEnrollment)
	}
	if repo.createdCertificate == nil {
		t.Fatal("expected certificate issuance")
	}
}
