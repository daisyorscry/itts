package repository

import (
	"context"
	"time"

	"be-itts-community/internal/db"
	"be-itts-community/internal/model"
)

type pmbRepository struct {
	db db.Connection
}

// NewPMBRepository creates a new PMB repository
func NewPMBRepository(conn db.Connection) PMBRepository {
	return &pmbRepository{db: conn}
}

// RunInTransaction executes a function within a transaction
func (r *pmbRepository) RunInTransaction(ctx context.Context, fn func(txCtx context.Context) error) error {
	return r.db.Run(ctx, fn)
}

/*
|--------------------------------------------------------------------------
| Applicant Operations
|--------------------------------------------------------------------------
*/

func (r *pmbRepository) CreateApplicant(ctx context.Context, applicant *model.Applicant) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "applicants", "INSERT")()
	}
	return r.db.Get(ctx).Create(applicant).Error
}

func (r *pmbRepository) GetApplicantByID(ctx context.Context, id string) (*model.Applicant, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "applicants", "SELECT")()
	}
	var applicant model.Applicant
	err := r.db.Get(ctx).
		Preload("Applications").
		Preload("Documents").
		Where("id = ?", id).
		First(&applicant).Error
	if err != nil {
		return nil, err
	}
	return &applicant, nil
}

func (r *pmbRepository) GetApplicantByUserID(ctx context.Context, userID string) (*model.Applicant, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "applicants", "SELECT")()
	}
	var applicant model.Applicant
	err := r.db.Get(ctx).
		Preload("Applications").
		Preload("Documents").
		Where("user_id = ?", userID).
		First(&applicant).Error
	if err != nil {
		return nil, err
	}
	return &applicant, nil
}

func (r *pmbRepository) GetApplicantByNationalID(ctx context.Context, nationalID string) (*model.Applicant, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "applicants", "SELECT")()
	}
	var applicant model.Applicant
	err := r.db.Get(ctx).
		Where("national_id = ?", nationalID).
		First(&applicant).Error
	if err != nil {
		return nil, err
	}
	return &applicant, nil
}

func (r *pmbRepository) UpdateApplicant(ctx context.Context, applicant *model.Applicant) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "applicants", "UPDATE")()
	}
	return r.db.Get(ctx).Save(applicant).Error
}

func (r *pmbRepository) DeleteApplicant(ctx context.Context, id string) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "applicants", "DELETE")()
	}
	return r.db.Get(ctx).Where("id = ?", id).Delete(&model.Applicant{}).Error
}

func (r *pmbRepository) ListApplicants(ctx context.Context, params ListParams) (*PageResult[model.Applicant], error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "applicants", "SELECT")()
	}

	searchable := []string{"full_name", "national_id", "phone_number", "school_origin"}
	sorts := map[string]string{
		"id":              "id",
		"full_name":       "full_name",
		"national_id":     "national_id",
		"graduation_year": "graduation_year",
		"created_at":      "created_at",
		"updated_at":      "updated_at",
	}

	base := r.db.Get(ctx).Model(&model.Applicant{})
	q, err := ApplyListQuery(base, &params, searchable, sorts)
	if err != nil {
		return nil, err
	}

	var rows []model.Applicant
	return Paginate[model.Applicant](ctx, q, &params, &rows)
}

/*
|--------------------------------------------------------------------------
| Application Operations
|--------------------------------------------------------------------------
*/

func (r *pmbRepository) CreateApplication(ctx context.Context, application *model.Application) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "applications", "INSERT")()
	}
	return r.db.Get(ctx).Create(application).Error
}

func (r *pmbRepository) GetApplicationByID(ctx context.Context, id string) (*model.Application, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "applications", "SELECT")()
	}
	var application model.Application
	err := r.db.Get(ctx).
		Preload("Applicant").
		Preload("Track").
		Preload("Program").
		Where("id = ?", id).
		First(&application).Error
	if err != nil {
		return nil, err
	}
	return &application, nil
}

func (r *pmbRepository) GetApplicationByNumber(ctx context.Context, applicationNumber string) (*model.Application, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "applications", "SELECT")()
	}
	var application model.Application
	err := r.db.Get(ctx).
		Preload("Applicant").
		Preload("Track").
		Preload("Program").
		Where("application_number = ?", applicationNumber).
		First(&application).Error
	if err != nil {
		return nil, err
	}
	return &application, nil
}

