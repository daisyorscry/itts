package repository

import (
	"context"

	"be-itts-community/internal/model"
)

// PMBRepository handles PMB (Penerimaan Mahasiswa Baru) operations
type PMBRepository interface {
	// Transaction support
	RunInTransaction(ctx context.Context, fn func(txCtx context.Context) error) error

	// Applicant Operations
	CreateApplicant(ctx context.Context, applicant *model.Applicant) error
	GetApplicantByID(ctx context.Context, id string) (*model.Applicant, error)
	GetApplicantByUserID(ctx context.Context, userID string) (*model.Applicant, error)
	GetApplicantByNationalID(ctx context.Context, nationalID string) (*model.Applicant, error)
	UpdateApplicant(ctx context.Context, applicant *model.Applicant) error
	DeleteApplicant(ctx context.Context, id string) error
	ListApplicants(ctx context.Context, params ListParams) (*PageResult[model.Applicant], error)

	// Application Operations
	CreateApplication(ctx context.Context, application *model.Application) error
	GetApplicationByID(ctx context.Context, id string) (*model.Application, error)
	GetApplicationByNumber(ctx context.Context, applicationNumber string) (*model.Application, error)
	GetApplicationWithDetails(ctx context.Context, id string) (*model.Application, error)
	UpdateApplication(ctx context.Context, application *model.Application) error
	UpdateApplicationStatus(ctx context.Context, id string, status model.ApplicationStatus) error
	DeleteApplication(ctx context.Context, id string) error
	ListApplications(ctx context.Context, params ListParams) (*PageResult[model.Application], error)
	ListApplicationsByApplicant(ctx context.Context, applicantID string, params ListParams) (*PageResult[model.Application], error)
	ListApplicationsByTrack(ctx context.Context, trackID string, params ListParams) (*PageResult[model.Application], error)
	ListApplicationsByProgram(ctx context.Context, programID string, params ListParams) (*PageResult[model.Application], error)
	CountApplicationsByStatus(ctx context.Context, academicYear string, status model.ApplicationStatus) (int64, error)

	// Admission Track Operations
	CreateAdmissionTrack(ctx context.Context, track *model.AdmissionTrack) error
	GetAdmissionTrackByID(ctx context.Context, id string) (*model.AdmissionTrack, error)
	GetAdmissionTrackByCode(ctx context.Context, code string) (*model.AdmissionTrack, error)
	UpdateAdmissionTrack(ctx context.Context, track *model.AdmissionTrack) error
	DeleteAdmissionTrack(ctx context.Context, id string) error
	ListAdmissionTracks(ctx context.Context, params ListParams) (*PageResult[model.AdmissionTrack], error)
	ListActiveAdmissionTracks(ctx context.Context) ([]model.AdmissionTrack, error)

	// Faculty Operations
	CreateFaculty(ctx context.Context, faculty *model.Faculty) error
	GetFacultyByID(ctx context.Context, id string) (*model.Faculty, error)
	GetFacultyByCode(ctx context.Context, code string) (*model.Faculty, error)
	GetFacultyWithPrograms(ctx context.Context, id string) (*model.Faculty, error)
	UpdateFaculty(ctx context.Context, faculty *model.Faculty) error
	DeleteFaculty(ctx context.Context, id string) error
	ListFaculties(ctx context.Context, params ListParams) (*PageResult[model.Faculty], error)

	// Study Program Operations
	CreateStudyProgram(ctx context.Context, program *model.StudyProgram) error
	GetStudyProgramByID(ctx context.Context, id string) (*model.StudyProgram, error)
	GetStudyProgramByCode(ctx context.Context, code string) (*model.StudyProgram, error)
	GetStudyProgramWithFaculty(ctx context.Context, id string) (*model.StudyProgram, error)
	UpdateStudyProgram(ctx context.Context, program *model.StudyProgram) error
	DeleteStudyProgram(ctx context.Context, id string) error
	ListStudyPrograms(ctx context.Context, params ListParams) (*PageResult[model.StudyProgram], error)
	ListStudyProgramsByFaculty(ctx context.Context, facultyID string) ([]model.StudyProgram, error)
	GetAvailableQuota(ctx context.Context, programID string, academicYear string) (int, error)

	// Applicant Document Operations
	CreateApplicantDocument(ctx context.Context, document *model.ApplicantDocument) error
	GetApplicantDocumentByID(ctx context.Context, id string) (*model.ApplicantDocument, error)
	UpdateApplicantDocument(ctx context.Context, document *model.ApplicantDocument) error
	UpdateDocumentVerificationStatus(ctx context.Context, id string, status model.DocumentStatus, verifiedBy string) error
	DeleteApplicantDocument(ctx context.Context, id string) error
	ListApplicantDocuments(ctx context.Context, params ListParams) (*PageResult[model.ApplicantDocument], error)
	ListDocumentsByApplicant(ctx context.Context, applicantID string) ([]model.ApplicantDocument, error)
	ListDocumentsByType(ctx context.Context, applicantID string, documentType string) ([]model.ApplicantDocument, error)

	// Evaluation Operations
	CreateEvaluation(ctx context.Context, evaluation *model.Evaluation) error
	GetEvaluationByID(ctx context.Context, id string) (*model.Evaluation, error)
	UpdateEvaluation(ctx context.Context, evaluation *model.Evaluation) error
	DeleteEvaluation(ctx context.Context, id string) error
	ListEvaluations(ctx context.Context, params ListParams) (*PageResult[model.Evaluation], error)
	ListEvaluationsByApplication(ctx context.Context, applicationID string) ([]model.Evaluation, error)
	GetAverageScore(ctx context.Context, applicationID string) (float64, error)

	// Final Result Operations
	CreateFinalResult(ctx context.Context, result *model.FinalResult) error
	GetFinalResultByID(ctx context.Context, id string) (*model.FinalResult, error)
	GetFinalResultByApplication(ctx context.Context, applicationID string) (*model.FinalResult, error)
	UpdateFinalResult(ctx context.Context, result *model.FinalResult) error
	DeleteFinalResult(ctx context.Context, id string) error
	ListFinalResults(ctx context.Context, params ListParams) (*PageResult[model.FinalResult], error)
	ListPassedApplicants(ctx context.Context, academicYear string, programID *string) ([]model.FinalResult, error)

	// Re-Registration Operations
	CreateReRegistration(ctx context.Context, reReg *model.ReRegistration) error
	GetReRegistrationByID(ctx context.Context, id string) (*model.ReRegistration, error)
	GetReRegistrationByApplication(ctx context.Context, applicationID string) (*model.ReRegistration, error)
	UpdateReRegistration(ctx context.Context, reReg *model.ReRegistration) error
	UpdatePaymentStatus(ctx context.Context, id string, status model.PaymentStatus, proofPath string) error
	DeleteReRegistration(ctx context.Context, id string) error
	ListReRegistrations(ctx context.Context, params ListParams) (*PageResult[model.ReRegistration], error)
	ListPendingPayments(ctx context.Context, academicYear string) ([]model.ReRegistration, error)

	// Analytics & Reports
	GetApplicationStatsByAcademicYear(ctx context.Context, academicYear string) (map[string]interface{}, error)
	GetApplicationStatsByProgram(ctx context.Context, programID string, academicYear string) (map[string]interface{}, error)
}
