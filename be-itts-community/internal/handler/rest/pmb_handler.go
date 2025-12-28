package rest

import (
	"encoding/json"
	"net/http"

	"github.com/daisyorscry/itts/core"
	"github.com/go-chi/chi/v5"

	"be-itts-community/internal/middleware"
	"be-itts-community/internal/model"
	"be-itts-community/internal/repository"
	"be-itts-community/internal/service"
)

type PMBHandler struct {
	pmbSvc service.PMBService
}

func NewPMBHandler(pmbSvc service.PMBService) *PMBHandler {
	return &PMBHandler{pmbSvc: pmbSvc}
}

/*
|--------------------------------------------------------------------------
| Applicant Endpoints
|--------------------------------------------------------------------------
*/

// POST /api/v1/admin/pmb/applicants
func (h *PMBHandler) CreateApplicant(w http.ResponseWriter, r *http.Request) {
	var req model.CreateApplicantRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid request body", nil)
		return
	}

	resp, err := h.pmbSvc.CreateApplicant(r.Context(), req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.Created(w, r, resp)
}

// GET /api/v1/admin/pmb/applicants/:id
func (h *PMBHandler) GetApplicant(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	resp, err := h.pmbSvc.GetApplicant(r.Context(), id)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, resp)
}

// GET /api/v1/pmb/me/applicant (get by current user)
func (h *PMBHandler) GetMyApplicant(w http.ResponseWriter, r *http.Request) {
	authCtx := middleware.MustGetAuthContext(r.Context())

	resp, err := h.pmbSvc.GetApplicantByUserID(r.Context(), authCtx.UserID)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, resp)
}

// PATCH /api/v1/admin/pmb/applicants/:id
func (h *PMBHandler) UpdateApplicant(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	var req model.UpdateApplicantRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid request body", nil)
		return
	}

	resp, err := h.pmbSvc.UpdateApplicant(r.Context(), id, req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, resp)
}

// DELETE /api/v1/admin/pmb/applicants/:id
func (h *PMBHandler) DeleteApplicant(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	if err := h.pmbSvc.DeleteApplicant(r.Context(), id); err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.NoContent(w, r)
}

// GET /api/v1/admin/pmb/applicants
func (h *PMBHandler) ListApplicants(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	params := repository.ListParams{
		Search:   q.Get("search"),
		Filters:  map[string]any{},
		Sort:     parseSorts(q.Get("sort")),
		Page:     atoiDefault(q.Get("page"), 1),
		PageSize: atoiDefault(q.Get("page_size"), 20),
	}

	if v := q.Get("gender"); v != "" {
		params.Filters["gender"] = v
	}
	if v := q.Get("graduation_year"); v != "" {
		params.Filters["graduation_year"] = v
	}

	resp, err := h.pmbSvc.ListApplicants(r.Context(), params)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, resp)
}

/*
|--------------------------------------------------------------------------
| Application Endpoints
|--------------------------------------------------------------------------
*/

// POST /api/v1/pmb/applications
func (h *PMBHandler) CreateApplication(w http.ResponseWriter, r *http.Request) {
	var req model.CreateApplicationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid request body", nil)
		return
	}

	resp, err := h.pmbSvc.CreateApplication(r.Context(), req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.Created(w, r, resp)
}

// GET /api/v1/admin/pmb/applications/:id
func (h *PMBHandler) GetApplication(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	resp, err := h.pmbSvc.GetApplication(r.Context(), id)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, resp)
}

// GET /api/v1/admin/pmb/applications/:id/details
func (h *PMBHandler) GetApplicationDetails(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	resp, err := h.pmbSvc.GetApplicationWithDetails(r.Context(), id)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, resp)
}

// GET /api/v1/admin/pmb/applications/number/:number
func (h *PMBHandler) GetApplicationByNumber(w http.ResponseWriter, r *http.Request) {
	number := chi.URLParam(r, "number")

	resp, err := h.pmbSvc.GetApplicationByNumber(r.Context(), number)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, resp)
}

// PATCH /api/v1/admin/pmb/applications/:id
func (h *PMBHandler) UpdateApplication(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	var req model.UpdateApplicationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid request body", nil)
		return
	}

	resp, err := h.pmbSvc.UpdateApplication(r.Context(), id, req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, resp)
}

