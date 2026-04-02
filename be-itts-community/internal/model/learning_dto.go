package model

import "time"

type CreateCourseRequest struct {
	Slug             string       `json:"slug" validate:"required,min=3,max=255"`
	Title            string       `json:"title" validate:"required,min=3,max=255"`
	Subtitle         string       `json:"subtitle"`
	Description      string       `json:"description"`
	ThumbnailURL     string       `json:"thumbnail_url"`
	Program          *ProgramEnum `json:"program,omitempty" validate:"omitempty,oneof=networking devsecops programming"`
	Level            CourseLevel  `json:"level" validate:"required,oneof=beginner intermediate advanced"`
	Status           CourseStatus `json:"status" validate:"omitempty,oneof=draft published archived"`
	EstimatedMinutes int          `json:"estimated_minutes" validate:"gte=0"`
	IsFeatured       bool         `json:"is_featured"`
}

type UpdateCourseRequest struct {
	Slug             *string       `json:"slug,omitempty" validate:"omitempty,min=3,max=255"`
	Title            *string       `json:"title,omitempty" validate:"omitempty,min=3,max=255"`
	Subtitle         *string       `json:"subtitle,omitempty"`
	Description      *string       `json:"description,omitempty"`
	ThumbnailURL     *string       `json:"thumbnail_url,omitempty"`
	Program          *ProgramEnum  `json:"program,omitempty" validate:"omitempty,oneof=networking devsecops programming"`
	Level            *CourseLevel  `json:"level,omitempty" validate:"omitempty,oneof=beginner intermediate advanced"`
	Status           *CourseStatus `json:"status,omitempty" validate:"omitempty,oneof=draft published archived"`
	EstimatedMinutes *int          `json:"estimated_minutes,omitempty" validate:"omitempty,gte=0"`
	IsFeatured       *bool         `json:"is_featured,omitempty"`
}

type EnrollCourseRequest struct {
	CourseID string `json:"course_id" validate:"required"`
}

type CreateCourseSectionRequest struct {
	CourseID    string `json:"course_id" validate:"required"`
	Title       string `json:"title" validate:"required,min=2,max=255"`
	Description string `json:"description"`
	SortOrder   int    `json:"sort_order" validate:"gte=0"`
}

type UpdateCourseSectionRequest struct {
	Title       *string `json:"title,omitempty" validate:"omitempty,min=2,max=255"`
	Description *string `json:"description,omitempty"`
	SortOrder   *int    `json:"sort_order,omitempty" validate:"omitempty,gte=0"`
}

type CreateLessonRequest struct {
	CourseID              string         `json:"course_id" validate:"required"`
	SectionID             string         `json:"section_id" validate:"required"`
	Slug                  string         `json:"slug" validate:"required,min=3,max=255"`
	Title                 string         `json:"title" validate:"required,min=2,max=255"`
	Summary               string         `json:"summary"`
	ContentJSON           map[string]any `json:"content_json"`
	VideoURL              string         `json:"video_url"`
	AttachmentURL         string         `json:"attachment_url"`
	LessonType            LessonType     `json:"lesson_type" validate:"required,oneof=video article embed file quiz assignment"`
	DurationMinutes       int            `json:"duration_minutes" validate:"gte=0"`
	SortOrder             int            `json:"sort_order" validate:"gte=0"`
	IsPreview             bool           `json:"is_preview"`
	IsPublished           bool           `json:"is_published"`
	PrerequisiteLessonIDs []string       `json:"prerequisite_lesson_ids"`
}

type UpdateLessonRequest struct {
	Slug                  *string        `json:"slug,omitempty" validate:"omitempty,min=3,max=255"`
	Title                 *string        `json:"title,omitempty" validate:"omitempty,min=2,max=255"`
	Summary               *string        `json:"summary,omitempty"`
	ContentJSON           map[string]any `json:"content_json,omitempty"`
	VideoURL              *string        `json:"video_url,omitempty"`
	AttachmentURL         *string        `json:"attachment_url,omitempty"`
	LessonType            *LessonType    `json:"lesson_type,omitempty" validate:"omitempty,oneof=video article embed file quiz assignment"`
	DurationMinutes       *int           `json:"duration_minutes,omitempty" validate:"omitempty,gte=0"`
	SortOrder             *int           `json:"sort_order,omitempty" validate:"omitempty,gte=0"`
	IsPreview             *bool          `json:"is_preview,omitempty"`
	IsPublished           *bool          `json:"is_published,omitempty"`
	PrerequisiteLessonIDs []string       `json:"prerequisite_lesson_ids,omitempty"`
}

