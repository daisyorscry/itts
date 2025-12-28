package model

import "time"

/*
|--------------------------------------------------------------------------
| ENUMS
|--------------------------------------------------------------------------
*/

type Gender string

const (
	GenderMale   Gender = "male"
	GenderFemale Gender = "female"
)

type DegreeLevel string

const (
	DegreeD3 DegreeLevel = "D3"
	DegreeS1 DegreeLevel = "S1"
	DegreeS2 DegreeLevel = "S2"
	DegreeS3 DegreeLevel = "S3"
)

type ApplicationStatus string

const (
	AppDraft        ApplicationStatus = "draft"
	AppVerified     ApplicationStatus = "verified"
	AppPassed       ApplicationStatus = "passed"
	AppFailed       ApplicationStatus = "failed"
	AppReRegistered ApplicationStatus = "re_registered"
)

type DocumentStatus string

const (
	DocPending DocumentStatus = "pending"
	DocValid   DocumentStatus = "valid"
	DocInvalid DocumentStatus = "invalid"
)

type EvaluationType string

const (
	EvalWrittenTest   EvaluationType = "written_test"
	EvalInterview     EvaluationType = "interview"
	EvalAcademicScore EvaluationType = "academic_score"
	EvalOther         EvaluationType = "other"
)

type FinalResultStatus string

const (
	ResultPassed      FinalResultStatus = "passed"
	ResultFailed      FinalResultStatus = "failed"
	ResultWaitingList FinalResultStatus = "waiting_list"
)

type PaymentStatus string

const (
	PaymentUnpaid PaymentStatus = "unpaid"
	PaymentPaid   PaymentStatus = "paid"
)

/*
|--------------------------------------------------------------------------
| ENTITIES
|--------------------------------------------------------------------------
*/

type Applicant struct {
	ID             string `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	UserID         string `gorm:"type:uuid;unique;not null"`
	FullName       string `gorm:"size:100;not null"`
	NationalID     string `gorm:"size:16;unique;not null"`
	PlaceOfBirth   string `gorm:"size:100;not null"`
	DateOfBirth    *time.Time
	Gender         Gender `gorm:"type:gender_enum;not null"`
	Address        string `gorm:"size:255;not null"`
	PhoneNumber    string `gorm:"size:20;not null"`
	SchoolOrigin   string `gorm:"size:150;not null"`
	GraduationYear string `gorm:"size:4;not null"`
	CreatedAt      time.Time `gorm:"autoCreateTime"`
	UpdatedAt      time.Time `gorm:"autoUpdateTime"`

	Applications []Application
	Documents    []ApplicantDocument
}

type AdmissionTrack struct {
	ID           string `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	TrackCode    string `gorm:"size:20;unique;not null"`
	TrackName    string `gorm:"size:100;not null"`
	RequiresTest bool   `gorm:"default:false"`
	IsActive     bool   `gorm:"default:true"`
	CreatedAt    time.Time `gorm:"autoCreateTime"`
	UpdatedAt    time.Time `gorm:"autoUpdateTime"`

	Applications []Application
}

type Faculty struct {
	ID        string `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	Code      string `gorm:"size:20;unique;not null"`
	Name      string `gorm:"size:100;not null"`
	CreatedAt time.Time `gorm:"autoCreateTime"`
	UpdatedAt time.Time `gorm:"autoUpdateTime"`

	StudyPrograms []StudyProgram
}

type StudyProgram struct {
	ID          string      `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	FacultyID   string      `gorm:"type:uuid;not null"`
	Code        string      `gorm:"size:20;unique;not null"`
	Name        string      `gorm:"size:100;not null"`
	DegreeLevel DegreeLevel `gorm:"type:degree_level_enum;not null"`
	Quota       int         `gorm:"not null"`
	CreatedAt   time.Time `gorm:"autoCreateTime"`
	UpdatedAt   time.Time `gorm:"autoUpdateTime"`

	Faculty      Faculty
	Applications []Application
}

type Application struct {
	ID                string            `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	ApplicantID       string            `gorm:"type:uuid;not null;index"`
	TrackID           string            `gorm:"type:uuid;not null;index"`
	ProgramID         string            `gorm:"type:uuid;not null;index"`
	AcademicYear      string            `gorm:"size:9;not null;index"`
	ApplicationNumber string            `gorm:"size:30;unique;not null"`
	Status            ApplicationStatus `gorm:"size:20;not null;index"`
	CreatedAt         time.Time `gorm:"autoCreateTime"`
	UpdatedAt         time.Time `gorm:"autoUpdateTime"`

	Applicant Applicant
	Track     AdmissionTrack
	Program   StudyProgram

	Evaluations    []Evaluation
	FinalResult    *FinalResult
	ReRegistration *ReRegistration
}

type ApplicantDocument struct {
	ID                 string         `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	ApplicantID        string         `gorm:"type:uuid;not null;index"`
	DocumentType       string         `gorm:"size:50;not null;index"`
	FilePath           string         `gorm:"type:text;not null"`
	VerificationStatus DocumentStatus `gorm:"size:20;not null;index"`
	VerifiedBy         *string        `gorm:"type:uuid"`
	VerifiedAt         *time.Time
	CreatedAt          time.Time `gorm:"autoCreateTime"`
	UpdatedAt          time.Time `gorm:"autoUpdateTime"`

	Applicant Applicant
}

type Evaluation struct {
	ID             string         `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	ApplicationID  string         `gorm:"type:uuid;not null;index"`
	EvaluationType EvaluationType `gorm:"size:30;not null"`
	Score          *float64       `gorm:"type:numeric(5,2)"`
	Notes          string         `gorm:"type:text"`
	CreatedAt      time.Time `gorm:"autoCreateTime"`
	UpdatedAt      time.Time `gorm:"autoUpdateTime"`

	Application Application
}

type FinalResult struct {
	ID            string            `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	ApplicationID string            `gorm:"type:uuid;unique;not null"`
	ResultStatus  FinalResultStatus `gorm:"size:20;not null;index"`
	FinalScore    *float64          `gorm:"type:numeric(6,2)"`
	DecidedBy     *string           `gorm:"type:uuid"`
	DecisionDate  time.Time `gorm:"autoCreateTime"`
	UpdatedAt     time.Time `gorm:"autoUpdateTime"`

	Application Application
}

type ReRegistration struct {
	ID                 string        `gorm:"type:uuid;default:gen_random_uuid();primaryKey"`
	ApplicationID      string        `gorm:"type:uuid;unique;not null"`
	ReRegistrationDate time.Time     `gorm:"type:date;not null"`
	PaymentStatus      PaymentStatus `gorm:"size:20;not null;index"`
	PaymentProof       string        `gorm:"type:text"`
	CreatedAt          time.Time `gorm:"autoCreateTime"`
	UpdatedAt          time.Time `gorm:"autoUpdateTime"`

	Application Application
}
