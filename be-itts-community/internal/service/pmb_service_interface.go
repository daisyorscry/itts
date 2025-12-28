package service

import (
	"context"

	"be-itts-community/internal/model"
	"be-itts-community/internal/repository"
)

// PMBService handles PMB (Penerimaan Mahasiswa Baru) business logic
type PMBService interface {
	// Applicant Operations
	CreateApplicant(ctx context.Context, req model.CreateApplicantRequest) (model.ApplicantResponse, error)
	GetApplicant(ctx context.Context, id string) (model.ApplicantResponse, error)
	GetApplicantByUserID(ctx context.Context, userID string) (model.ApplicantResponse, error)
	UpdateApplicant(ctx context.Context, id string, req model.UpdateApplicantRequest) (model.ApplicantResponse, error)
	DeleteApplicant(ctx context.Context, id string) error
	ListApplicants(ctx context.Context, params repository.ListParams) (model.ApplicantListResponse, error)

	// Application Operations
	CreateApplication(ctx context.Context, req model.CreateApplicationRequest) (model.ApplicationResponse, error)
	GetApplication(ctx context.Context, id string) (model.ApplicationResponse, error)
	GetApplicationByNumber(ctx context.Context, applicationNumber string) (model.ApplicationResponse, error)
	GetApplicationWithDetails(ctx context.Context, id string) (model.ApplicationResponse, error)
	UpdateApplication(ctx context.Context, id string, req model.UpdateApplicationRequest) (model.ApplicationResponse, error)
	UpdateApplicationStatus(ctx context.Context, id string, req model.UpdateApplicationStatusRequest) (model.ApplicationResponse, error)
	DeleteApplication(ctx context.Context, id string) error
	ListApplications(ctx context.Context, params repository.ListParams) (model.ApplicationListResponse, error)
	ListApplicationsByApplicant(ctx context.Context, applicantID string, params repository.ListParams) (model.ApplicationListResponse, error)
	ListApplicationsByTrack(ctx context.Context, trackID string, params repository.ListParams) (model.ApplicationListResponse, error)
	ListApplicationsByProgram(ctx context.Context, programID string, params repository.ListParams) (model.ApplicationListResponse, error)

	// Admission Track Operations
	CreateAdmissionTrack(ctx context.Context, req model.CreateAdmissionTrackRequest) (model.AdmissionTrackResponse, error)
	GetAdmissionTrack(ctx context.Context, id string) (model.AdmissionTrackResponse, error)
	GetAdmissionTrackByCode(ctx context.Context, code string) (model.AdmissionTrackResponse, error)
	UpdateAdmissionTrack(ctx context.Context, id string, req model.UpdateAdmissionTrackRequest) (model.AdmissionTrackResponse, error)
	DeleteAdmissionTrack(ctx context.Context, id string) error
	ListAdmissionTracks(ctx context.Context, params repository.ListParams) (model.AdmissionTrackListResponse, error)
	ListActiveAdmissionTracks(ctx context.Context) ([]model.AdmissionTrackResponse, error)

	// Faculty Operations
	CreateFaculty(ctx context.Context, req model.CreateFacultyRequest) (model.FacultyResponse, error)
	GetFaculty(ctx context.Context, id string) (model.FacultyResponse, error)
	GetFacultyByCode(ctx context.Context, code string) (model.FacultyResponse, error)
	GetFacultyWithPrograms(ctx context.Context, id string) (model.FacultyResponse, error)
	UpdateFaculty(ctx context.Context, id string, req model.UpdateFacultyRequest) (model.FacultyResponse, error)
	DeleteFaculty(ctx context.Context, id string) error
	ListFaculties(ctx context.Context, params repository.ListParams) (model.FacultyListResponse, error)

	// Study Program Operations
	CreateStudyProgram(ctx context.Context, req model.CreateStudyProgramRequest) (model.StudyProgramResponse, error)
	GetStudyProgram(ctx context.Context, id string) (model.StudyProgramResponse, error)
	GetStudyProgramByCode(ctx context.Context, code string) (model.StudyProgramResponse, error)
	GetStudyProgramWithFaculty(ctx context.Context, id string) (model.StudyProgramResponse, error)
	UpdateStudyProgram(ctx context.Context, id string, req model.UpdateStudyProgramRequest) (model.StudyProgramResponse, error)
	DeleteStudyProgram(ctx context.Context, id string) error
	ListStudyPrograms(ctx context.Context, params repository.ListParams) (model.StudyProgramListResponse, error)
	ListStudyProgramsByFaculty(ctx context.Context, facultyID string) ([]model.StudyProgramResponse, error)
	GetAvailableQuota(ctx context.Context, programID string, academicYear string) (int, error)

	// Applicant Document Operations
	CreateApplicantDocument(ctx context.Context, req model.CreateApplicantDocumentRequest) (model.ApplicantDocumentResponse, error)
	GetApplicantDocument(ctx context.Context, id string) (model.ApplicantDocumentResponse, error)
	UpdateDocumentVerification(ctx context.Context, id string, req model.UpdateDocumentVerificationRequest) (model.ApplicantDocumentResponse, error)
	DeleteApplicantDocument(ctx context.Context, id string) error
	ListApplicantDocuments(ctx context.Context, params repository.ListParams) (model.ApplicantDocumentListResponse, error)
	ListDocumentsByApplicant(ctx context.Context, applicantID string) ([]model.ApplicantDocumentResponse, error)

	// Evaluation Operations
	CreateEvaluation(ctx context.Context, req model.CreateEvaluationRequest) (model.EvaluationResponse, error)
	GetEvaluation(ctx context.Context, id string) (model.EvaluationResponse, error)
	UpdateEvaluation(ctx context.Context, id string, req model.UpdateEvaluationRequest) (model.EvaluationResponse, error)
	DeleteEvaluation(ctx context.Context, id string) error
	ListEvaluations(ctx context.Context, params repository.ListParams) (model.EvaluationListResponse, error)
	ListEvaluationsByApplication(ctx context.Context, applicationID string) ([]model.EvaluationResponse, error)
	GetAverageScore(ctx context.Context, applicationID string) (float64, error)

	// Final Result Operations
	CreateFinalResult(ctx context.Context, req model.CreateFinalResultRequest) (model.FinalResultResponse, error)
	GetFinalResult(ctx context.Context, id string) (model.FinalResultResponse, error)
	GetFinalResultByApplication(ctx context.Context, applicationID string) (model.FinalResultResponse, error)
	UpdateFinalResult(ctx context.Context, id string, req model.UpdateFinalResultRequest) (model.FinalResultResponse, error)
	DeleteFinalResult(ctx context.Context, id string) error
	ListFinalResults(ctx context.Context, params repository.ListParams) (model.FinalResultListResponse, error)
	ListPassedApplicants(ctx context.Context, academicYear string, programID *string) ([]model.FinalResultResponse, error)

	// Re-Registration Operations
	CreateReRegistration(ctx context.Context, req model.CreateReRegistrationRequest) (model.ReRegistrationResponse, error)
	GetReRegistration(ctx context.Context, id string) (model.ReRegistrationResponse, error)
	GetReRegistrationByApplication(ctx context.Context, applicationID string) (model.ReRegistrationResponse, error)
	UpdateReRegistration(ctx context.Context, id string, req model.UpdateReRegistrationRequest) (model.ReRegistrationResponse, error)
	UpdatePaymentStatus(ctx context.Context, id string, req model.UpdatePaymentStatusRequest) (model.ReRegistrationResponse, error)
	DeleteReRegistration(ctx context.Context, id string) error
	ListReRegistrations(ctx context.Context, params repository.ListParams) (model.ReRegistrationListResponse, error)
	ListPendingPayments(ctx context.Context, academicYear string) ([]model.ReRegistrationResponse, error)

	// Analytics & Reports
	GetApplicationStatsByAcademicYear(ctx context.Context, academicYear string) (model.ApplicationStatsResponse, error)
	GetApplicationStatsByProgram(ctx context.Context, programID string, academicYear string) (model.ProgramDetailStatsResponse, error)
}
