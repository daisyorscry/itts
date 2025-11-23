package rest

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/daisyorscry/itts/core"
	"github.com/go-chi/chi/v5"

	"be-itts-community/internal/model"
	"be-itts-community/internal/repository"
	"be-itts-community/internal/service"
)

type RoadmapHandler struct {
	svc service.RoadmapService
}

func NewRoadmapHandler(svc service.RoadmapService) *RoadmapHandler {
	return &RoadmapHandler{svc: svc}
}

// POST /api/v1/admin/roadmaps
func (h *RoadmapHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req service.CreateRoadmap
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid body", nil)
		return
	}
	rm, err := h.svc.Create(r.Context(), req)
	if err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "CREATE_FAILED", err.Error(), nil)
		return
	}
	core.Created(w, r, rm)
}

// GET /api/v1/admin/roadmaps/:id
func (h *RoadmapHandler) Get(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	rm, err := h.svc.Get(r.Context(), id)
	if err != nil {
		core.WriteError(w, r, http.StatusNotFound, "NOT_FOUND", err.Error(), nil)
		return
	}
	core.OK(w, r, rm)
}

// PATCH /api/v1/admin/roadmaps/:id
func (h *RoadmapHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req service.UpdateRoadmap
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid body", nil)
		return
	}
	rm, err := h.svc.Update(r.Context(), id, req)
	if err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "UPDATE_FAILED", err.Error(), nil)
		return
	}
	core.OK(w, r, rm)
}

// DELETE /api/v1/admin/roadmaps/:id
func (h *RoadmapHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.svc.Delete(r.Context(), id); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "DELETE_FAILED", err.Error(), nil)
		return
	}
	core.NoContent(w, r)
}

// GET /api/v1/admin/roadmaps
// Query: search, program, is_active, month_number, sort, page, page_size
func (h *RoadmapHandler) List(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	lp := &repository.ListParams{
		Search:   q.Get("search"),
		Filters:  map[string]any{},
		Sort:     parseSorts(q.Get("sort")),
		Page:     atoiDefault(q.Get("page"), 1),
		PageSize: atoiDefault(q.Get("page_size"), 20),
	}
	if v := q.Get("program"); v != "" {
		lp.Filters["program"] = model.ProgramEnum(v)
	}
	if v := q.Get("is_active"); v != "" {
		if v == "true" || v == "1" {
			lp.Filters["is_active"] = true
		} else if v == "false" || v == "0" {
			lp.Filters["is_active"] = false
		}
	}
	if v := q.Get("month_number"); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			lp.Filters["month_number"] = n
		}
	}
	res, err := h.svc.List(r.Context(), lp)
	if err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "LIST_FAILED", err.Error(), nil)
		return
	}
	core.OK(w, r, res)
}