func (r *pmbRepository) GetApplicationWithDetails(ctx context.Context, id string) (*model.Application, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "applications", "SELECT")()
	}
	var application model.Application
	err := r.db.Get(ctx).
		Preload("Applicant").
		Preload("Applicant.Documents").
		Preload("Track").
		Preload("Program").
		Preload("Program.Faculty").
		Preload("Evaluations").
		Preload("FinalResult").
		Preload("ReRegistration").
		Where("id = ?", id).
		First(&application).Error
	if err != nil {
		return nil, err
	}
	return &application, nil
}

func (r *pmbRepository) UpdateApplication(ctx context.Context, application *model.Application) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "applications", "UPDATE")()
	}
	return r.db.Get(ctx).Save(application).Error
}

func (r *pmbRepository) UpdateApplicationStatus(ctx context.Context, id string, status model.ApplicationStatus) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "applications", "UPDATE")()
	}
	return r.db.Get(ctx).Model(&model.Application{}).
		Where("id = ?", id).
		Update("status", status).Error
}

func (r *pmbRepository) DeleteApplication(ctx context.Context, id string) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "applications", "DELETE")()
	}
	return r.db.Get(ctx).Where("id = ?", id).Delete(&model.Application{}).Error
}

func (r *pmbRepository) ListApplications(ctx context.Context, params ListParams) (*PageResult[model.Application], error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "applications", "SELECT")()
	}

	searchable := []string{"application_number", "academic_year"}
	sorts := map[string]string{
		"id":                 "id",
		"application_number": "application_number",
		"academic_year":      "academic_year",
		"status":             "status",
		"created_at":         "created_at",
		"updated_at":         "updated_at",
	}

	base := r.db.Get(ctx).Model(&model.Application{}).
		Preload("Applicant").
		Preload("Track").
		Preload("Program")

	q, err := ApplyListQuery(base, &params, searchable, sorts)
	if err != nil {
		return nil, err
	}

	var rows []model.Application
	return Paginate[model.Application](ctx, q, &params, &rows)
}

func (r *pmbRepository) ListApplicationsByApplicant(ctx context.Context, applicantID string, params ListParams) (*PageResult[model.Application], error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "applications", "SELECT")()
	}

	searchable := []string{"application_number", "academic_year"}
	sorts := map[string]string{
		"id":                 "id",
		"application_number": "application_number",
		"academic_year":      "academic_year",
		"status":             "status",
		"created_at":         "created_at",
	}

	base := r.db.Get(ctx).Model(&model.Application{}).
		Where("applicant_id = ?", applicantID).
		Preload("Track").
		Preload("Program")

	q, err := ApplyListQuery(base, &params, searchable, sorts)
	if err != nil {
		return nil, err
	}

	var rows []model.Application
	return Paginate[model.Application](ctx, q, &params, &rows)
}

func (r *pmbRepository) ListApplicationsByTrack(ctx context.Context, trackID string, params ListParams) (*PageResult[model.Application], error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "applications", "SELECT")()
	}

	searchable := []string{"application_number", "academic_year"}
	sorts := map[string]string{
		"id":                 "id",
		"application_number": "application_number",
		"academic_year":      "academic_year",
		"status":             "status",
		"created_at":         "created_at",
	}

	base := r.db.Get(ctx).Model(&model.Application{}).
		Where("track_id = ?", trackID).
		Preload("Applicant").
		Preload("Program")

	q, err := ApplyListQuery(base, &params, searchable, sorts)
	if err != nil {
		return nil, err
	}

	var rows []model.Application
	return Paginate[model.Application](ctx, q, &params, &rows)
}

func (r *pmbRepository) ListApplicationsByProgram(ctx context.Context, programID string, params ListParams) (*PageResult[model.Application], error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "applications", "SELECT")()
	}

	searchable := []string{"application_number", "academic_year"}
	sorts := map[string]string{
		"id":                 "id",
		"application_number": "application_number",
		"academic_year":      "academic_year",
		"status":             "status",
		"created_at":         "created_at",
	}

	base := r.db.Get(ctx).Model(&model.Application{}).
		Where("program_id = ?", programID).
		Preload("Applicant").
		Preload("Track")

	q, err := ApplyListQuery(base, &params, searchable, sorts)
	if err != nil {
		return nil, err
	}

	var rows []model.Application
	return Paginate[model.Application](ctx, q, &params, &rows)
}

