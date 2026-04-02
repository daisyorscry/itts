package model

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"time"
)

type LearningContent map[string]any

func (c LearningContent) Value() (driver.Value, error) {
	if c == nil {
		return []byte(`{}`), nil
	}

	raw, err := json.Marshal(c)
	if err != nil {
		return nil, err
	}

	return raw, nil
}

func (c *LearningContent) Scan(value any) error {
	if value == nil {
		*c = LearningContent{}
		return nil
	}

	var raw []byte
	switch v := value.(type) {
	case []byte:
		raw = v
	case string:
		raw = []byte(v)
	default:
		return fmt.Errorf("unsupported Scan, storing driver.Value type %T into type *model.LearningContent", value)
	}

	if len(raw) == 0 {
		*c = LearningContent{}
		return nil
	}

	var out map[string]any
	if err := json.Unmarshal(raw, &out); err != nil {
		return err
	}

	*c = LearningContent(out)
	return nil
}

type UUIDArray []string

func (a UUIDArray) Value() (driver.Value, error) {
	raw, err := json.Marshal(a)
	if err != nil {
		return nil, err
	}
	return raw, nil
}

func (a *UUIDArray) Scan(value any) error {
	if value == nil {
		*a = UUIDArray{}
		return nil
	}

	var raw []byte
	switch v := value.(type) {
	case []byte:
		raw = v
	case string:
		raw = []byte(v)
	default:
		return fmt.Errorf("unsupported Scan, storing driver.Value type %T into type *model.UUIDArray", value)
	}

	if len(raw) == 0 {
		*a = UUIDArray{}
		return nil
	}

	var out []string
	if err := json.Unmarshal(raw, &out); err != nil {
		return err
	}

	*a = UUIDArray(out)
	return nil
}

type CourseLevel string

const (
	CourseLevelBeginner     CourseLevel = "beginner"
	CourseLevelIntermediate CourseLevel = "intermediate"
	CourseLevelAdvanced     CourseLevel = "advanced"
)

type CourseStatus string

const (
	CourseStatusDraft     CourseStatus = "draft"
	CourseStatusPublished CourseStatus = "published"
	CourseStatusArchived  CourseStatus = "archived"
)

type LessonType string

const (
	LessonTypeVideo      LessonType = "video"
	LessonTypeArticle    LessonType = "article"
	LessonTypeEmbed      LessonType = "embed"
	LessonTypeFile       LessonType = "file"
	LessonTypeQuiz       LessonType = "quiz"
	LessonTypeAssignment LessonType = "assignment"
)

type EnrollmentStatus string

const (
	EnrollmentStatusActive    EnrollmentStatus = "active"
	EnrollmentStatusCompleted EnrollmentStatus = "completed"
	EnrollmentStatusDropped   EnrollmentStatus = "dropped"
)

type QuizQuestionType string

const (
	QuizQuestionTypeSingleChoice   QuizQuestionType = "single_choice"
	QuizQuestionTypeMultipleChoice QuizQuestionType = "multiple_choice"
	QuizQuestionTypeShortAnswer    QuizQuestionType = "short_answer"
)

type QuizAttemptStatus string

const (
	QuizAttemptStatusInProgress QuizAttemptStatus = "in_progress"
	QuizAttemptStatusSubmitted  QuizAttemptStatus = "submitted"
	QuizAttemptStatusGraded     QuizAttemptStatus = "graded"
)

type CertificateStatus string

const (
	CertificateStatusIssued  CertificateStatus = "issued"
	CertificateStatusRevoked CertificateStatus = "revoked"
)

type AssignmentSubmissionStatus string

const (
	AssignmentSubmissionStatusSubmitted AssignmentSubmissionStatus = "submitted"
	AssignmentSubmissionStatusApproved  AssignmentSubmissionStatus = "approved"
	AssignmentSubmissionStatusRejected  AssignmentSubmissionStatus = "rejected"
)

type LearnerProfile struct {
	ID             string  `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	UserID         string  `gorm:"type:uuid;not null;uniqueIndex"`
	RegistrationID *string `gorm:"type:uuid;index"`
	StudentID      *string
	Program        *ProgramEnum `gorm:"type:program_enum;index"`
	IntakeYear     *int
	Bio            *string
	CreatedAt      time.Time `gorm:"not null;default:now()"`
	UpdatedAt      time.Time `gorm:"not null;default:now()"`
}

func (LearnerProfile) TableName() string { return "learner_profiles" }

type Course struct {
	ID               string `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Slug             string `gorm:"not null;uniqueIndex"`
	Title            string `gorm:"not null"`
	Subtitle         *string
	Description      *string
	ThumbnailURL     *string
	Program          *ProgramEnum    `gorm:"type:program_enum;index"`
	Level            CourseLevel     `gorm:"type:course_level_enum;not null"`
	Status           CourseStatus    `gorm:"type:course_status_enum;not null;default:'draft';index"`
	EstimatedMinutes int             `gorm:"not null;default:0"`
	IsFeatured       bool            `gorm:"not null;default:false"`
	PublishedAt      *time.Time      `gorm:"index"`
	CreatedBy        *string         `gorm:"type:uuid"`
	UpdatedBy        *string         `gorm:"type:uuid"`
	CreatedAt        time.Time       `gorm:"not null;default:now()"`
	UpdatedAt        time.Time       `gorm:"not null;default:now()"`
	Sections         []CourseSection `gorm:"foreignKey:CourseID"`
}

