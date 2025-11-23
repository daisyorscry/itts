package rest

import (
	"encoding/json"
	"net/http"

	"github.com/daisyorscry/itts/core"
	"github.com/go-chi/chi/v5"

	"be-itts-community/internal/model"
	"be-itts-community/internal/repository"
	"be-itts-community/internal/service"
)

type PartnerHandler struct {
	svc service.PartnerService
}

func NewPartnerHandler(svc service.PartnerService) *PartnerHandler {
	return &PartnerHandler{svc: svc}
}

// POST /api/v1/admin/partners
func (h *PartnerHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req model.CreatePartnerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid body", nil)
		return
	}
	p, err := h.svc.Create(r.Context(), req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.Created(w, r, p)
}

// GET /api/v1/admin/partners/:id
func (h *PartnerHandler) Get(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	p, err := h.svc.Get(r.Context(), id)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, p)
}

// PATCH /api/v1/admin/partners/:id
func (h *PartnerHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req model.UpdatePartnerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid body", nil)
		return
	}
	p, err := h.svc.Update(r.Context(), id, req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, p)
}

// DELETE /api/v1/admin/partners/:id
func (h *PartnerHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.svc.Delete(r.Context(), id); err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.NoContent(w, r)
}

// GET /api/v1/admin/partners
// Query: search, kind, is_active, sort, page, page_size
func (h *PartnerHandler) List(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	lp := repository.ListParams{
		Search:   q.Get("search"),
		Filters:  map[string]any{},
		Sort:     parseSorts(q.Get("sort")),
		Page:     atoiDefault(q.Get("page"), 1),
		PageSize: atoiDefault(q.Get("page_size"), 20),
	}
	if v := q.Get("kind"); v != "" {
		lp.Filters["kind"] = v
	}
	if v := q.Get("is_active"); v != "" {
		switch v {
		case "true", "1":
			lp.Filters["is_active"] = true
		case "false", "0":
			lp.Filters["is_active"] = false
		}
	}
	res, err := h.svc.List(r.Context(), lp)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, res)
}

func (h *PartnerHandler) SetActive(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var body struct {
		Active bool `json:"active"`
	}
	_ = json.NewDecoder(r.Body).Decode(&body)
	req := model.SetPartnerActiveRequest{
		ID:     id,
		Active: body.Active,
	}
	p, err := h.svc.SetActive(r.Context(), req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, p)
}

// PATCH /api/v1/admin/partners/:id/priority

func (h *PartnerHandler) SetPriority(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var body struct {
		Priority int `json:"priority"`
	}
	_ = json.NewDecoder(r.Body).Decode(&body)
	req := model.SetPartnerPriorityRequest{
		ID:       id,
		Priority: body.Priority,
	}
	p, err := h.svc.SetPriority(r.Context(), req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}
	core.OK(w, r, p)
}