func (r *pmbRepository) CountApplicationsByStatus(ctx context.Context, academicYear string, status model.ApplicationStatus) (int64, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "applications", "COUNT")()
	}
	var count int64
	err := r.db.Get(ctx).Model(&model.Application{}).
		Where("academic_year = ? AND status = ?", academicYear, status).
		Count(&count).Error
	return count, err
}

/*
|--------------------------------------------------------------------------
| Admission Track Operations
|--------------------------------------------------------------------------
*/

func (r *pmbRepository) CreateAdmissionTrack(ctx context.Context, track *model.AdmissionTrack) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "admission_tracks", "INSERT")()
	}
	return r.db.Get(ctx).Create(track).Error
}

func (r *pmbRepository) GetAdmissionTrackByID(ctx context.Context, id string) (*model.AdmissionTrack, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "admission_tracks", "SELECT")()
	}
	var track model.AdmissionTrack
	err := r.db.Get(ctx).Where("id = ?", id).First(&track).Error
	if err != nil {
		return nil, err
	}
	return &track, nil
}

func (r *pmbRepository) GetAdmissionTrackByCode(ctx context.Context, code string) (*model.AdmissionTrack, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "admission_tracks", "SELECT")()
	}
	var track model.AdmissionTrack
	err := r.db.Get(ctx).Where("track_code = ?", code).First(&track).Error
	if err != nil {
		return nil, err
	}
	return &track, nil
}

func (r *pmbRepository) UpdateAdmissionTrack(ctx context.Context, track *model.AdmissionTrack) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "admission_tracks", "UPDATE")()
	}
	return r.db.Get(ctx).Save(track).Error
}

func (r *pmbRepository) DeleteAdmissionTrack(ctx context.Context, id string) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "admission_tracks", "DELETE")()
	}
	return r.db.Get(ctx).Where("id = ?", id).Delete(&model.AdmissionTrack{}).Error
}

func (r *pmbRepository) ListAdmissionTracks(ctx context.Context, params ListParams) (*PageResult[model.AdmissionTrack], error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "admission_tracks", "SELECT")()
	}

	searchable := []string{"track_code", "track_name"}
	sorts := map[string]string{
		"id":         "id",
		"track_code": "track_code",
		"track_name": "track_name",
		"created_at": "created_at",
	}

	base := r.db.Get(ctx).Model(&model.AdmissionTrack{})
	q, err := ApplyListQuery(base, &params, searchable, sorts)
	if err != nil {
		return nil, err
	}

	var rows []model.AdmissionTrack
	return Paginate[model.AdmissionTrack](ctx, q, &params, &rows)
}

func (r *pmbRepository) ListActiveAdmissionTracks(ctx context.Context) ([]model.AdmissionTrack, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "admission_tracks", "SELECT")()
	}
	var tracks []model.AdmissionTrack
	err := r.db.Get(ctx).
		Where("is_active = ?", true).
		Order("track_name ASC").
		Find(&tracks).Error
	return tracks, err
}

/*
|--------------------------------------------------------------------------
| Faculty Operations
|--------------------------------------------------------------------------
*/

func (r *pmbRepository) CreateFaculty(ctx context.Context, faculty *model.Faculty) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "faculties", "INSERT")()
	}
	return r.db.Get(ctx).Create(faculty).Error
}

func (r *pmbRepository) GetFacultyByID(ctx context.Context, id string) (*model.Faculty, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "faculties", "SELECT")()
	}
	var faculty model.Faculty
	err := r.db.Get(ctx).Where("id = ?", id).First(&faculty).Error
	if err != nil {
		return nil, err
	}
	return &faculty, nil
}