type CreateAssignmentRequest struct {
	LessonID            string     `json:"lesson_id" validate:"required"`
	Title               string     `json:"title" validate:"required,min=2,max=255"`
	Instructions        string     `json:"instructions"`
	DueAt               *time.Time `json:"due_at,omitempty"`
	MaxScore            *int       `json:"max_score,omitempty" validate:"omitempty,gte=0"`
	AllowTextSubmission bool       `json:"allow_text_submission"`
	AllowLinkSubmission bool       `json:"allow_link_submission"`
	AllowFileSubmission bool       `json:"allow_file_submission"`
	IsActive            bool       `json:"is_active"`
	IsAutoApprove       bool       `json:"is_auto_approve"`
}

type UpdateAssignmentRequest struct {
	Title               *string    `json:"title,omitempty" validate:"omitempty,min=2,max=255"`
	Instructions        *string    `json:"instructions,omitempty"`
	DueAt               *time.Time `json:"due_at,omitempty"`
	MaxScore            *int       `json:"max_score,omitempty" validate:"omitempty,gte=0"`
	AllowTextSubmission *bool      `json:"allow_text_submission,omitempty"`
	AllowLinkSubmission *bool      `json:"allow_link_submission,omitempty"`
	AllowFileSubmission *bool      `json:"allow_file_submission,omitempty"`
	IsActive            *bool      `json:"is_active,omitempty"`
	IsAutoApprove       *bool      `json:"is_auto_approve,omitempty"`
}

type SubmitAssignmentRequest struct {
	AssignmentID   string `json:"assignment_id" validate:"required"`
	SubmissionText string `json:"submission_text"`
	SubmissionURL  string `json:"submission_url"`
	AttachmentURL  string `json:"attachment_url"`
}

type ReviewAssignmentSubmissionRequest struct {
	Status   AssignmentSubmissionStatus `json:"status" validate:"required,oneof=approved rejected"`
	Score    *int                       `json:"score,omitempty" validate:"omitempty,gte=0"`
	Feedback string                     `json:"feedback"`
}

type CreateQuizOptionRequest struct {
	OptionText string `json:"option_text" validate:"required,min=1"`
	IsCorrect  bool   `json:"is_correct"`
	SortOrder  int    `json:"sort_order" validate:"gte=0"`
}

type CreateQuizQuestionRequest struct {
	QuestionText string                    `json:"question_text" validate:"required,min=1"`
	QuestionType QuizQuestionType          `json:"question_type" validate:"required,oneof=single_choice multiple_choice short_answer"`
	Explanation  string                    `json:"explanation"`
	Points       int                       `json:"points" validate:"gte=1"`
	SortOrder    int                       `json:"sort_order" validate:"gte=0"`
	Options      []CreateQuizOptionRequest `json:"options"`
}

type CreateQuizRequest struct {
	LessonID         string                      `json:"lesson_id" validate:"required"`
	Title            string                      `json:"title" validate:"required,min=2,max=255"`
	Description      string                      `json:"description"`
	PassScore        int                         `json:"pass_score" validate:"gte=0,lte=100"`
	TimeLimitMinutes *int                        `json:"time_limit_minutes,omitempty" validate:"omitempty,gte=1"`
	MaxAttempts      *int                        `json:"max_attempts,omitempty" validate:"omitempty,gte=1"`
	IsActive         bool                        `json:"is_active"`
	Questions        []CreateQuizQuestionRequest `json:"questions" validate:"required,min=1,dive"`
}

