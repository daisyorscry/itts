package rest

import (
    "encoding/json"
    "net/http"

    "github.com/go-chi/chi/v5"

    "be-itts-community/core"
    "be-itts-community/internal/repository"
    "be-itts-community/internal/service"
)

type RoadmapItemHandler struct {
	svc service.RoadmapItemService
}

func NewRoadmapItemHandler(svc service.RoadmapItemService) *RoadmapItemHandler {
	return &RoadmapItemHandler{svc: svc}
}

// POST /api/v1/admin/roadmap-items
// Atau: POST /api/v1/admin/roadmaps/:roadmap_id/items (lihat handler tambahan di bawah)
func (h *RoadmapItemHandler) Create(w http.ResponseWriter, r *http.Request) {
    var req service.CreateRoadmapItem
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid body", nil)
        return
    }
    it, err := h.svc.Create(r.Context(), req)
    if err != nil {
        core.WriteError(w, r, http.StatusBadRequest, "CREATE_FAILED", err.Error(), nil)
        return
    }
    core.Created(w, r, it)
}

// GET /api/v1/admin/roadmap-items/:id
func (h *RoadmapItemHandler) Get(w http.ResponseWriter, r *http.Request) {
    id := chi.URLParam(r, "id")
    it, err := h.svc.Get(r.Context(), id)
    if err != nil {
        core.WriteError(w, r, http.StatusNotFound, "NOT_FOUND", err.Error(), nil)
        return
    }
    core.OK(w, r, it)
}

// PATCH /api/v1/admin/roadmap-items/:id
func (h *RoadmapItemHandler) Update(w http.ResponseWriter, r *http.Request) {
    id := chi.URLParam(r, "id")
    var req service.UpdateRoadmapItem
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid body", nil)
        return
    }
    it, err := h.svc.Update(r.Context(), id, req)
    if err != nil {
        core.WriteError(w, r, http.StatusBadRequest, "UPDATE_FAILED", err.Error(), nil)
        return
    }
    core.OK(w, r, it)
}

// DELETE /api/v1/admin/roadmap-items/:id
func (h *RoadmapItemHandler) Delete(w http.ResponseWriter, r *http.Request) {
    id := chi.URLParam(r, "id")
    if err := h.svc.Delete(r.Context(), id); err != nil {
        core.WriteError(w, r, http.StatusBadRequest, "DELETE_FAILED", err.Error(), nil)
        return
    }
    core.NoContent(w, r)
}

// GET /api/v1/admin/roadmap-items
// Query: search, roadmap_id, sort, page, page_size
func (h *RoadmapItemHandler) List(w http.ResponseWriter, r *http.Request) {
    q := r.URL.Query()
    lp := &repository.ListParams{
        Search:   q.Get("search"),
        Filters:  map[string]any{},
        Sort:     parseSorts(q.Get("sort")),
        Page:     atoiDefault(q.Get("page"), 1),
        PageSize: atoiDefault(q.Get("page_size"), 20),
    }
    if v := q.Get("roadmap_id"); v != "" {
        lp.Filters["roadmap_id"] = v
    }
    res, err := h.svc.List(r.Context(), lp)
    if err != nil {
        core.WriteError(w, r, http.StatusBadRequest, "LIST_FAILED", err.Error(), nil)
        return
    }
    core.OK(w, r, res)
}

// Optional: nested create via /roadmaps/:roadmap_id/items
// POST /api/v1/admin/roadmaps/:roadmap_id/items
func (h *RoadmapItemHandler) CreateUnderRoadmap(w http.ResponseWriter, r *http.Request) {
    roadmapID := chi.URLParam(r, "roadmap_id")
    var req service.CreateRoadmapItem
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid body", nil)
        return
    }
    req.RoadmapID = roadmapID
    it, err := h.svc.Create(r.Context(), req)
    if err != nil {
        core.WriteError(w, r, http.StatusBadRequest, "CREATE_FAILED", err.Error(), nil)
        return
    }
    core.Created(w, r, it)
}