func (r *pmbRepository) GetFacultyByCode(ctx context.Context, code string) (*model.Faculty, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "faculties", "SELECT")()
	}
	var faculty model.Faculty
	err := r.db.Get(ctx).Where("code = ?", code).First(&faculty).Error
	if err != nil {
		return nil, err
	}
	return &faculty, nil
}

func (r *pmbRepository) GetFacultyWithPrograms(ctx context.Context, id string) (*model.Faculty, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "faculties", "SELECT")()
	}
	var faculty model.Faculty
	err := r.db.Get(ctx).
		Preload("StudyPrograms").
		Where("id = ?", id).
		First(&faculty).Error
	if err != nil {
		return nil, err
	}
	return &faculty, nil
}

func (r *pmbRepository) UpdateFaculty(ctx context.Context, faculty *model.Faculty) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "faculties", "UPDATE")()
	}
	return r.db.Get(ctx).Save(faculty).Error
}

func (r *pmbRepository) DeleteFaculty(ctx context.Context, id string) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "faculties", "DELETE")()
	}
	return r.db.Get(ctx).Where("id = ?", id).Delete(&model.Faculty{}).Error
}

func (r *pmbRepository) ListFaculties(ctx context.Context, params ListParams) (*PageResult[model.Faculty], error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "faculties", "SELECT")()
	}

	searchable := []string{"code", "name"}
	sorts := map[string]string{
		"id":         "id",
		"code":       "code",
		"name":       "name",
		"created_at": "created_at",
	}

	base := r.db.Get(ctx).Model(&model.Faculty{})
	q, err := ApplyListQuery(base, &params, searchable, sorts)
	if err != nil {
		return nil, err
	}

	var rows []model.Faculty
	return Paginate[model.Faculty](ctx, q, &params, &rows)
}

/*
|--------------------------------------------------------------------------
| Study Program Operations
|--------------------------------------------------------------------------
*/

func (r *pmbRepository) CreateStudyProgram(ctx context.Context, program *model.StudyProgram) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "study_programs", "INSERT")()
	}
	return r.db.Get(ctx).Create(program).Error
}

func (r *pmbRepository) GetStudyProgramByID(ctx context.Context, id string) (*model.StudyProgram, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "study_programs", "SELECT")()
	}
	var program model.StudyProgram
	err := r.db.Get(ctx).Where("id = ?", id).First(&program).Error
	if err != nil {
		return nil, err
	}
	return &program, nil
}

func (r *pmbRepository) GetStudyProgramByCode(ctx context.Context, code string) (*model.StudyProgram, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "study_programs", "SELECT")()
	}
	var program model.StudyProgram
	err := r.db.Get(ctx).Where("code = ?", code).First(&program).Error
	if err != nil {
		return nil, err
	}
	return &program, nil
}

func (r *pmbRepository) GetStudyProgramWithFaculty(ctx context.Context, id string) (*model.StudyProgram, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "study_programs", "SELECT")()
	}
	var program model.StudyProgram
	err := r.db.Get(ctx).
		Preload("Faculty").
		Where("id = ?", id).
		First(&program).Error
	if err != nil {
		return nil, err
	}
	return &program, nil
}

func (r *pmbRepository) UpdateStudyProgram(ctx context.Context, program *model.StudyProgram) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "study_programs", "UPDATE")()
	}
	return r.db.Get(ctx).Save(program).Error
}

func (r *pmbRepository) DeleteStudyProgram(ctx context.Context, id string) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "study_programs", "DELETE")()
	}
	return r.db.Get(ctx).Where("id = ?", id).Delete(&model.StudyProgram{}).Error
}

func (r *pmbRepository) ListStudyPrograms(ctx context.Context, params ListParams) (*PageResult[model.StudyProgram], error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "study_programs", "SELECT")()
	}

	searchable := []string{"code", "name"}
	sorts := map[string]string{
		"id":           "id",
		"code":         "code",
		"name":         "name",
		"degree_level": "degree_level",
		"created_at":   "created_at",
	}

	base := r.db.Get(ctx).Model(&model.StudyProgram{}).Preload("Faculty")
	q, err := ApplyListQuery(base, &params, searchable, sorts)
	if err != nil {
		return nil, err
	}

	var rows []model.StudyProgram
	return Paginate[model.StudyProgram](ctx, q, &params, &rows)
}

