package model

import "time"

/*
|--------------------------------------------------------------------------
| Applicant DTOs
|--------------------------------------------------------------------------
*/

type CreateApplicantRequest struct {
	UserID         string    `json:"user_id" validate:"required,uuid4"`
	FullName       string    `json:"full_name" validate:"required,min=3,max=100"`
	NationalID     string    `json:"national_id" validate:"required,len=16,numeric"`
	PlaceOfBirth   string    `json:"place_of_birth" validate:"required,max=100"`
	DateOfBirth    time.Time `json:"date_of_birth" validate:"required"`
	Gender         Gender    `json:"gender" validate:"required,oneof=male female"`
	Address        string    `json:"address" validate:"required,max=255"`
	PhoneNumber    string    `json:"phone_number" validate:"required,max=20"`
	SchoolOrigin   string    `json:"school_origin" validate:"required,max=150"`
	GraduationYear string    `json:"graduation_year" validate:"required,len=4,numeric"`
}

type UpdateApplicantRequest struct {
	FullName       *string    `json:"full_name,omitempty" validate:"omitempty,min=3,max=100"`
	PlaceOfBirth   *string    `json:"place_of_birth,omitempty" validate:"omitempty,max=100"`
	DateOfBirth    *time.Time `json:"date_of_birth,omitempty"`
	Gender         *Gender    `json:"gender,omitempty" validate:"omitempty,oneof=male female"`
	Address        *string    `json:"address,omitempty" validate:"omitempty,max=255"`
	PhoneNumber    *string    `json:"phone_number,omitempty" validate:"omitempty,max=20"`
	SchoolOrigin   *string    `json:"school_origin,omitempty" validate:"omitempty,max=150"`
	GraduationYear *string    `json:"graduation_year,omitempty" validate:"omitempty,len=4,numeric"`
}

type ApplicantResponse struct {
	ID             string                    `json:"id"`
	UserID         string                    `json:"user_id"`
	FullName       string                    `json:"full_name"`
	NationalID     string                    `json:"national_id"`
	PlaceOfBirth   string                    `json:"place_of_birth"`
	DateOfBirth    *time.Time                `json:"date_of_birth,omitempty"`
	Gender         string                    `json:"gender"`
	Address        string                    `json:"address"`
	PhoneNumber    string                    `json:"phone_number"`
	SchoolOrigin   string                    `json:"school_origin"`
	GraduationYear string                    `json:"graduation_year"`
	Applications   []ApplicationResponse     `json:"applications,omitempty"`
	Documents      []ApplicantDocumentResponse `json:"documents,omitempty"`
	CreatedAt      time.Time                 `json:"created_at"`
	UpdatedAt      time.Time                 `json:"updated_at"`
}

/*
|--------------------------------------------------------------------------
| Application DTOs
|--------------------------------------------------------------------------
*/

type CreateApplicationRequest struct {
	ApplicantID  string            `json:"applicant_id" validate:"required,uuid4"`
	TrackID      string            `json:"track_id" validate:"required,uuid4"`
	ProgramID    string            `json:"program_id" validate:"required,uuid4"`
	AcademicYear string            `json:"academic_year" validate:"required,len=9"`
	Status       ApplicationStatus `json:"status,omitempty" validate:"omitempty,oneof=draft verified passed failed re_registered"`
}

type UpdateApplicationRequest struct {
	TrackID      *string            `json:"track_id,omitempty" validate:"omitempty,uuid4"`
	ProgramID    *string            `json:"program_id,omitempty" validate:"omitempty,uuid4"`
	AcademicYear *string            `json:"academic_year,omitempty" validate:"omitempty,len=9"`
	Status       *ApplicationStatus `json:"status,omitempty" validate:"omitempty,oneof=draft verified passed failed re_registered"`
}

type UpdateApplicationStatusRequest struct {
	Status ApplicationStatus `json:"status" validate:"required,oneof=draft verified passed failed re_registered"`
}

type ApplicationResponse struct {
	ID                string                `json:"id"`
	ApplicantID       string                `json:"applicant_id"`
	TrackID           string                `json:"track_id"`
	ProgramID         string                `json:"program_id"`
	AcademicYear      string                `json:"academic_year"`
	ApplicationNumber string                `json:"application_number"`
	Status            string                `json:"status"`
	Applicant         *ApplicantResponse    `json:"applicant,omitempty"`
	Track             *AdmissionTrackResponse `json:"track,omitempty"`
	Program           *StudyProgramResponse `json:"program,omitempty"`
	Evaluations       []EvaluationResponse  `json:"evaluations,omitempty"`
	FinalResult       *FinalResultResponse  `json:"final_result,omitempty"`
	ReRegistration    *ReRegistrationResponse `json:"re_registration,omitempty"`
	CreatedAt         time.Time             `json:"created_at"`
	UpdatedAt         time.Time             `json:"updated_at"`
}