type UpdateQuizRequest struct {
	Title            *string                     `json:"title,omitempty" validate:"omitempty,min=2,max=255"`
	Description      *string                     `json:"description,omitempty"`
	PassScore        *int                        `json:"pass_score,omitempty" validate:"omitempty,gte=0,lte=100"`
	TimeLimitMinutes *int                        `json:"time_limit_minutes,omitempty" validate:"omitempty,gte=1"`
	MaxAttempts      *int                        `json:"max_attempts,omitempty" validate:"omitempty,gte=1"`
	IsActive         *bool                       `json:"is_active,omitempty"`
	Questions        []CreateQuizQuestionRequest `json:"questions,omitempty"`
}

type SubmitQuizAnswerRequest struct {
	QuestionID        string   `json:"question_id" validate:"required"`
	SelectedOptionIDs []string `json:"selected_option_ids"`
	AnswerText        string   `json:"answer_text"`
}

type SubmitQuizAttemptRequest struct {
	QuizID  string                    `json:"quiz_id" validate:"required"`
	Answers []SubmitQuizAnswerRequest `json:"answers" validate:"required,min=1,dive"`
}

type UpdateLessonProgressRequest struct {
	LastPositionSeconds int  `json:"last_position_seconds" validate:"gte=0"`
	TimeSpentSeconds    int  `json:"time_spent_seconds" validate:"gte=0"`
	IsCompleted         bool `json:"is_completed"`
}

type LessonResponse struct {
	ID                    string         `json:"id"`
	CourseID              string         `json:"course_id"`
	SectionID             string         `json:"section_id"`
	Slug                  string         `json:"slug"`
	Title                 string         `json:"title"`
	Summary               string         `json:"summary"`
	ContentJSON           map[string]any `json:"content_json"`
	VideoURL              string         `json:"video_url"`
	AttachmentURL         string         `json:"attachment_url"`
	LessonType            LessonType     `json:"lesson_type"`
	DurationMinutes       int            `json:"duration_minutes"`
	SortOrder             int            `json:"sort_order"`
	IsPreview             bool           `json:"is_preview"`
	IsPublished           bool           `json:"is_published"`
	PrerequisiteLessonIDs []string       `json:"prerequisite_lesson_ids"`
	QuizID                string         `json:"quiz_id"`
	AssignmentID          string         `json:"assignment_id"`
	CreatedAt             time.Time      `json:"created_at"`
	UpdatedAt             time.Time      `json:"updated_at"`
}

type CourseSectionResponse struct {
	ID          string           `json:"id"`
	CourseID    string           `json:"course_id"`
	Title       string           `json:"title"`
	Description string           `json:"description"`
	SortOrder   int              `json:"sort_order"`
	Lessons     []LessonResponse `json:"lessons"`
	CreatedAt   time.Time        `json:"created_at"`
	UpdatedAt   time.Time        `json:"updated_at"`
}

type CourseResponse struct {
	ID               string                  `json:"id"`
	Slug             string                  `json:"slug"`
	Title            string                  `json:"title"`
	Subtitle         string                  `json:"subtitle"`
	Description      string                  `json:"description"`
	ThumbnailURL     string                  `json:"thumbnail_url"`
	Program          string                  `json:"program"`
	Level            CourseLevel             `json:"level"`
	Status           CourseStatus            `json:"status"`
	EstimatedMinutes int                     `json:"estimated_minutes"`
	IsFeatured       bool                    `json:"is_featured"`
	PublishedAt      *time.Time              `json:"published_at,omitempty"`
	CreatedBy        *string                 `json:"created_by,omitempty"`
	UpdatedBy        *string                 `json:"updated_by,omitempty"`
	Sections         []CourseSectionResponse `json:"sections,omitempty"`
	CreatedAt        time.Time               `json:"created_at"`
	UpdatedAt        time.Time               `json:"updated_at"`
}

type CourseListResponse struct {
	Data       []CourseResponse `json:"data"`
	Total      int64            `json:"total"`
	Page       int              `json:"page"`
	PageSize   int              `json:"page_size"`
	TotalPages int              `json:"total_pages"`
}