func (r *pmbRepository) ListStudyProgramsByFaculty(ctx context.Context, facultyID string) ([]model.StudyProgram, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "study_programs", "SELECT")()
	}
	var programs []model.StudyProgram
	err := r.db.Get(ctx).
		Where("faculty_id = ?", facultyID).
		Order("name ASC").
		Find(&programs).Error
	return programs, err
}

func (r *pmbRepository) GetAvailableQuota(ctx context.Context, programID string, academicYear string) (int, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "study_programs", "SELECT")()
	}

	// Get program quota
	var program model.StudyProgram
	if err := r.db.Get(ctx).Where("id = ?", programID).First(&program).Error; err != nil {
		return 0, err
	}

	// Count accepted applications
	var acceptedCount int64
	err := r.db.Get(ctx).Model(&model.Application{}).
		Where("program_id = ? AND academic_year = ? AND status IN ?",
			programID, academicYear,
			[]model.ApplicationStatus{model.AppPassed, model.AppReRegistered}).
		Count(&acceptedCount).Error

	if err != nil {
		return 0, err
	}

	availableQuota := program.Quota - int(acceptedCount)
	if availableQuota < 0 {
		availableQuota = 0
	}

	return availableQuota, nil
}

/*
|--------------------------------------------------------------------------
| Applicant Document Operations
|--------------------------------------------------------------------------
*/

func (r *pmbRepository) CreateApplicantDocument(ctx context.Context, document *model.ApplicantDocument) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "applicant_documents", "INSERT")()
	}
	return r.db.Get(ctx).Create(document).Error
}

func (r *pmbRepository) GetApplicantDocumentByID(ctx context.Context, id string) (*model.ApplicantDocument, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "applicant_documents", "SELECT")()
	}
	var document model.ApplicantDocument
	err := r.db.Get(ctx).Where("id = ?", id).First(&document).Error
	if err != nil {
		return nil, err
	}
	return &document, nil
}

func (r *pmbRepository) UpdateApplicantDocument(ctx context.Context, document *model.ApplicantDocument) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "applicant_documents", "UPDATE")()
	}
	return r.db.Get(ctx).Save(document).Error
}

func (r *pmbRepository) UpdateDocumentVerificationStatus(ctx context.Context, id string, status model.DocumentStatus, verifiedBy string) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "applicant_documents", "UPDATE")()
	}
	now := time.Now()
	return r.db.Get(ctx).Model(&model.ApplicantDocument{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"verification_status": status,
			"verified_by":         verifiedBy,
			"verified_at":         now,
		}).Error
}

func (r *pmbRepository) DeleteApplicantDocument(ctx context.Context, id string) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "applicant_documents", "DELETE")()
	}
	return r.db.Get(ctx).Where("id = ?", id).Delete(&model.ApplicantDocument{}).Error
}

func (r *pmbRepository) ListApplicantDocuments(ctx context.Context, params ListParams) (*PageResult[model.ApplicantDocument], error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "applicant_documents", "SELECT")()
	}

	searchable := []string{"document_type"}
	sorts := map[string]string{
		"id":            "id",
		"document_type": "document_type",
		"created_at":    "created_at",
	}

	base := r.db.Get(ctx).Model(&model.ApplicantDocument{}).Preload("Applicant")
	q, err := ApplyListQuery(base, &params, searchable, sorts)
	if err != nil {
		return nil, err
	}

	var rows []model.ApplicantDocument
	return Paginate[model.ApplicantDocument](ctx, q, &params, &rows)
}

func (r *pmbRepository) ListDocumentsByApplicant(ctx context.Context, applicantID string) ([]model.ApplicantDocument, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "applicant_documents", "SELECT")()
	}
	var documents []model.ApplicantDocument
	err := r.db.Get(ctx).
		Where("applicant_id = ?", applicantID).
		Order("created_at DESC").
		Find(&documents).Error
	return documents, err
}

func (r *pmbRepository) ListDocumentsByType(ctx context.Context, applicantID string, documentType string) ([]model.ApplicantDocument, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "applicant_documents", "SELECT")()
	}
	var documents []model.ApplicantDocument
	err := r.db.Get(ctx).
		Where("applicant_id = ? AND document_type = ?", applicantID, documentType).
		Order("created_at DESC").
		Find(&documents).Error
	return documents, err
}