// PATCH /api/v1/admin/pmb/applications/:id/status
func (h *PMBHandler) UpdateApplicationStatus(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	var req model.UpdateApplicationStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid request body", nil)
		return
	}

	resp, err := h.pmbSvc.UpdateApplicationStatus(r.Context(), id, req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, resp)
}

// DELETE /api/v1/admin/pmb/applications/:id
func (h *PMBHandler) DeleteApplication(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	if err := h.pmbSvc.DeleteApplication(r.Context(), id); err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.NoContent(w, r)
}

// GET /api/v1/admin/pmb/applications
func (h *PMBHandler) ListApplications(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	params := repository.ListParams{
		Search:   q.Get("search"),
		Filters:  map[string]any{},
		Sort:     parseSorts(q.Get("sort")),
		Page:     atoiDefault(q.Get("page"), 1),
		PageSize: atoiDefault(q.Get("page_size"), 20),
	}

	if v := q.Get("status"); v != "" {
		params.Filters["status"] = v
	}
	if v := q.Get("academic_year"); v != "" {
		params.Filters["academic_year"] = v
	}
	if v := q.Get("track_id"); v != "" {
		params.Filters["track_id"] = v
	}
	if v := q.Get("program_id"); v != "" {
		params.Filters["program_id"] = v
	}

	resp, err := h.pmbSvc.ListApplications(r.Context(), params)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, resp)
}

// GET /api/v1/pmb/applicants/:applicant_id/applications
func (h *PMBHandler) ListApplicationsByApplicant(w http.ResponseWriter, r *http.Request) {
	applicantID := chi.URLParam(r, "applicant_id")
	q := r.URL.Query()

	params := repository.ListParams{
		Search:   q.Get("search"),
		Sort:     parseSorts(q.Get("sort")),
		Page:     atoiDefault(q.Get("page"), 1),
		PageSize: atoiDefault(q.Get("page_size"), 20),
	}

	resp, err := h.pmbSvc.ListApplicationsByApplicant(r.Context(), applicantID, params)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, resp)
}

/*
|--------------------------------------------------------------------------
| Admission Track Endpoints
|--------------------------------------------------------------------------
*/

// POST /api/v1/admin/pmb/tracks
func (h *PMBHandler) CreateAdmissionTrack(w http.ResponseWriter, r *http.Request) {
	var req model.CreateAdmissionTrackRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid request body", nil)
		return
	}

	resp, err := h.pmbSvc.CreateAdmissionTrack(r.Context(), req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.Created(w, r, resp)
}

// GET /api/v1/admin/pmb/tracks/:id
func (h *PMBHandler) GetAdmissionTrack(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	resp, err := h.pmbSvc.GetAdmissionTrack(r.Context(), id)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, resp)
}

// PATCH /api/v1/admin/pmb/tracks/:id
func (h *PMBHandler) UpdateAdmissionTrack(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	var req model.UpdateAdmissionTrackRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid request body", nil)
		return
	}

	resp, err := h.pmbSvc.UpdateAdmissionTrack(r.Context(), id, req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, resp)
}

// DELETE /api/v1/admin/pmb/tracks/:id
func (h *PMBHandler) DeleteAdmissionTrack(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	if err := h.pmbSvc.DeleteAdmissionTrack(r.Context(), id); err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.NoContent(w, r)
}

// GET /api/v1/admin/pmb/tracks
func (h *PMBHandler) ListAdmissionTracks(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	params := repository.ListParams{
		Search:   q.Get("search"),
		Filters:  map[string]any{},
		Sort:     parseSorts(q.Get("sort")),
		Page:     atoiDefault(q.Get("page"), 1),
		PageSize: atoiDefault(q.Get("page_size"), 20),
	}

	if v := q.Get("is_active"); v != "" {
		params.Filters["is_active"] = v == "true"
	}

	resp, err := h.pmbSvc.ListAdmissionTracks(r.Context(), params)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, resp)
}

// GET /api/v1/pmb/tracks/active
func (h *PMBHandler) ListActiveAdmissionTracks(w http.ResponseWriter, r *http.Request) {
	resp, err := h.pmbSvc.ListActiveAdmissionTracks(r.Context())
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, resp)
}

/*
|--------------------------------------------------------------------------
| Faculty Endpoints
|--------------------------------------------------------------------------
*/