type CourseEnrollmentResponse struct {
	ID              string           `json:"id"`
	CourseID        string           `json:"course_id"`
	CourseTitle     string           `json:"course_title"`
	CourseSlug      string           `json:"course_slug"`
	UserID          string           `json:"user_id"`
	UserFullName    string           `json:"user_full_name"`
	UserEmail       string           `json:"user_email"`
	Status          EnrollmentStatus `json:"status"`
	EnrolledAt      time.Time        `json:"enrolled_at"`
	CompletedAt     *time.Time       `json:"completed_at,omitempty"`
	LastAccessedAt  *time.Time       `json:"last_accessed_at,omitempty"`
	ProgressPercent float64          `json:"progress_percent"`
	CreatedAt       time.Time        `json:"created_at"`
	UpdatedAt       time.Time        `json:"updated_at"`
}

type QuizOptionResponse struct {
	ID         string `json:"id"`
	QuestionID string `json:"question_id"`
	OptionText string `json:"option_text"`
	IsCorrect  bool   `json:"is_correct"`
	SortOrder  int    `json:"sort_order"`
}

type QuizQuestionResponse struct {
	ID           string               `json:"id"`
	QuizID       string               `json:"quiz_id"`
	QuestionText string               `json:"question_text"`
	QuestionType QuizQuestionType     `json:"question_type"`
	Explanation  string               `json:"explanation"`
	Points       int                  `json:"points"`
	SortOrder    int                  `json:"sort_order"`
	Options      []QuizOptionResponse `json:"options"`
}

type QuizResponse struct {
	ID               string                 `json:"id"`
	LessonID         string                 `json:"lesson_id"`
	Title            string                 `json:"title"`
	Description      string                 `json:"description"`
	PassScore        int                    `json:"pass_score"`
	TimeLimitMinutes *int                   `json:"time_limit_minutes,omitempty"`
	MaxAttempts      *int                   `json:"max_attempts,omitempty"`
	IsActive         bool                   `json:"is_active"`
	Questions        []QuizQuestionResponse `json:"questions"`
	CreatedAt        time.Time              `json:"created_at"`
	UpdatedAt        time.Time              `json:"updated_at"`
}

type QuizAttemptAnswerResponse struct {
	ID                string   `json:"id"`
	AttemptID         string   `json:"attempt_id"`
	QuestionID        string   `json:"question_id"`
	SelectedOptionIDs []string `json:"selected_option_ids"`
	AnswerText        string   `json:"answer_text"`
	IsCorrect         *bool    `json:"is_correct,omitempty"`
	AwardedPoints     *int     `json:"awarded_points,omitempty"`
}

type QuizAttemptResponse struct {
	ID          string                      `json:"id"`
	QuizID      string                      `json:"quiz_id"`
	UserID      string                      `json:"user_id"`
	Status      QuizAttemptStatus           `json:"status"`
	Score       *int                        `json:"score,omitempty"`
	Passed      *bool                       `json:"passed,omitempty"`
	StartedAt   time.Time                   `json:"started_at"`
	SubmittedAt *time.Time                  `json:"submitted_at,omitempty"`
	GradedAt    *time.Time                  `json:"graded_at,omitempty"`
	Answers     []QuizAttemptAnswerResponse `json:"answers,omitempty"`
}

type CourseCertificateResponse struct {
	ID                string            `json:"id"`
	CourseID          string            `json:"course_id"`
	CourseTitle       string            `json:"course_title"`
	CourseSlug        string            `json:"course_slug"`
	UserID            string            `json:"user_id"`
	UserFullName      string            `json:"user_full_name"`
	UserEmail         string            `json:"user_email"`
	CertificateNumber string            `json:"certificate_number"`
	Status            CertificateStatus `json:"status"`
	IssuedAt          time.Time         `json:"issued_at"`
	RevokedAt         *time.Time        `json:"revoked_at,omitempty"`
	TemplateName      string            `json:"template_name"`
	Metadata          map[string]any    `json:"metadata"`
	CreatedAt         time.Time         `json:"created_at"`
	UpdatedAt         time.Time         `json:"updated_at"`
}