/*
|--------------------------------------------------------------------------
| Evaluation Operations
|--------------------------------------------------------------------------
*/

func (r *pmbRepository) CreateEvaluation(ctx context.Context, evaluation *model.Evaluation) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "evaluations", "INSERT")()
	}
	return r.db.Get(ctx).Create(evaluation).Error
}

func (r *pmbRepository) GetEvaluationByID(ctx context.Context, id string) (*model.Evaluation, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "evaluations", "SELECT")()
	}
	var evaluation model.Evaluation
	err := r.db.Get(ctx).Where("id = ?", id).First(&evaluation).Error
	if err != nil {
		return nil, err
	}
	return &evaluation, nil
}

func (r *pmbRepository) UpdateEvaluation(ctx context.Context, evaluation *model.Evaluation) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "evaluations", "UPDATE")()
	}
	return r.db.Get(ctx).Save(evaluation).Error
}

func (r *pmbRepository) DeleteEvaluation(ctx context.Context, id string) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "evaluations", "DELETE")()
	}
	return r.db.Get(ctx).Where("id = ?", id).Delete(&model.Evaluation{}).Error
}

func (r *pmbRepository) ListEvaluations(ctx context.Context, params ListParams) (*PageResult[model.Evaluation], error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "evaluations", "SELECT")()
	}

	searchable := []string{}
	sorts := map[string]string{
		"id":              "id",
		"evaluation_type": "evaluation_type",
		"score":           "score",
		"created_at":      "created_at",
	}

	base := r.db.Get(ctx).Model(&model.Evaluation{}).Preload("Application")
	q, err := ApplyListQuery(base, &params, searchable, sorts)
	if err != nil {
		return nil, err
	}

	var rows []model.Evaluation
	return Paginate[model.Evaluation](ctx, q, &params, &rows)
}

func (r *pmbRepository) ListEvaluationsByApplication(ctx context.Context, applicationID string) ([]model.Evaluation, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "evaluations", "SELECT")()
	}
	var evaluations []model.Evaluation
	err := r.db.Get(ctx).
		Where("application_id = ?", applicationID).
		Order("created_at ASC").
		Find(&evaluations).Error
	return evaluations, err
}

func (r *pmbRepository) GetAverageScore(ctx context.Context, applicationID string) (float64, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "evaluations", "SELECT")()
	}
	var result struct {
		AvgScore *float64
	}
	err := r.db.Get(ctx).Model(&model.Evaluation{}).
		Select("AVG(score) as avg_score").
		Where("application_id = ? AND score IS NOT NULL", applicationID).
		Scan(&result).Error

	if err != nil {
		return 0, err
	}

	if result.AvgScore == nil {
		return 0, nil
	}

	return *result.AvgScore, nil
}

/*
|--------------------------------------------------------------------------
| Final Result Operations
|--------------------------------------------------------------------------
*/

func (r *pmbRepository) CreateFinalResult(ctx context.Context, result *model.FinalResult) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "final_results", "INSERT")()
	}
	return r.db.Get(ctx).Create(result).Error
}

func (r *pmbRepository) GetFinalResultByID(ctx context.Context, id string) (*model.FinalResult, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "final_results", "SELECT")()
	}
	var result model.FinalResult
	err := r.db.Get(ctx).
		Preload("Application").
		Preload("Application.Applicant").
		Preload("Application.Program").
		Where("id = ?", id).
		First(&result).Error
	if err != nil {
		return nil, err
	}
	return &result, nil
}

func (r *pmbRepository) GetFinalResultByApplication(ctx context.Context, applicationID string) (*model.FinalResult, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "final_results", "SELECT")()
	}
	var result model.FinalResult
	err := r.db.Get(ctx).
		Where("application_id = ?", applicationID).
		First(&result).Error
	if err != nil {
		return nil, err
	}
	return &result, nil
}

func (r *pmbRepository) UpdateFinalResult(ctx context.Context, result *model.FinalResult) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "final_results", "UPDATE")()
	}
	return r.db.Get(ctx).Save(result).Error
}

