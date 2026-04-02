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

func (h *LearningHandler) EnrollCourse(w http.ResponseWriter, r *http.Request) {
	var req model.EnrollCourseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid body", nil)
		return
	}
	authCtx := middleware.MustGetAuthContext(r.Context())
	result, err := h.enrollmentSvc.EnrollCourse(r.Context(), authCtx, req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.Created(w, r, result)
}

func (h *LearningHandler) UpdateLessonProgress(w http.ResponseWriter, r *http.Request) {
	lessonID := chi.URLParam(r, "lesson_id")
	var req model.UpdateLessonProgressRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid body", nil)
		return
	}
	authCtx := middleware.MustGetAuthContext(r.Context())
	result, err := h.enrollmentSvc.UpdateLessonProgress(r.Context(), authCtx, lessonID, req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, result)
}

func (h *LearningHandler) ListMyEnrollments(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	lp := repository.ListParams{Search: q.Get("search"), Filters: map[string]any{}, Sort: parseSorts(q.Get("sort")), Page: atoiDefault(q.Get("page"), 1), PageSize: atoiDefault(q.Get("page_size"), 20)}
	if status := q.Get("status"); status != "" {
		lp.Filters["status"] = status
	}
	authCtx := middleware.MustGetAuthContext(r.Context())
	result, err := h.enrollmentSvc.ListMyEnrollments(r.Context(), authCtx, lp)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, result)
}