// POST /api/v1/admin/pmb/faculties
func (h *PMBHandler) CreateFaculty(w http.ResponseWriter, r *http.Request) {
	var req model.CreateFacultyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid request body", nil)
		return
	}

	resp, err := h.pmbSvc.CreateFaculty(r.Context(), req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.Created(w, r, resp)
}

// GET /api/v1/admin/pmb/faculties/:id
func (h *PMBHandler) GetFaculty(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	resp, err := h.pmbSvc.GetFaculty(r.Context(), id)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, resp)
}

// GET /api/v1/admin/pmb/faculties/:id/programs
func (h *PMBHandler) GetFacultyWithPrograms(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	resp, err := h.pmbSvc.GetFacultyWithPrograms(r.Context(), id)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, resp)
}

// PATCH /api/v1/admin/pmb/faculties/:id
func (h *PMBHandler) UpdateFaculty(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	var req model.UpdateFacultyRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid request body", nil)
		return
	}

	resp, err := h.pmbSvc.UpdateFaculty(r.Context(), id, req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, resp)
}

// DELETE /api/v1/admin/pmb/faculties/:id
func (h *PMBHandler) DeleteFaculty(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	if err := h.pmbSvc.DeleteFaculty(r.Context(), id); err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.NoContent(w, r)
}

// GET /api/v1/admin/pmb/faculties
func (h *PMBHandler) ListFaculties(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	params := repository.ListParams{
		Search:   q.Get("search"),
		Sort:     parseSorts(q.Get("sort")),
		Page:     atoiDefault(q.Get("page"), 1),
		PageSize: atoiDefault(q.Get("page_size"), 20),
	}

	resp, err := h.pmbSvc.ListFaculties(r.Context(), params)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, resp)
}

/*
|--------------------------------------------------------------------------
| Study Program Endpoints
|--------------------------------------------------------------------------
*/

// POST /api/v1/admin/pmb/programs
func (h *PMBHandler) CreateStudyProgram(w http.ResponseWriter, r *http.Request) {
	var req model.CreateStudyProgramRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid request body", nil)
		return
	}

	resp, err := h.pmbSvc.CreateStudyProgram(r.Context(), req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.Created(w, r, resp)
}

// GET /api/v1/admin/pmb/programs/:id
func (h *PMBHandler) GetStudyProgram(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	resp, err := h.pmbSvc.GetStudyProgram(r.Context(), id)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, resp)
}

// PATCH /api/v1/admin/pmb/programs/:id
func (h *PMBHandler) UpdateStudyProgram(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	var req model.UpdateStudyProgramRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid request body", nil)
		return
	}

	resp, err := h.pmbSvc.UpdateStudyProgram(r.Context(), id, req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, resp)
}

// DELETE /api/v1/admin/pmb/programs/:id
func (h *PMBHandler) DeleteStudyProgram(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	if err := h.pmbSvc.DeleteStudyProgram(r.Context(), id); err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.NoContent(w, r)
}

// GET /api/v1/admin/pmb/programs
func (h *PMBHandler) ListStudyPrograms(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	params := repository.ListParams{
		Search:   q.Get("search"),
		Filters:  map[string]any{},
		Sort:     parseSorts(q.Get("sort")),
		Page:     atoiDefault(q.Get("page"), 1),
		PageSize: atoiDefault(q.Get("page_size"), 20),
	}

	if v := q.Get("faculty_id"); v != "" {
		params.Filters["faculty_id"] = v
	}
	if v := q.Get("degree_level"); v != "" {
		params.Filters["degree_level"] = v
	}

	resp, err := h.pmbSvc.ListStudyPrograms(r.Context(), params)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, resp)
}

// GET /api/v1/pmb/faculties/:faculty_id/programs
func (h *PMBHandler) ListStudyProgramsByFaculty(w http.ResponseWriter, r *http.Request) {
	facultyID := chi.URLParam(r, "faculty_id")

	resp, err := h.pmbSvc.ListStudyProgramsByFaculty(r.Context(), facultyID)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, resp)
}

// GET /api/v1/pmb/programs/:program_id/quota
func (h *PMBHandler) GetAvailableQuota(w http.ResponseWriter, r *http.Request) {
	programID := chi.URLParam(r, "program_id")
	academicYear := r.URL.Query().Get("academic_year")

	if academicYear == "" {
		core.WriteError(w, r, http.StatusBadRequest, "MISSING_PARAM", "academic_year is required", nil)
		return
	}

	quota, err := h.pmbSvc.GetAvailableQuota(r.Context(), programID, academicYear)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, map[string]interface{}{
		"program_id":      programID,
		"academic_year":   academicYear,
		"available_quota": quota,
	})
}