/*
|--------------------------------------------------------------------------
| Admission Track DTOs
|--------------------------------------------------------------------------
*/

type CreateAdmissionTrackRequest struct {
	TrackCode    string `json:"track_code" validate:"required,max=20"`
	TrackName    string `json:"track_name" validate:"required,max=100"`
	RequiresTest bool   `json:"requires_test"`
	IsActive     bool   `json:"is_active"`
}

type UpdateAdmissionTrackRequest struct {
	TrackCode    *string `json:"track_code,omitempty" validate:"omitempty,max=20"`
	TrackName    *string `json:"track_name,omitempty" validate:"omitempty,max=100"`
	RequiresTest *bool   `json:"requires_test,omitempty"`
	IsActive     *bool   `json:"is_active,omitempty"`
}

type AdmissionTrackResponse struct {
	ID           string    `json:"id"`
	TrackCode    string    `json:"track_code"`
	TrackName    string    `json:"track_name"`
	RequiresTest bool      `json:"requires_test"`
	IsActive     bool      `json:"is_active"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

/*
|--------------------------------------------------------------------------
| Faculty DTOs
|--------------------------------------------------------------------------
*/

type CreateFacultyRequest struct {
	Code string `json:"code" validate:"required,max=20"`
	Name string `json:"name" validate:"required,max=100"`
}

type UpdateFacultyRequest struct {
	Code *string `json:"code,omitempty" validate:"omitempty,max=20"`
	Name *string `json:"name,omitempty" validate:"omitempty,max=100"`
}

type FacultyResponse struct {
	ID            string                  `json:"id"`
	Code          string                  `json:"code"`
	Name          string                  `json:"name"`
	StudyPrograms []StudyProgramResponse  `json:"study_programs,omitempty"`
	CreatedAt     time.Time               `json:"created_at"`
	UpdatedAt     time.Time               `json:"updated_at"`
}

/*
|--------------------------------------------------------------------------
| Study Program DTOs
|--------------------------------------------------------------------------
*/

type CreateStudyProgramRequest struct {
	FacultyID   string      `json:"faculty_id" validate:"required,uuid4"`
	Code        string      `json:"code" validate:"required,max=20"`
	Name        string      `json:"name" validate:"required,max=100"`
	DegreeLevel DegreeLevel `json:"degree_level" validate:"required,oneof=D3 S1 S2 S3"`
	Quota       int         `json:"quota" validate:"required,min=1"`
}

type UpdateStudyProgramRequest struct {
	FacultyID   *string      `json:"faculty_id,omitempty" validate:"omitempty,uuid4"`
	Code        *string      `json:"code,omitempty" validate:"omitempty,max=20"`
	Name        *string      `json:"name,omitempty" validate:"omitempty,max=100"`
	DegreeLevel *DegreeLevel `json:"degree_level,omitempty" validate:"omitempty,oneof=D3 S1 S2 S3"`
	Quota       *int         `json:"quota,omitempty" validate:"omitempty,min=1"`
}

type StudyProgramResponse struct {
	ID          string           `json:"id"`
	FacultyID   string           `json:"faculty_id"`
	Code        string           `json:"code"`
	Name        string           `json:"name"`
	DegreeLevel string           `json:"degree_level"`
	Quota       int              `json:"quota"`
	Faculty     *FacultyResponse `json:"faculty,omitempty"`
	CreatedAt   time.Time        `json:"created_at"`
	UpdatedAt   time.Time        `json:"updated_at"`
}

/*
|--------------------------------------------------------------------------
| Applicant Document DTOs
|--------------------------------------------------------------------------
*/

type CreateApplicantDocumentRequest struct {
	ApplicantID  string `json:"applicant_id" validate:"required,uuid4"`
	DocumentType string `json:"document_type" validate:"required,max=50"`
	FilePath     string `json:"file_path" validate:"required"`
}

type UpdateDocumentVerificationRequest struct {
	Status     DocumentStatus `json:"status" validate:"required,oneof=pending valid invalid"`
	VerifiedBy string         `json:"verified_by" validate:"required,uuid4"`
}

type ApplicantDocumentResponse struct {
	ID                 string    `json:"id"`
	ApplicantID        string    `json:"applicant_id"`
	DocumentType       string    `json:"document_type"`
	FilePath           string    `json:"file_path"`
	VerificationStatus string    `json:"verification_status"`
	VerifiedBy         *string   `json:"verified_by,omitempty"`
	VerifiedAt         *time.Time `json:"verified_at,omitempty"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`
}

/*
|--------------------------------------------------------------------------
| Evaluation DTOs
|--------------------------------------------------------------------------
*/

type CreateEvaluationRequest struct {
	ApplicationID  string         `json:"application_id" validate:"required,uuid4"`
	EvaluationType EvaluationType `json:"evaluation_type" validate:"required,oneof=written_test interview academic_score other"`
	Score          *float64       `json:"score,omitempty" validate:"omitempty,min=0,max=100"`
	Notes          string         `json:"notes,omitempty"`
}

type UpdateEvaluationRequest struct {
	EvaluationType *EvaluationType `json:"evaluation_type,omitempty" validate:"omitempty,oneof=written_test interview academic_score other"`
	Score          *float64        `json:"score,omitempty" validate:"omitempty,min=0,max=100"`
	Notes          *string         `json:"notes,omitempty"`
}

type EvaluationResponse struct {
	ID             string    `json:"id"`
	ApplicationID  string    `json:"application_id"`
	EvaluationType string    `json:"evaluation_type"`
	Score          *float64  `json:"score,omitempty"`
	Notes          string    `json:"notes,omitempty"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

/*
|--------------------------------------------------------------------------
| Final Result DTOs
|--------------------------------------------------------------------------
*/

type CreateFinalResultRequest struct {
	ApplicationID string            `json:"application_id" validate:"required,uuid4"`
	ResultStatus  FinalResultStatus `json:"result_status" validate:"required,oneof=passed failed waiting_list"`
	FinalScore    *float64          `json:"final_score,omitempty" validate:"omitempty,min=0,max=100"`
	DecidedBy     *string           `json:"decided_by,omitempty" validate:"omitempty,uuid4"`
}

type UpdateFinalResultRequest struct {
	ResultStatus *FinalResultStatus `json:"result_status,omitempty" validate:"omitempty,oneof=passed failed waiting_list"`
	FinalScore   *float64           `json:"final_score,omitempty" validate:"omitempty,min=0,max=100"`
	DecidedBy    *string            `json:"decided_by,omitempty" validate:"omitempty,uuid4"`
}

type FinalResultResponse struct {
	ID            string              `json:"id"`
	ApplicationID string              `json:"application_id"`
	ResultStatus  string              `json:"result_status"`
	FinalScore    *float64            `json:"final_score,omitempty"`
	DecidedBy     *string             `json:"decided_by,omitempty"`
	DecisionDate  time.Time           `json:"decision_date"`
	Application   *ApplicationResponse `json:"application,omitempty"`
	UpdatedAt     time.Time           `json:"updated_at"`
}

/*
|--------------------------------------------------------------------------
| Re-Registration DTOs
|--------------------------------------------------------------------------
*/

type CreateReRegistrationRequest struct {
	ApplicationID      string        `json:"application_id" validate:"required,uuid4"`
	ReRegistrationDate time.Time     `json:"re_registration_date" validate:"required"`
	PaymentStatus      PaymentStatus `json:"payment_status" validate:"required,oneof=unpaid paid"`
	PaymentProof       string        `json:"payment_proof,omitempty"`
}

type UpdateReRegistrationRequest struct {
	ReRegistrationDate *time.Time     `json:"re_registration_date,omitempty"`
	PaymentStatus      *PaymentStatus `json:"payment_status,omitempty" validate:"omitempty,oneof=unpaid paid"`
	PaymentProof       *string        `json:"payment_proof,omitempty"`
}

type UpdatePaymentStatusRequest struct {
	PaymentStatus PaymentStatus `json:"payment_status" validate:"required,oneof=unpaid paid"`
	PaymentProof  string        `json:"payment_proof,omitempty"`
}

type ReRegistrationResponse struct {
	ID                 string              `json:"id"`
	ApplicationID      string              `json:"application_id"`
	ReRegistrationDate time.Time           `json:"re_registration_date"`
	PaymentStatus      string              `json:"payment_status"`
	PaymentProof       string              `json:"payment_proof,omitempty"`
	Application        *ApplicationResponse `json:"application,omitempty"`
	CreatedAt          time.Time           `json:"created_at"`
	UpdatedAt          time.Time           `json:"updated_at"`
}

/*
|--------------------------------------------------------------------------
| List Response DTOs
|--------------------------------------------------------------------------
*/

type ApplicantListResponse struct {
	Data       []ApplicantResponse `json:"data"`
	Total      int64               `json:"total"`
	Page       int                 `json:"page"`
	PageSize   int                 `json:"page_size"`
	TotalPages int                 `json:"total_pages"`
}

type ApplicationListResponse struct {
	Data       []ApplicationResponse `json:"data"`
	Total      int64                 `json:"total"`
	Page       int                   `json:"page"`
	PageSize   int                   `json:"page_size"`
	TotalPages int                   `json:"total_pages"`
}

type AdmissionTrackListResponse struct {
	Data       []AdmissionTrackResponse `json:"data"`
	Total      int64                    `json:"total"`
	Page       int                      `json:"page"`
	PageSize   int                      `json:"page_size"`
	TotalPages int                      `json:"total_pages"`
}

type FacultyListResponse struct {
	Data       []FacultyResponse `json:"data"`
	Total      int64             `json:"total"`
	Page       int               `json:"page"`
	PageSize   int               `json:"page_size"`
	TotalPages int               `json:"total_pages"`
}

type StudyProgramListResponse struct {
	Data       []StudyProgramResponse `json:"data"`
	Total      int64                  `json:"total"`
	Page       int                    `json:"page"`
	PageSize   int                    `json:"page_size"`
	TotalPages int                    `json:"total_pages"`
}

type ApplicantDocumentListResponse struct {
	Data       []ApplicantDocumentResponse `json:"data"`
	Total      int64                       `json:"total"`
	Page       int                         `json:"page"`
	PageSize   int                         `json:"page_size"`
	TotalPages int                         `json:"total_pages"`
}

type EvaluationListResponse struct {
	Data       []EvaluationResponse `json:"data"`
	Total      int64                `json:"total"`
	Page       int                  `json:"page"`
	PageSize   int                  `json:"page_size"`
	TotalPages int                  `json:"total_pages"`
}

type FinalResultListResponse struct {
	Data       []FinalResultResponse `json:"data"`
	Total      int64                 `json:"total"`
	Page       int                   `json:"page"`
	PageSize   int                   `json:"page_size"`
	TotalPages int                   `json:"total_pages"`
}

type ReRegistrationListResponse struct {
	Data       []ReRegistrationResponse `json:"data"`
	Total      int64                    `json:"total"`
	Page       int                      `json:"page"`
	PageSize   int                      `json:"page_size"`
	TotalPages int                      `json:"total_pages"`
}

/*
|--------------------------------------------------------------------------
| Statistics DTOs
|--------------------------------------------------------------------------
*/

type ApplicationStatsResponse struct {
	AcademicYear string                 `json:"academic_year"`
	Total        int64                  `json:"total"`
	ByStatus     map[string]int64       `json:"by_status"`
	ByTrack      []TrackStatistic       `json:"by_track"`
	ByProgram    []ProgramStatistic     `json:"by_program"`
}

type TrackStatistic struct {
	TrackID   string `json:"track_id"`
	TrackName string `json:"track_name"`
	Count     int64  `json:"count"`
}

type ProgramStatistic struct {
	ProgramID   string `json:"program_id"`
	ProgramName string `json:"program_name"`
	Count       int64  `json:"count"`
}

type ProgramDetailStatsResponse struct {
	Program        StudyProgramResponse `json:"program"`
	Total          int64                `json:"total"`
	ByStatus       map[string]int64     `json:"by_status"`
	Quota          int                  `json:"quota"`
	AvailableQuota int                  `json:"available_quota"`
	FilledQuota    int                  `json:"filled_quota"`
}

/*
|--------------------------------------------------------------------------
| Converter Functions - Request to Model
|--------------------------------------------------------------------------
*/

func (r CreateApplicantRequest) ToModel() Applicant {
	dob := r.DateOfBirth
	return Applicant{
		UserID:         r.UserID,
		FullName:       r.FullName,
		NationalID:     r.NationalID,
		PlaceOfBirth:   r.PlaceOfBirth,
		DateOfBirth:    &dob,
		Gender:         r.Gender,
		Address:        r.Address,
		PhoneNumber:    r.PhoneNumber,
		SchoolOrigin:   r.SchoolOrigin,
		GraduationYear: r.GraduationYear,
	}
}

func (r CreateApplicationRequest) ToModel() Application {
	status := r.Status
	if status == "" {
		status = AppDraft
	}
	return Application{
		ApplicantID:  r.ApplicantID,
		TrackID:      r.TrackID,
		ProgramID:    r.ProgramID,
		AcademicYear: r.AcademicYear,
		Status:       status,
	}
}

func (r CreateAdmissionTrackRequest) ToModel() AdmissionTrack {
	return AdmissionTrack{
		TrackCode:    r.TrackCode,
		TrackName:    r.TrackName,
		RequiresTest: r.RequiresTest,
		IsActive:     r.IsActive,
	}
}

func (r CreateFacultyRequest) ToModel() Faculty {
	return Faculty{
		Code: r.Code,
		Name: r.Name,
	}
}

func (r CreateStudyProgramRequest) ToModel() StudyProgram {
	return StudyProgram{
		FacultyID:   r.FacultyID,
		Code:        r.Code,
		Name:        r.Name,
		DegreeLevel: r.DegreeLevel,
		Quota:       r.Quota,
	}
}

func (r CreateApplicantDocumentRequest) ToModel() ApplicantDocument {
	return ApplicantDocument{
		ApplicantID:        r.ApplicantID,
		DocumentType:       r.DocumentType,
		FilePath:           r.FilePath,
		VerificationStatus: DocPending,
	}
}

func (r CreateEvaluationRequest) ToModel() Evaluation {
	return Evaluation{
		ApplicationID:  r.ApplicationID,
		EvaluationType: r.EvaluationType,
		Score:          r.Score,
		Notes:          r.Notes,
	}
}

func (r CreateFinalResultRequest) ToModel() FinalResult {
	return FinalResult{
		ApplicationID: r.ApplicationID,
		ResultStatus:  r.ResultStatus,
		FinalScore:    r.FinalScore,
		DecidedBy:     r.DecidedBy,
	}
}

func (r CreateReRegistrationRequest) ToModel() ReRegistration {
	return ReRegistration{
		ApplicationID:      r.ApplicationID,
		ReRegistrationDate: r.ReRegistrationDate,
		PaymentStatus:      r.PaymentStatus,
		PaymentProof:       r.PaymentProof,
	}
}

/*
|--------------------------------------------------------------------------
| Converter Functions - Model to Response
|--------------------------------------------------------------------------
*/

func ApplicantToResponse(m Applicant) ApplicantResponse {
	resp := ApplicantResponse{
		ID:             m.ID,
		UserID:         m.UserID,
		FullName:       m.FullName,
		NationalID:     m.NationalID,
		PlaceOfBirth:   m.PlaceOfBirth,
		DateOfBirth:    m.DateOfBirth,
		Gender:         string(m.Gender),
		Address:        m.Address,
		PhoneNumber:    m.PhoneNumber,
		SchoolOrigin:   m.SchoolOrigin,
		GraduationYear: m.GraduationYear,
		CreatedAt:      m.CreatedAt,
		UpdatedAt:      m.UpdatedAt,
	}

	if len(m.Applications) > 0 {
		resp.Applications = make([]ApplicationResponse, 0, len(m.Applications))
		for _, app := range m.Applications {
			resp.Applications = append(resp.Applications, ApplicationToResponse(app))
		}
	}

	if len(m.Documents) > 0 {
		resp.Documents = make([]ApplicantDocumentResponse, 0, len(m.Documents))
		for _, doc := range m.Documents {
			resp.Documents = append(resp.Documents, ApplicantDocumentToResponse(doc))
		}
	}

	return resp
}

func ApplicationToResponse(m Application) ApplicationResponse {
	resp := ApplicationResponse{
		ID:                m.ID,
		ApplicantID:       m.ApplicantID,
		TrackID:           m.TrackID,
		ProgramID:         m.ProgramID,
		AcademicYear:      m.AcademicYear,
		ApplicationNumber: m.ApplicationNumber,
		Status:            string(m.Status),
		CreatedAt:         m.CreatedAt,
		UpdatedAt:         m.UpdatedAt,
	}

	if m.Applicant.ID != "" {
		applicant := ApplicantToResponse(m.Applicant)
		resp.Applicant = &applicant
	}

	if m.Track.ID != "" {
		track := AdmissionTrackToResponse(m.Track)
		resp.Track = &track
	}

	if m.Program.ID != "" {
		program := StudyProgramToResponse(m.Program)
		resp.Program = &program
	}

	if len(m.Evaluations) > 0 {
		resp.Evaluations = make([]EvaluationResponse, 0, len(m.Evaluations))
		for _, eval := range m.Evaluations {
			resp.Evaluations = append(resp.Evaluations, EvaluationToResponse(eval))
		}
	}

	if m.FinalResult != nil && m.FinalResult.ID != "" {
		result := FinalResultToResponse(*m.FinalResult)
		resp.FinalResult = &result
	}

	if m.ReRegistration != nil && m.ReRegistration.ID != "" {
		reReg := ReRegistrationToResponse(*m.ReRegistration)
		resp.ReRegistration = &reReg
	}

	return resp
}

func AdmissionTrackToResponse(m AdmissionTrack) AdmissionTrackResponse {
	return AdmissionTrackResponse{
		ID:           m.ID,
		TrackCode:    m.TrackCode,
		TrackName:    m.TrackName,
		RequiresTest: m.RequiresTest,
		IsActive:     m.IsActive,
		CreatedAt:    m.CreatedAt,
		UpdatedAt:    m.UpdatedAt,
	}
}

func FacultyToResponse(m Faculty) FacultyResponse {
	resp := FacultyResponse{
		ID:        m.ID,
		Code:      m.Code,
		Name:      m.Name,
		CreatedAt: m.CreatedAt,
		UpdatedAt: m.UpdatedAt,
	}

	if len(m.StudyPrograms) > 0 {
		resp.StudyPrograms = make([]StudyProgramResponse, 0, len(m.StudyPrograms))
		for _, prog := range m.StudyPrograms {
			resp.StudyPrograms = append(resp.StudyPrograms, StudyProgramToResponse(prog))
		}
	}

	return resp
}

func StudyProgramToResponse(m StudyProgram) StudyProgramResponse {
	resp := StudyProgramResponse{
		ID:          m.ID,
		FacultyID:   m.FacultyID,
		Code:        m.Code,
		Name:        m.Name,
		DegreeLevel: string(m.DegreeLevel),
		Quota:       m.Quota,
		CreatedAt:   m.CreatedAt,
		UpdatedAt:   m.UpdatedAt,
	}

	if m.Faculty.ID != "" {
		faculty := FacultyToResponse(m.Faculty)
		resp.Faculty = &faculty
	}

	return resp
}

func ApplicantDocumentToResponse(m ApplicantDocument) ApplicantDocumentResponse {
	return ApplicantDocumentResponse{
		ID:                 m.ID,
		ApplicantID:        m.ApplicantID,
		DocumentType:       m.DocumentType,
		FilePath:           m.FilePath,
		VerificationStatus: string(m.VerificationStatus),
		VerifiedBy:         m.VerifiedBy,
		VerifiedAt:         m.VerifiedAt,
		CreatedAt:          m.CreatedAt,
		UpdatedAt:          m.UpdatedAt,
	}
}

func EvaluationToResponse(m Evaluation) EvaluationResponse {
	return EvaluationResponse{
		ID:             m.ID,
		ApplicationID:  m.ApplicationID,
		EvaluationType: string(m.EvaluationType),
		Score:          m.Score,
		Notes:          m.Notes,
		CreatedAt:      m.CreatedAt,
		UpdatedAt:      m.UpdatedAt,
	}
}

func FinalResultToResponse(m FinalResult) FinalResultResponse {
	resp := FinalResultResponse{
		ID:            m.ID,
		ApplicationID: m.ApplicationID,
		ResultStatus:  string(m.ResultStatus),
		FinalScore:    m.FinalScore,
		DecidedBy:     m.DecidedBy,
		DecisionDate:  m.DecisionDate,
		UpdatedAt:     m.UpdatedAt,
	}

	if m.Application.ID != "" {
		app := ApplicationToResponse(m.Application)
		resp.Application = &app
	}

	return resp
}

func ReRegistrationToResponse(m ReRegistration) ReRegistrationResponse {
	resp := ReRegistrationResponse{
		ID:                 m.ID,
		ApplicationID:      m.ApplicationID,
		ReRegistrationDate: m.ReRegistrationDate,
		PaymentStatus:      string(m.PaymentStatus),
		PaymentProof:       m.PaymentProof,
		CreatedAt:          m.CreatedAt,
		UpdatedAt:          m.UpdatedAt,
	}

	if m.Application.ID != "" {
		app := ApplicationToResponse(m.Application)
		resp.Application = &app
	}

	return resp
}