type CourseCertificateListResponse struct {
	Data       []CourseCertificateResponse `json:"data"`
	Total      int64                       `json:"total"`
	Page       int                         `json:"page"`
	PageSize   int                         `json:"page_size"`
	TotalPages int                         `json:"total_pages"`
}

type AssignmentResponse struct {
	ID                  string     `json:"id"`
	LessonID            string     `json:"lesson_id"`
	Title               string     `json:"title"`
	Instructions        string     `json:"instructions"`
	DueAt               *time.Time `json:"due_at,omitempty"`
	MaxScore            *int       `json:"max_score,omitempty"`
	AllowTextSubmission bool       `json:"allow_text_submission"`
	AllowLinkSubmission bool       `json:"allow_link_submission"`
	AllowFileSubmission bool       `json:"allow_file_submission"`
	IsActive            bool       `json:"is_active"`
	IsAutoApprove       bool       `json:"is_auto_approve"`
	CreatedAt           time.Time  `json:"created_at"`
	UpdatedAt           time.Time  `json:"updated_at"`
}

type AssignmentSubmissionResponse struct {
	ID             string                     `json:"id"`
	AssignmentID   string                     `json:"assignment_id"`
	UserID         string                     `json:"user_id"`
	UserFullName   string                     `json:"user_full_name"`
	UserEmail      string                     `json:"user_email"`
	SubmissionText string                     `json:"submission_text"`
	SubmissionURL  string                     `json:"submission_url"`
	AttachmentURL  string                     `json:"attachment_url"`
	Status         AssignmentSubmissionStatus `json:"status"`
	SubmittedAt    time.Time                  `json:"submitted_at"`
	ReviewedAt     *time.Time                 `json:"reviewed_at,omitempty"`
	ReviewedBy     *string                    `json:"reviewed_by,omitempty"`
	ReviewedByName string                     `json:"reviewed_by_name"`
	Score          *int                       `json:"score,omitempty"`
	Feedback       string                     `json:"feedback"`
	CreatedAt      time.Time                  `json:"created_at"`
	UpdatedAt      time.Time                  `json:"updated_at"`
}

type AssignmentSubmissionListResponse struct {
	Data       []AssignmentSubmissionResponse `json:"data"`
	Total      int64                          `json:"total"`
	Page       int                            `json:"page"`
	PageSize   int                            `json:"page_size"`
	TotalPages int                            `json:"total_pages"`
}

type CertificateVerificationResponse struct {
	Verified    bool                      `json:"verified"`
	Certificate CourseCertificateResponse `json:"certificate"`
}

type LearningAnalyticsOverviewResponse struct {
	TotalCourses               int64   `json:"total_courses"`
	PublishedCourses           int64   `json:"published_courses"`
	TotalEnrollments           int64   `json:"total_enrollments"`
	CompletedEnrollments       int64   `json:"completed_enrollments"`
	CompletionRate             float64 `json:"completion_rate"`
	TotalCertificatesIssued    int64   `json:"total_certificates_issued"`
	TotalQuizAttempts          int64   `json:"total_quiz_attempts"`
	TotalAssignmentSubmissions int64   `json:"total_assignment_submissions"`
}

type CourseAnalyticsResponse struct {
	CourseID              string       `json:"course_id"`
	CourseTitle           string       `json:"course_title"`
	CourseSlug            string       `json:"course_slug"`
	Status                CourseStatus `json:"status"`
	Enrollments           int64        `json:"enrollments"`
	CompletedEnrollments  int64        `json:"completed_enrollments"`
	CompletionRate        float64      `json:"completion_rate"`
	CertificatesIssued    int64        `json:"certificates_issued"`
	QuizAttempts          int64        `json:"quiz_attempts"`
	AverageQuizScore      float64      `json:"average_quiz_score"`
	AssignmentSubmissions int64        `json:"assignment_submissions"`
}

type CourseAnalyticsListResponse struct {
	Data       []CourseAnalyticsResponse `json:"data"`
	Total      int64                     `json:"total"`
	Page       int                       `json:"page"`
	PageSize   int                       `json:"page_size"`
	TotalPages int                       `json:"total_pages"`
}