/*
|--------------------------------------------------------------------------
| Document Endpoints
|--------------------------------------------------------------------------
*/

// POST /api/v1/pmb/documents
func (h *PMBHandler) CreateApplicantDocument(w http.ResponseWriter, r *http.Request) {
	var req model.CreateApplicantDocumentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid request body", nil)
		return
	}

	resp, err := h.pmbSvc.CreateApplicantDocument(r.Context(), req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.Created(w, r, resp)
}

// GET /api/v1/admin/pmb/documents/:id
func (h *PMBHandler) GetApplicantDocument(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	resp, err := h.pmbSvc.GetApplicantDocument(r.Context(), id)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, resp)
}

// PATCH /api/v1/admin/pmb/documents/:id/verify
func (h *PMBHandler) UpdateDocumentVerification(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	var req model.UpdateDocumentVerificationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid request body", nil)
		return
	}

	resp, err := h.pmbSvc.UpdateDocumentVerification(r.Context(), id, req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, resp)
}

// DELETE /api/v1/pmb/documents/:id
func (h *PMBHandler) DeleteApplicantDocument(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	if err := h.pmbSvc.DeleteApplicantDocument(r.Context(), id); err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.NoContent(w, r)
}

// GET /api/v1/admin/pmb/documents
func (h *PMBHandler) ListApplicantDocuments(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	params := repository.ListParams{
		Search:   q.Get("search"),
		Filters:  map[string]any{},
		Sort:     parseSorts(q.Get("sort")),
		Page:     atoiDefault(q.Get("page"), 1),
		PageSize: atoiDefault(q.Get("page_size"), 20),
	}

	if v := q.Get("applicant_id"); v != "" {
		params.Filters["applicant_id"] = v
	}
	if v := q.Get("document_type"); v != "" {
		params.Filters["document_type"] = v
	}
	if v := q.Get("verification_status"); v != "" {
		params.Filters["verification_status"] = v
	}

	resp, err := h.pmbSvc.ListApplicantDocuments(r.Context(), params)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, resp)
}

// GET /api/v1/pmb/applicants/:applicant_id/documents
func (h *PMBHandler) ListDocumentsByApplicant(w http.ResponseWriter, r *http.Request) {
	applicantID := chi.URLParam(r, "applicant_id")

	resp, err := h.pmbSvc.ListDocumentsByApplicant(r.Context(), applicantID)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, resp)
}

/*
|--------------------------------------------------------------------------
| Evaluation Endpoints
|--------------------------------------------------------------------------
*/

// POST /api/v1/admin/pmb/evaluations
func (h *PMBHandler) CreateEvaluation(w http.ResponseWriter, r *http.Request) {
	var req model.CreateEvaluationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid request body", nil)
		return
	}

	resp, err := h.pmbSvc.CreateEvaluation(r.Context(), req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.Created(w, r, resp)
}

// GET /api/v1/admin/pmb/evaluations/:id
func (h *PMBHandler) GetEvaluation(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	resp, err := h.pmbSvc.GetEvaluation(r.Context(), id)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, resp)
}

// PATCH /api/v1/admin/pmb/evaluations/:id
func (h *PMBHandler) UpdateEvaluation(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	var req model.UpdateEvaluationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid request body", nil)
		return
	}

	resp, err := h.pmbSvc.UpdateEvaluation(r.Context(), id, req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, resp)
}

// DELETE /api/v1/admin/pmb/evaluations/:id
func (h *PMBHandler) DeleteEvaluation(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	if err := h.pmbSvc.DeleteEvaluation(r.Context(), id); err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.NoContent(w, r)
}

// GET /api/v1/admin/pmb/applications/:application_id/evaluations
func (h *PMBHandler) ListEvaluationsByApplication(w http.ResponseWriter, r *http.Request) {
	applicationID := chi.URLParam(r, "application_id")

	resp, err := h.pmbSvc.ListEvaluationsByApplication(r.Context(), applicationID)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, resp)
}