func (r *pmbRepository) DeleteFinalResult(ctx context.Context, id string) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "final_results", "DELETE")()
	}
	return r.db.Get(ctx).Where("id = ?", id).Delete(&model.FinalResult{}).Error
}

func (r *pmbRepository) ListFinalResults(ctx context.Context, params ListParams) (*PageResult[model.FinalResult], error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "final_results", "SELECT")()
	}

	searchable := []string{}
	sorts := map[string]string{
		"id":            "id",
		"result_status": "result_status",
		"final_score":   "final_score",
		"decision_date": "decision_date",
	}

	base := r.db.Get(ctx).Model(&model.FinalResult{}).
		Preload("Application").
		Preload("Application.Applicant").
		Preload("Application.Program")

	q, err := ApplyListQuery(base, &params, searchable, sorts)
	if err != nil {
		return nil, err
	}

	var rows []model.FinalResult
	return Paginate[model.FinalResult](ctx, q, &params, &rows)
}

func (r *pmbRepository) ListPassedApplicants(ctx context.Context, academicYear string, programID *string) ([]model.FinalResult, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "final_results", "SELECT")()
	}

	query := r.db.Get(ctx).
		Preload("Application").
		Preload("Application.Applicant").
		Preload("Application.Program").
		Joins("JOIN applications ON applications.id = final_results.application_id").
		Where("applications.academic_year = ? AND final_results.result_status = ?",
			academicYear, model.ResultPassed)

	if programID != nil {
		query = query.Where("applications.program_id = ?", *programID)
	}

	var results []model.FinalResult
	err := query.Order("final_results.final_score DESC").Find(&results).Error
	return results, err
}

/*
|--------------------------------------------------------------------------
| Re-Registration Operations
|--------------------------------------------------------------------------
*/

func (r *pmbRepository) CreateReRegistration(ctx context.Context, reReg *model.ReRegistration) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "re_registration", "INSERT")()
	}
	return r.db.Get(ctx).Create(reReg).Error
}

func (r *pmbRepository) GetReRegistrationByID(ctx context.Context, id string) (*model.ReRegistration, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "re_registration", "SELECT")()
	}
	var reReg model.ReRegistration
	err := r.db.Get(ctx).
		Preload("Application").
		Preload("Application.Applicant").
		Where("id = ?", id).
		First(&reReg).Error
	if err != nil {
		return nil, err
	}
	return &reReg, nil
}

func (r *pmbRepository) GetReRegistrationByApplication(ctx context.Context, applicationID string) (*model.ReRegistration, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "re_registration", "SELECT")()
	}
	var reReg model.ReRegistration
	err := r.db.Get(ctx).
		Where("application_id = ?", applicationID).
		First(&reReg).Error
	if err != nil {
		return nil, err
	}
	return &reReg, nil
}

func (r *pmbRepository) UpdateReRegistration(ctx context.Context, reReg *model.ReRegistration) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "re_registration", "UPDATE")()
	}
	return r.db.Get(ctx).Save(reReg).Error
}

func (r *pmbRepository) UpdatePaymentStatus(ctx context.Context, id string, status model.PaymentStatus, proofPath string) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "re_registration", "UPDATE")()
	}
	return r.db.Get(ctx).Model(&model.ReRegistration{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"payment_status": status,
			"payment_proof":  proofPath,
		}).Error
}

func (r *pmbRepository) DeleteReRegistration(ctx context.Context, id string) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "re_registration", "DELETE")()
	}
	return r.db.Get(ctx).Where("id = ?", id).Delete(&model.ReRegistration{}).Error
}

func (r *pmbRepository) ListReRegistrations(ctx context.Context, params ListParams) (*PageResult[model.ReRegistration], error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "re_registration", "SELECT")()
	}

	searchable := []string{}
	sorts := map[string]string{
		"id":                   "id",
		"re_registration_date": "re_registration_date",
		"payment_status":       "payment_status",
		"created_at":           "created_at",
	}

	base := r.db.Get(ctx).Model(&model.ReRegistration{}).
		Preload("Application").
		Preload("Application.Applicant")

	q, err := ApplyListQuery(base, &params, searchable, sorts)
	if err != nil {
		return nil, err
	}

	var rows []model.ReRegistration
	return Paginate[model.ReRegistration](ctx, q, &params, &rows)
}