func (r CreateCourseRequest) ToModel(createdBy string) Course {
	course := Course{
		Slug:             r.Slug,
		Title:            r.Title,
		Level:            r.Level,
		Status:           CourseStatusDraft,
		EstimatedMinutes: r.EstimatedMinutes,
		IsFeatured:       r.IsFeatured,
		CreatedBy:        learningStrPtr(createdBy),
		UpdatedBy:        learningStrPtr(createdBy),
	}
	if r.Status != "" {
		course.Status = r.Status
	}
	if r.Subtitle != "" {
		course.Subtitle = learningStrPtr(r.Subtitle)
	}
	if r.Description != "" {
		course.Description = learningStrPtr(r.Description)
	}
	if r.ThumbnailURL != "" {
		course.ThumbnailURL = learningStrPtr(r.ThumbnailURL)
	}
	if r.Program != nil && *r.Program != "" {
		course.Program = r.Program
	}
	if course.Status == CourseStatusPublished {
		now := time.Now()
		course.PublishedAt = &now
	}
	return course
}

func CourseToResponse(course Course) CourseResponse {
	sections := make([]CourseSectionResponse, 0, len(course.Sections))
	for _, section := range course.Sections {
		sections = append(sections, CourseSectionToResponse(section))
	}

	program := ""
	if course.Program != nil {
		program = string(*course.Program)
	}

	return CourseResponse{
		ID:               course.ID,
		Slug:             course.Slug,
		Title:            course.Title,
		Subtitle:         learningDerefString(course.Subtitle),
		Description:      learningDerefString(course.Description),
		ThumbnailURL:     learningDerefString(course.ThumbnailURL),
		Program:          program,
		Level:            course.Level,
		Status:           course.Status,
		EstimatedMinutes: course.EstimatedMinutes,
		IsFeatured:       course.IsFeatured,
		PublishedAt:      course.PublishedAt,
		CreatedBy:        course.CreatedBy,
		UpdatedBy:        course.UpdatedBy,
		Sections:         sections,
		CreatedAt:        course.CreatedAt,
		UpdatedAt:        course.UpdatedAt,
	}
}

func CourseSectionToResponse(section CourseSection) CourseSectionResponse {
	lessons := make([]LessonResponse, 0, len(section.Lessons))
	for _, lesson := range section.Lessons {
		lessons = append(lessons, LessonToResponse(lesson))
	}

	return CourseSectionResponse{
		ID:          section.ID,
		CourseID:    section.CourseID,
		Title:       section.Title,
		Description: learningDerefString(section.Description),
		SortOrder:   section.SortOrder,
		Lessons:     lessons,
		CreatedAt:   section.CreatedAt,
		UpdatedAt:   section.UpdatedAt,
	}
}

func LessonToResponse(lesson Lesson) LessonResponse {
	prerequisiteIDs := make([]string, 0, len(lesson.Prerequisites))
	for _, prerequisite := range lesson.Prerequisites {
		prerequisiteIDs = append(prerequisiteIDs, prerequisite.PrerequisiteLessonID)
	}
	return LessonResponse{
		ID:                    lesson.ID,
		CourseID:              lesson.CourseID,
		SectionID:             lesson.SectionID,
		Slug:                  lesson.Slug,
		Title:                 lesson.Title,
		Summary:               learningDerefString(lesson.Summary),
		ContentJSON:           learningCloneJSONMap(map[string]any(lesson.ContentJSON)),
		VideoURL:              learningDerefString(lesson.VideoURL),
		AttachmentURL:         learningDerefString(lesson.AttachmentURL),
		LessonType:            lesson.LessonType,
		DurationMinutes:       lesson.DurationMinutes,
		SortOrder:             lesson.SortOrder,
		IsPreview:             lesson.IsPreview,
		IsPublished:           lesson.IsPublished,
		PrerequisiteLessonIDs: prerequisiteIDs,
		QuizID:                learningQuizID(lesson.Quiz),
		AssignmentID:          learningAssignmentID(lesson.Assignment),
		CreatedAt:             lesson.CreatedAt,
		UpdatedAt:             lesson.UpdatedAt,
	}
}

