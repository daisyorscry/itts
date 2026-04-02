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

func (h *LearningHandler) ListPublicCourses(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	lp := repository.ListParams{Search: q.Get("search"), Filters: map[string]any{}, Sort: parseSorts(q.Get("sort")), Page: atoiDefault(q.Get("page"), 1), PageSize: atoiDefault(q.Get("page_size"), 20)}
	if program := q.Get("program"); program != "" {
		lp.Filters["program"] = program
	}
	if level := q.Get("level"); level != "" {
		lp.Filters["level"] = level
	}
	result, err := h.catalogSvc.ListPublicCourses(r.Context(), lp)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, withAbsoluteCourseListThumbnailURL(r, result))
}

func (h *LearningHandler) GetPublicCourseBySlug(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	course, err := h.catalogSvc.GetPublicCourseBySlug(r.Context(), slug)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, withAbsoluteCourseThumbnailURL(r, course))
}

func (h *LearningHandler) ListCourses(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	lp := repository.ListParams{Search: q.Get("search"), Filters: map[string]any{}, Sort: parseSorts(q.Get("sort")), Page: atoiDefault(q.Get("page"), 1), PageSize: atoiDefault(q.Get("page_size"), 20)}
	if status := q.Get("status"); status != "" {
		lp.Filters["status"] = status
	}
	if program := q.Get("program"); program != "" {
		lp.Filters["program"] = program
	}
	if level := q.Get("level"); level != "" {
		lp.Filters["level"] = level
	}
	result, err := h.catalogSvc.ListCourses(r.Context(), lp)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, withAbsoluteCourseListThumbnailURL(r, result))
}

func (h *LearningHandler) CreateCourse(w http.ResponseWriter, r *http.Request) {
	var req model.CreateCourseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid body", nil)
		return
	}
	authCtx := middleware.MustGetAuthContext(r.Context())
	course, err := h.catalogSvc.CreateCourse(r.Context(), authCtx, req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.Created(w, r, withAbsoluteCourseThumbnailURL(r, course))
}

func (h *LearningHandler) GetCourse(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	course, err := h.catalogSvc.GetCourse(r.Context(), id)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, withAbsoluteCourseThumbnailURL(r, course))
}

func (h *LearningHandler) UpdateCourse(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req model.UpdateCourseRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid body", nil)
		return
	}
	authCtx := middleware.MustGetAuthContext(r.Context())
	course, err := h.catalogSvc.UpdateCourse(r.Context(), authCtx, id, req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, withAbsoluteCourseThumbnailURL(r, course))
}

func (h *LearningHandler) DeleteCourse(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.catalogSvc.DeleteCourse(r.Context(), id); err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.NoContent(w, r)
}

func (h *LearningHandler) CreateSection(w http.ResponseWriter, r *http.Request) {
	courseID := chi.URLParam(r, "course_id")
	var req model.CreateCourseSectionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid body", nil)
		return
	}
	req.CourseID = courseID
	result, err := h.catalogSvc.CreateSection(r.Context(), req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.Created(w, r, result)
}

func (h *LearningHandler) GetSection(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	result, err := h.catalogSvc.GetSection(r.Context(), id)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, result)
}

func (h *LearningHandler) UpdateSection(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req model.UpdateCourseSectionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid body", nil)
		return
	}
	result, err := h.catalogSvc.UpdateSection(r.Context(), id, req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, result)
}

func (h *LearningHandler) DeleteSection(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.catalogSvc.DeleteSection(r.Context(), id); err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.NoContent(w, r)
}

func (h *LearningHandler) CreateLesson(w http.ResponseWriter, r *http.Request) {
	sectionID := chi.URLParam(r, "section_id")
	courseID := chi.URLParam(r, "course_id")
	var req model.CreateLessonRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid body", nil)
		return
	}
	req.CourseID = courseID
	req.SectionID = sectionID
	result, err := h.catalogSvc.CreateLesson(r.Context(), req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.Created(w, r, result)
}

func (h *LearningHandler) GetLesson(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	result, err := h.catalogSvc.GetLesson(r.Context(), id)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, result)
}

func (h *LearningHandler) UpdateLesson(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req model.UpdateLessonRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid body", nil)
		return
	}
	result, err := h.catalogSvc.UpdateLesson(r.Context(), id, req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, result)
}

func (h *LearningHandler) DeleteLesson(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.catalogSvc.DeleteLesson(r.Context(), id); err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.NoContent(w, r)
}