func (Course) TableName() string { return "courses" }

type CourseSection struct {
	ID          string `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	CourseID    string `gorm:"type:uuid;not null;index"`
	Title       string `gorm:"not null"`
	Description *string
	SortOrder   int       `gorm:"not null;default:0"`
	CreatedAt   time.Time `gorm:"not null;default:now()"`
	UpdatedAt   time.Time `gorm:"not null;default:now()"`
	Lessons     []Lesson  `gorm:"foreignKey:SectionID"`
}

func (CourseSection) TableName() string { return "course_sections" }

type Lesson struct {
	ID              string `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	CourseID        string `gorm:"type:uuid;not null;index"`
	SectionID       string `gorm:"type:uuid;not null;index"`
	Slug            string `gorm:"not null"`
	Title           string `gorm:"not null"`
	Summary         *string
	ContentJSON     LearningContent `gorm:"type:jsonb"`
	VideoURL        *string
	AttachmentURL   *string
	LessonType      LessonType           `gorm:"type:lesson_type_enum;not null"`
	DurationMinutes int                  `gorm:"not null;default:0"`
	SortOrder       int                  `gorm:"not null;default:0"`
	IsPreview       bool                 `gorm:"not null;default:false"`
	IsPublished     bool                 `gorm:"not null;default:false"`
	CreatedAt       time.Time            `gorm:"not null;default:now()"`
	UpdatedAt       time.Time            `gorm:"not null;default:now()"`
	Prerequisites   []LessonPrerequisite `gorm:"foreignKey:LessonID"`
	Quiz            *Quiz                `gorm:"foreignKey:LessonID"`
	Assignment      *Assignment          `gorm:"foreignKey:LessonID"`
}

func (Lesson) TableName() string { return "lessons" }

type LessonPrerequisite struct {
	ID                   string    `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	LessonID             string    `gorm:"type:uuid;not null;index"`
	PrerequisiteLessonID string    `gorm:"type:uuid;not null;index"`
	CreatedAt            time.Time `gorm:"not null;default:now()"`
}

func (LessonPrerequisite) TableName() string { return "lesson_prerequisites" }

type CourseEnrollment struct {
	ID              string           `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	CourseID        string           `gorm:"type:uuid;not null;uniqueIndex:idx_course_user,priority:1"`
	UserID          string           `gorm:"type:uuid;not null;uniqueIndex:idx_course_user,priority:2"`
	Status          EnrollmentStatus `gorm:"type:enrollment_status_enum;not null;default:'active';index"`
	EnrolledAt      time.Time        `gorm:"not null;default:now()"`
	CompletedAt     *time.Time
	LastAccessedAt  *time.Time
	ProgressPercent float64   `gorm:"not null;default:0"`
	CreatedAt       time.Time `gorm:"not null;default:now()"`
	UpdatedAt       time.Time `gorm:"not null;default:now()"`
	Course          Course    `gorm:"foreignKey:CourseID"`
	User            User      `gorm:"foreignKey:UserID"`
}

func (CourseEnrollment) TableName() string { return "course_enrollments" }

type LessonProgress struct {
	ID                  string `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	LessonID            string `gorm:"type:uuid;not null;uniqueIndex:idx_lesson_user,priority:1"`
	UserID              string `gorm:"type:uuid;not null;uniqueIndex:idx_lesson_user,priority:2"`
	IsCompleted         bool   `gorm:"not null;default:false"`
	CompletedAt         *time.Time
	LastPositionSeconds int       `gorm:"not null;default:0"`
	TimeSpentSeconds    int       `gorm:"not null;default:0"`
	CreatedAt           time.Time `gorm:"not null;default:now()"`
	UpdatedAt           time.Time `gorm:"not null;default:now()"`
}

func (LessonProgress) TableName() string { return "lesson_progress" }

type Quiz struct {
	ID               string `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	LessonID         string `gorm:"type:uuid;not null;uniqueIndex"`
	Title            string `gorm:"not null"`
	Description      *string
	PassScore        int `gorm:"not null;default:70"`
	TimeLimitMinutes *int
	MaxAttempts      *int
	IsActive         bool           `gorm:"not null;default:true"`
	CreatedAt        time.Time      `gorm:"not null;default:now()"`
	UpdatedAt        time.Time      `gorm:"not null;default:now()"`
	Questions        []QuizQuestion `gorm:"foreignKey:QuizID"`
}

func (Quiz) TableName() string { return "quizzes" }