func CourseEnrollmentToResponse(enrollment CourseEnrollment) CourseEnrollmentResponse {
	return CourseEnrollmentResponse{
		ID:              enrollment.ID,
		CourseID:        enrollment.CourseID,
		CourseTitle:     enrollment.Course.Title,
		CourseSlug:      enrollment.Course.Slug,
		UserID:          enrollment.UserID,
		UserFullName:    enrollment.User.FullName,
		UserEmail:       enrollment.User.Email,
		Status:          enrollment.Status,
		EnrolledAt:      enrollment.EnrolledAt,
		CompletedAt:     enrollment.CompletedAt,
		LastAccessedAt:  enrollment.LastAccessedAt,
		ProgressPercent: enrollment.ProgressPercent,
		CreatedAt:       enrollment.CreatedAt,
		UpdatedAt:       enrollment.UpdatedAt,
	}
}

func (r CreateCourseSectionRequest) ToModel() CourseSection {
	section := CourseSection{
		CourseID:  r.CourseID,
		Title:     r.Title,
		SortOrder: r.SortOrder,
	}
	if r.Description != "" {
		section.Description = learningStrPtr(r.Description)
	}
	return section
}

func (r CreateLessonRequest) ToModel() Lesson {
	lesson := Lesson{
		CourseID:        r.CourseID,
		SectionID:       r.SectionID,
		Slug:            r.Slug,
		Title:           r.Title,
		ContentJSON:     LearningContent(learningCloneJSONMap(r.ContentJSON)),
		LessonType:      r.LessonType,
		DurationMinutes: r.DurationMinutes,
		SortOrder:       r.SortOrder,
		IsPreview:       r.IsPreview,
		IsPublished:     r.IsPublished,
	}
	if r.Summary != "" {
		lesson.Summary = learningStrPtr(r.Summary)
	}
	if r.VideoURL != "" {
		lesson.VideoURL = learningStrPtr(r.VideoURL)
	}
	if r.AttachmentURL != "" {
		lesson.AttachmentURL = learningStrPtr(r.AttachmentURL)
	}
	return lesson
}

func QuizToResponse(quiz Quiz) QuizResponse {
	questions := make([]QuizQuestionResponse, 0, len(quiz.Questions))
	for _, question := range quiz.Questions {
		options := make([]QuizOptionResponse, 0, len(question.Options))
		for _, option := range question.Options {
			options = append(options, QuizOptionResponse{
				ID:         option.ID,
				QuestionID: option.QuestionID,
				OptionText: option.OptionText,
				IsCorrect:  option.IsCorrect,
				SortOrder:  option.SortOrder,
			})
		}
		questions = append(questions, QuizQuestionResponse{
			ID:           question.ID,
			QuizID:       question.QuizID,
			QuestionText: question.QuestionText,
			QuestionType: question.QuestionType,
			Explanation:  learningDerefString(question.Explanation),
			Points:       question.Points,
			SortOrder:    question.SortOrder,
			Options:      options,
		})
	}

	return QuizResponse{
		ID:               quiz.ID,
		LessonID:         quiz.LessonID,
		Title:            quiz.Title,
		Description:      learningDerefString(quiz.Description),
		PassScore:        quiz.PassScore,
		TimeLimitMinutes: quiz.TimeLimitMinutes,
		MaxAttempts:      quiz.MaxAttempts,
		IsActive:         quiz.IsActive,
		Questions:        questions,
		CreatedAt:        quiz.CreatedAt,
		UpdatedAt:        quiz.UpdatedAt,
	}
}

