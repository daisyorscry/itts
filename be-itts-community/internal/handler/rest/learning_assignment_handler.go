package rest

import (
	"encoding/json"
	"net/http"

	"github.com/daisyorscry/itts/core"
	"github.com/go-chi/chi/v5"

	"be-itts-community/internal/middleware"
	"be-itts-community/internal/model"
	"be-itts-community/internal/repository"
)

func (h *LearningHandler) CreateAssignment(w http.ResponseWriter, r *http.Request) {
	lessonID := chi.URLParam(r, "lesson_id")
	var req model.CreateAssignmentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid body", nil)
		return
	}
	req.LessonID = lessonID
	result, err := h.assignmentSvc.CreateAssignment(r.Context(), req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.Created(w, r, result)
}

func (h *LearningHandler) GetAssignment(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	result, err := h.assignmentSvc.GetAssignment(r.Context(), id)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, result)
}

func (h *LearningHandler) UpdateAssignment(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req model.UpdateAssignmentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid body", nil)
		return
	}
	result, err := h.assignmentSvc.UpdateAssignment(r.Context(), id, req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, result)
}

func (h *LearningHandler) DeleteAssignment(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.assignmentSvc.DeleteAssignment(r.Context(), id); err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.NoContent(w, r)
}

func (h *LearningHandler) SubmitAssignment(w http.ResponseWriter, r *http.Request) {
	var req model.SubmitAssignmentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid body", nil)
		return
	}
	authCtx := middleware.MustGetAuthContext(r.Context())
	result, err := h.assignmentSvc.SubmitAssignment(r.Context(), authCtx, req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.Created(w, r, result)
}

func (h *LearningHandler) ReviewAssignmentSubmission(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req model.ReviewAssignmentSubmissionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid body", nil)
		return
	}
	authCtx := middleware.MustGetAuthContext(r.Context())
	result, err := h.assignmentSvc.ReviewAssignmentSubmission(r.Context(), authCtx, id, req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, result)
}

func (h *LearningHandler) ListAssignmentSubmissions(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	lp := repository.ListParams{Search: q.Get("search"), Filters: map[string]any{}, Sort: parseSorts(q.Get("sort")), Page: atoiDefault(q.Get("page"), 1), PageSize: atoiDefault(q.Get("page_size"), 20)}
	assignmentID := chi.URLParam(r, "id")
	result, err := h.assignmentSvc.ListAssignmentSubmissions(r.Context(), assignmentID, lp)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, result)
}

func (h *LearningHandler) ListMyAssignmentSubmissions(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	lp := repository.ListParams{Search: q.Get("search"), Filters: map[string]any{}, Sort: parseSorts(q.Get("sort")), Page: atoiDefault(q.Get("page"), 1), PageSize: atoiDefault(q.Get("page_size"), 20)}
	authCtx := middleware.MustGetAuthContext(r.Context())
	result, err := h.assignmentSvc.ListMyAssignmentSubmissions(r.Context(), authCtx, lp)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, result)
}