func (r *pmbRepository) ListPendingPayments(ctx context.Context, academicYear string) ([]model.ReRegistration, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "re_registration", "SELECT")()
	}

	var reRegs []model.ReRegistration
	err := r.db.Get(ctx).
		Preload("Application").
		Preload("Application.Applicant").
		Joins("JOIN applications ON applications.id = re_registration.application_id").
		Where("applications.academic_year = ? AND re_registration.payment_status = ?",
			academicYear, model.PaymentUnpaid).
		Order("re_registration.re_registration_date ASC").
		Find(&reRegs).Error
	return reRegs, err
}

/*
|--------------------------------------------------------------------------
| Analytics & Reports
|--------------------------------------------------------------------------
*/

func (r *pmbRepository) GetApplicationStatsByAcademicYear(ctx context.Context, academicYear string) (map[string]interface{}, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "applications", "SELECT")()
	}

	stats := make(map[string]interface{})

	// Count by status
	var statusCounts []struct {
		Status model.ApplicationStatus
		Count  int64
	}
	err := r.db.Get(ctx).Model(&model.Application{}).
		Select("status, COUNT(*) as count").
		Where("academic_year = ?", academicYear).
		Group("status").
		Scan(&statusCounts).Error
	if err != nil {
		return nil, err
	}

	statusMap := make(map[string]int64)
	var total int64
	for _, sc := range statusCounts {
		statusMap[string(sc.Status)] = sc.Count
		total += sc.Count
	}
	stats["by_status"] = statusMap
	stats["total"] = total

	// Count by track
	var trackCounts []struct {
		TrackID   string
		TrackName string
		Count     int64
	}
	err = r.db.Get(ctx).Model(&model.Application{}).
		Select("admission_tracks.id as track_id, admission_tracks.track_name, COUNT(*) as count").
		Joins("JOIN admission_tracks ON admission_tracks.id = applications.track_id").
		Where("applications.academic_year = ?", academicYear).
		Group("admission_tracks.id, admission_tracks.track_name").
		Scan(&trackCounts).Error
	if err != nil {
		return nil, err
	}
	stats["by_track"] = trackCounts

	// Count by program
	var programCounts []struct {
		ProgramID   string
		ProgramName string
		Count       int64
	}
	err = r.db.Get(ctx).Model(&model.Application{}).
		Select("study_programs.id as program_id, study_programs.name as program_name, COUNT(*) as count").
		Joins("JOIN study_programs ON study_programs.id = applications.program_id").
		Where("applications.academic_year = ?", academicYear).
		Group("study_programs.id, study_programs.name").
		Scan(&programCounts).Error
	if err != nil {
		return nil, err
	}
	stats["by_program"] = programCounts

	return stats, nil
}

func (r *pmbRepository) GetApplicationStatsByProgram(ctx context.Context, programID string, academicYear string) (map[string]interface{}, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "applications", "SELECT")()
	}

	stats := make(map[string]interface{})

	// Get program info
	var program model.StudyProgram
	if err := r.db.Get(ctx).Preload("Faculty").Where("id = ?", programID).First(&program).Error; err != nil {
		return nil, err
	}
	stats["program"] = program

	// Count by status
	var statusCounts []struct {
		Status model.ApplicationStatus
		Count  int64
	}
	err := r.db.Get(ctx).Model(&model.Application{}).
		Select("status, COUNT(*) as count").
		Where("program_id = ? AND academic_year = ?", programID, academicYear).
		Group("status").
		Scan(&statusCounts).Error
	if err != nil {
		return nil, err
	}

	statusMap := make(map[string]int64)
	var total int64
	for _, sc := range statusCounts {
		statusMap[string(sc.Status)] = sc.Count
		total += sc.Count
	}
	stats["by_status"] = statusMap
	stats["total"] = total

	// Get available quota
	availableQuota, err := r.GetAvailableQuota(ctx, programID, academicYear)
	if err != nil {
		return nil, err
	}
	stats["quota"] = program.Quota
	stats["available_quota"] = availableQuota
	stats["filled_quota"] = program.Quota - availableQuota

	return stats, nil
}