func QuizAttemptToResponse(attempt QuizAttempt) QuizAttemptResponse {
	answers := make([]QuizAttemptAnswerResponse, 0, len(attempt.Answers))
	for _, answer := range attempt.Answers {
		answers = append(answers, QuizAttemptAnswerResponse{
			ID:                answer.ID,
			AttemptID:         answer.AttemptID,
			QuestionID:        answer.QuestionID,
			SelectedOptionIDs: []string(answer.SelectedOptionIDs),
			AnswerText:        learningDerefString(answer.AnswerText),
			IsCorrect:         answer.IsCorrect,
			AwardedPoints:     answer.AwardedPoints,
		})
	}

	return QuizAttemptResponse{
		ID:          attempt.ID,
		QuizID:      attempt.QuizID,
		UserID:      attempt.UserID,
		Status:      attempt.Status,
		Score:       attempt.Score,
		Passed:      attempt.Passed,
		StartedAt:   attempt.StartedAt,
		SubmittedAt: attempt.SubmittedAt,
		GradedAt:    attempt.GradedAt,
		Answers:     answers,
	}
}

func CourseCertificateToResponse(certificate CourseCertificate) CourseCertificateResponse {
	return CourseCertificateResponse{
		ID:                certificate.ID,
		CourseID:          certificate.CourseID,
		CourseTitle:       certificate.Course.Title,
		CourseSlug:        certificate.Course.Slug,
		UserID:            certificate.UserID,
		UserFullName:      certificate.User.FullName,
		UserEmail:         certificate.User.Email,
		CertificateNumber: certificate.CertificateNumber,
		Status:            certificate.Status,
		IssuedAt:          certificate.IssuedAt,
		RevokedAt:         certificate.RevokedAt,
		TemplateName:      learningDerefString(certificate.TemplateName),
		Metadata:          learningCloneJSONMap(map[string]any(certificate.Metadata)),
		CreatedAt:         certificate.CreatedAt,
		UpdatedAt:         certificate.UpdatedAt,
	}
}

func AssignmentToResponse(assignment Assignment) AssignmentResponse {
	return AssignmentResponse{
		ID:                  assignment.ID,
		LessonID:            assignment.LessonID,
		Title:               assignment.Title,
		Instructions:        learningDerefString(assignment.Instructions),
		DueAt:               assignment.DueAt,
		MaxScore:            assignment.MaxScore,
		AllowTextSubmission: assignment.AllowTextSubmission,
		AllowLinkSubmission: assignment.AllowLinkSubmission,
		AllowFileSubmission: assignment.AllowFileSubmission,
		IsActive:            assignment.IsActive,
		IsAutoApprove:       assignment.IsAutoApprove,
		CreatedAt:           assignment.CreatedAt,
		UpdatedAt:           assignment.UpdatedAt,
	}
}

func AssignmentSubmissionToResponse(submission AssignmentSubmission) AssignmentSubmissionResponse {
	return AssignmentSubmissionResponse{
		ID:             submission.ID,
		AssignmentID:   submission.AssignmentID,
		UserID:         submission.UserID,
		UserFullName:   submission.User.FullName,
		UserEmail:      submission.User.Email,
		SubmissionText: learningDerefString(submission.SubmissionText),
		SubmissionURL:  learningDerefString(submission.SubmissionURL),
		AttachmentURL:  learningDerefString(submission.AttachmentURL),
		Status:         submission.Status,
		SubmittedAt:    submission.SubmittedAt,
		ReviewedAt:     submission.ReviewedAt,
		ReviewedBy:     submission.ReviewedBy,
		ReviewedByName: learningUserFullName(submission.Reviewer),
		Score:          submission.Score,
		Feedback:       learningDerefString(submission.Feedback),
		CreatedAt:      submission.CreatedAt,
		UpdatedAt:      submission.UpdatedAt,
	}
}

func learningCloneJSONMap(in map[string]any) map[string]any {
	if in == nil {
		return map[string]any{}
	}
	out := make(map[string]any, len(in))
	for key, value := range in {
		out[key] = value
	}
	return out
}

func learningDerefString(value *string) string {
	if value == nil {
		return ""
	}
	return *value
}

func learningStrPtr(value string) *string {
	if value == "" {
		return nil
	}
	return &value
}

func learningQuizID(quiz *Quiz) string {
	if quiz == nil {
		return ""
	}
	return quiz.ID
}

func learningAssignmentID(assignment *Assignment) string {
	if assignment == nil {
		return ""
	}
	return assignment.ID
}

func learningUserFullName(user *User) string {
	if user == nil {
		return ""
	}
	return user.FullName
}