// GET /api/v1/admin/pmb/applications/:application_id/average-score
func (h *PMBHandler) GetAverageScore(w http.ResponseWriter, r *http.Request) {
	applicationID := chi.URLParam(r, "application_id")

	score, err := h.pmbSvc.GetAverageScore(r.Context(), applicationID)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, map[string]interface{}{
		"application_id": applicationID,
		"average_score":  score,
	})
}

/*
|--------------------------------------------------------------------------
| Final Result Endpoints
|--------------------------------------------------------------------------
*/

// POST /api/v1/admin/pmb/final-results
func (h *PMBHandler) CreateFinalResult(w http.ResponseWriter, r *http.Request) {
	var req model.CreateFinalResultRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid request body", nil)
		return
	}

	resp, err := h.pmbSvc.CreateFinalResult(r.Context(), req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.Created(w, r, resp)
}

// GET /api/v1/admin/pmb/final-results/:id
func (h *PMBHandler) GetFinalResult(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	resp, err := h.pmbSvc.GetFinalResult(r.Context(), id)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, resp)
}

// PATCH /api/v1/admin/pmb/final-results/:id
func (h *PMBHandler) UpdateFinalResult(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	var req model.UpdateFinalResultRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid request body", nil)
		return
	}

	resp, err := h.pmbSvc.UpdateFinalResult(r.Context(), id, req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, resp)
}

// GET /api/v1/pmb/results/passed
func (h *PMBHandler) ListPassedApplicants(w http.ResponseWriter, r *http.Request) {
	academicYear := r.URL.Query().Get("academic_year")
	programID := r.URL.Query().Get("program_id")

	if academicYear == "" {
		core.WriteError(w, r, http.StatusBadRequest, "MISSING_PARAM", "academic_year is required", nil)
		return
	}

	var programIDPtr *string
	if programID != "" {
		programIDPtr = &programID
	}

	resp, err := h.pmbSvc.ListPassedApplicants(r.Context(), academicYear, programIDPtr)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, resp)
}

/*
|--------------------------------------------------------------------------
| Re-Registration Endpoints
|--------------------------------------------------------------------------
*/

// POST /api/v1/pmb/re-registration
func (h *PMBHandler) CreateReRegistration(w http.ResponseWriter, r *http.Request) {
	var req model.CreateReRegistrationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid request body", nil)
		return
	}

	resp, err := h.pmbSvc.CreateReRegistration(r.Context(), req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.Created(w, r, resp)
}

// PATCH /api/v1/admin/pmb/re-registration/:id/payment
func (h *PMBHandler) UpdatePaymentStatus(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")

	var req model.UpdatePaymentStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid request body", nil)
		return
	}

	resp, err := h.pmbSvc.UpdatePaymentStatus(r.Context(), id, req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, resp)
}

// GET /api/v1/admin/pmb/re-registration/pending
func (h *PMBHandler) ListPendingPayments(w http.ResponseWriter, r *http.Request) {
	academicYear := r.URL.Query().Get("academic_year")

	if academicYear == "" {
		core.WriteError(w, r, http.StatusBadRequest, "MISSING_PARAM", "academic_year is required", nil)
		return
	}

	resp, err := h.pmbSvc.ListPendingPayments(r.Context(), academicYear)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, resp)
}

/*
|--------------------------------------------------------------------------
| Statistics Endpoints
|--------------------------------------------------------------------------
*/

// GET /api/v1/admin/pmb/stats/academic-year/:year
func (h *PMBHandler) GetApplicationStatsByAcademicYear(w http.ResponseWriter, r *http.Request) {
	academicYear := chi.URLParam(r, "year")

	resp, err := h.pmbSvc.GetApplicationStatsByAcademicYear(r.Context(), academicYear)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, resp)
}

// GET /api/v1/admin/pmb/stats/programs/:program_id
func (h *PMBHandler) GetApplicationStatsByProgram(w http.ResponseWriter, r *http.Request) {
	programID := chi.URLParam(r, "program_id")
	academicYear := r.URL.Query().Get("academic_year")

	if academicYear == "" {
		core.WriteError(w, r, http.StatusBadRequest, "MISSING_PARAM", "academic_year is required", nil)
		return
	}

	resp, err := h.pmbSvc.GetApplicationStatsByProgram(r.Context(), programID, academicYear)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, resp)
}

// Helper functions atoiDefault and parseSorts are defined in registration_handler.go