type QuizQuestion struct {
	ID           string           `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	QuizID       string           `gorm:"type:uuid;not null;index"`
	QuestionText string           `gorm:"not null"`
	QuestionType QuizQuestionType `gorm:"type:quiz_question_type_enum;not null"`
	Explanation  *string
	Points       int          `gorm:"not null;default:1"`
	SortOrder    int          `gorm:"not null;default:0"`
	CreatedAt    time.Time    `gorm:"not null;default:now()"`
	UpdatedAt    time.Time    `gorm:"not null;default:now()"`
	Options      []QuizOption `gorm:"foreignKey:QuestionID"`
}

func (QuizQuestion) TableName() string { return "quiz_questions" }

type QuizOption struct {
	ID         string    `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	QuestionID string    `gorm:"type:uuid;not null;index"`
	OptionText string    `gorm:"not null"`
	IsCorrect  bool      `gorm:"not null;default:false"`
	SortOrder  int       `gorm:"not null;default:0"`
	CreatedAt  time.Time `gorm:"not null;default:now()"`
	UpdatedAt  time.Time `gorm:"not null;default:now()"`
}

func (QuizOption) TableName() string { return "quiz_options" }

type QuizAttempt struct {
	ID          string            `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	QuizID      string            `gorm:"type:uuid;not null;index"`
	UserID      string            `gorm:"type:uuid;not null;index"`
	Status      QuizAttemptStatus `gorm:"type:quiz_attempt_status_enum;not null;default:'in_progress'"`
	Score       *int
	Passed      *bool
	StartedAt   time.Time `gorm:"not null;default:now()"`
	SubmittedAt *time.Time
	GradedAt    *time.Time
	CreatedAt   time.Time           `gorm:"not null;default:now()"`
	Answers     []QuizAttemptAnswer `gorm:"foreignKey:AttemptID"`
}

func (QuizAttempt) TableName() string { return "quiz_attempts" }

type QuizAttemptAnswer struct {
	ID                string    `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	AttemptID         string    `gorm:"type:uuid;not null;index"`
	QuestionID        string    `gorm:"type:uuid;not null;index"`
	SelectedOptionIDs UUIDArray `gorm:"type:jsonb"`
	AnswerText        *string
	IsCorrect         *bool
	AwardedPoints     *int
	CreatedAt         time.Time `gorm:"not null;default:now()"`
	UpdatedAt         time.Time `gorm:"not null;default:now()"`
}

func (QuizAttemptAnswer) TableName() string { return "quiz_attempt_answers" }

type CourseCertificate struct {
	ID                string            `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	CourseID          string            `gorm:"type:uuid;not null;uniqueIndex:idx_course_certificate,priority:1"`
	UserID            string            `gorm:"type:uuid;not null;uniqueIndex:idx_course_certificate,priority:2"`
	CertificateNumber string            `gorm:"not null;uniqueIndex"`
	Status            CertificateStatus `gorm:"type:certificate_status_enum;not null;default:'issued'"`
	IssuedAt          time.Time         `gorm:"not null;default:now()"`
	RevokedAt         *time.Time
	TemplateName      *string
	Metadata          LearningContent `gorm:"type:jsonb"`
	CreatedAt         time.Time       `gorm:"not null;default:now()"`
	UpdatedAt         time.Time       `gorm:"not null;default:now()"`
	Course            Course          `gorm:"foreignKey:CourseID"`
	User              User            `gorm:"foreignKey:UserID"`
}

func (CourseCertificate) TableName() string { return "course_certificates" }

type Assignment struct {
	ID                  string `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	LessonID            string `gorm:"type:uuid;not null;uniqueIndex"`
	Title               string `gorm:"not null"`
	Instructions        *string
	DueAt               *time.Time
	MaxScore            *int
	AllowTextSubmission bool      `gorm:"not null;default:true"`
	AllowLinkSubmission bool      `gorm:"not null;default:false"`
	AllowFileSubmission bool      `gorm:"not null;default:false"`
	IsActive            bool      `gorm:"not null;default:true"`
	IsAutoApprove       bool      `gorm:"not null;default:false"`
	CreatedAt           time.Time `gorm:"not null;default:now()"`
	UpdatedAt           time.Time `gorm:"not null;default:now()"`
}

func (Assignment) TableName() string { return "assignments" }

type AssignmentSubmission struct {
	ID             string `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	AssignmentID   string `gorm:"type:uuid;not null;uniqueIndex:idx_assignment_submission_user,priority:1"`
	UserID         string `gorm:"type:uuid;not null;uniqueIndex:idx_assignment_submission_user,priority:2"`
	SubmissionText *string
	SubmissionURL  *string
	AttachmentURL  *string
	Status         AssignmentSubmissionStatus `gorm:"type:assignment_submission_status_enum;not null;default:'submitted'"`
	SubmittedAt    time.Time                  `gorm:"not null;default:now()"`
	ReviewedAt     *time.Time
	ReviewedBy     *string `gorm:"type:uuid"`
	Score          *int
	Feedback       *string
	CreatedAt      time.Time `gorm:"not null;default:now()"`
	UpdatedAt      time.Time `gorm:"not null;default:now()"`
	User           User      `gorm:"foreignKey:UserID"`
	Reviewer       *User     `gorm:"foreignKey:ReviewedBy"`
}

func (AssignmentSubmission) TableName() string { return "assignment_submissions" }
