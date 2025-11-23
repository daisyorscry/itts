package rest

import (
	"encoding/json"
	"net/http"

	"github.com/daisyorscry/itts/core"
	"github.com/go-chi/chi/v5"

	"be-itts-community/internal/repository"
	"be-itts-community/internal/service"
)

type MentorHandler struct {
	svc service.MentorService
}

func NewMentorHandler(svc service.MentorService) *MentorHandler {
	return &MentorHandler{svc: svc}
}

// POST /api/v1/admin/mentors
func (h *MentorHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req service.CreateMentorRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid body", nil)
		return
	}
	m, err := h.svc.Create(r.Context(), req)
	if err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "CREATE_FAILED", err.Error(), nil)
		return
	}
	core.Created(w, r, m)
}

// GET /api/v1/admin/mentors/:id
func (h *MentorHandler) Get(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	m, err := h.svc.Get(r.Context(), id)
	if err != nil {
		core.WriteError(w, r, http.StatusNotFound, "NOT_FOUND", err.Error(), nil)
		return
	}
	core.OK(w, r, m)
}

// PATCH /api/v1/admin/mentors/:id
func (h *MentorHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req service.UpdateMentorRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid body", nil)
		return
	}
	m, err := h.svc.Update(r.Context(), id, req)
	if err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "UPDATE_FAILED", err.Error(), nil)
		return
	}
	core.OK(w, r, m)
}

// DELETE /api/v1/admin/mentors/:id
func (h *MentorHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.svc.Delete(r.Context(), id); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "DELETE_FAILED", err.Error(), nil)
		return
	}
	core.NoContent(w, r)
}

// GET /api/v1/admin/mentors
// Query: search, is_active, program(in), sort, page, page_size
func (h *MentorHandler) List(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	lp := repository.ListParams{
		Search:   q.Get("search"),
		Filters:  map[string]any{},
		Sort:     parseSorts(q.Get("sort")),
		Page:     atoiDefault(q.Get("page"), 1),
		PageSize: atoiDefault(q.Get("page_size"), 20),
	}

	// filter is_active
	if v := q.Get("is_active"); v != "" {
		switch v {
		case "true", "1":
			lp.Filters["is_active"] = true
		case "false", "0":
			lp.Filters["is_active"] = false
		}
	}

	// filter program: jika mau filter yang mengandung program tertentu pada array
	// kamu bisa extend ApplyListQuery untuk array, tapi untuk cepatnya kita pakai search di repo (sudah ada)
	// Di sini, jika query ?program=networking, biarkan search yg menangani atau tambahkan filter custom:
	if v := q.Get("program"); v != "" {
		// Catatan: karena Programs adalah array enum, filtering optimal perlu custom query:
		// lp.Filters["program@array_contains"] = v  // jika ApplyListQuery kamu support operator seperti ini.
		// Untuk default, kita masukkan ke Search agar tetap ketemu.
		if lp.Search == "" {
			lp.Search = v
		} else {
			lp.Search = lp.Search + " " + v
		}
	}

	res, err := h.svc.List(r.Context(), lp)
	if err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "LIST_FAILED", err.Error(), nil)
		return
	}
	core.OK(w, r, res)
}

// PATCH /api/v1/admin/mentors/:id/active
func (h *MentorHandler) SetActive(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var body struct {
		Active bool `json:"active"`
	}
	_ = json.NewDecoder(r.Body).Decode(&body)
	req := service.SetMentorActiveRequest{
		ID:     id,
		Active: body.Active,
	}
	m, err := h.svc.SetActive(r.Context(), req)
	if err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "SET_ACTIVE_FAILED", err.Error(), nil)
		return
	}
	core.OK(w, r, m)
}

// PATCH /api/v1/admin/mentors/:id/priority
func (h *MentorHandler) SetPriority(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var body struct {
		Priority int `json:"priority"`
	}
	_ = json.NewDecoder(r.Body).Decode(&body)
	req := service.SetMentorPriorityRequest{
		ID:       id,
		Priority: body.Priority,
	}
	m, err := h.svc.SetPriority(r.Context(), req)
	if err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "SET_PRIORITY_FAILED", err.Error(), nil)
		return
	}
	core.OK(w, r, m)
}
