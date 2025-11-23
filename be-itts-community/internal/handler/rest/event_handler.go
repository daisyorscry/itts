package rest

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"

	"be-itts-community/internal/model"
	"be-itts-community/internal/repository"
	"be-itts-community/internal/service"

	"github.com/daisyorscry/itts/core"
)

type EventHandler struct {
	svc service.EventService
}

func NewEventHandler(svc service.EventService) *EventHandler {
	return &EventHandler{svc: svc}

}

// POST /api/v1/admin/events
func (h *EventHandler) CreateEvent(w http.ResponseWriter, r *http.Request) {
	var req service.CreateEvent
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid body", nil)
		return
	}
	ev, err := h.svc.Create(r.Context(), req)
	if err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "CREATE_FAILED", err.Error(), nil)
		return
	}
	core.Created(w, r, ev)
}

// GET /api/v1/admin/events/:id
func (h *EventHandler) GetEvent(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	ev, err := h.svc.Get(r.Context(), id)
	if err != nil {
		core.WriteError(w, r, http.StatusNotFound, "NOT_FOUND", err.Error(), nil)
		return
	}
	core.OK(w, r, ev)
}

// GET /api/v1/events/slug/:slug  (public)
func (h *EventHandler) GetEventBySlug(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	ev, err := h.svc.GetBySlug(r.Context(), slug)
	if err != nil {
		core.WriteError(w, r, http.StatusNotFound, "NOT_FOUND", err.Error(), nil)
		return
	}
	core.OK(w, r, ev)
}

// PATCH /api/v1/admin/events/:id
func (h *EventHandler) UpdateEvent(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req service.UpdateEvent
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid body", nil)
		return
	}
	ev, err := h.svc.Update(r.Context(), id, req)
	if err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "UPDATE_FAILED", err.Error(), nil)
		return
	}
	core.OK(w, r, ev)
}

// DELETE /api/v1/admin/events/:id
func (h *EventHandler) DeleteEvent(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.svc.Delete(r.Context(), id); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "DELETE_FAILED", err.Error(), nil)
		return
	}
	core.NoContent(w, r)
}

// GET /api/v1/admin/events
// Query: search, program, status, from, to, sort, page, page_size
func (h *EventHandler) ListEvents(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	lp := &repository.ListParams{
		Search:   q.Get("search"),
		Filters:  map[string]any{},
		Sort:     parseSorts(q.Get("sort")),
		Page:     atoiDefault(q.Get("page"), 1),
		PageSize: atoiDefault(q.Get("page_size"), 20),
	}

	if v := q.Get("program"); v != "" {
		lp.Filters["program"] = v
	}
	if v := q.Get("status"); v != "" {
		lp.Filters["status"] = v
	}
	if v := q.Get("from"); v != "" {
		if t, err := time.Parse(time.RFC3339, v); err == nil {
			lp.Filters["starts_at_gte"] = t
		}
	}
	if v := q.Get("to"); v != "" {
		if t, err := time.Parse(time.RFC3339, v); err == nil {
			lp.Filters["starts_at_lte"] = t
		}
	}

	res, err := h.svc.List(r.Context(), lp)
	if err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "LIST_FAILED", err.Error(), nil)
		return
	}
	core.OK(w, r, res)
}

func (h *EventHandler) SetEventStatus(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var body struct {
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Status == "" {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid body", nil)
		return
	}
	st := model.EventStatus(body.Status)
	ev, err := h.svc.SetStatus(r.Context(), id, st)
	if err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "SET_STATUS_FAILED", err.Error(), nil)
		return
	}
	core.OK(w, r, ev)
}

func (h *EventHandler) AddSpeaker(w http.ResponseWriter, r *http.Request) {
	eventID := chi.URLParam(r, "event_id")
	var req service.CreateSpeaker
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid body", nil)
		return
	}
	req.EventID = eventID
	sp, err := h.svc.AddSpeaker(r.Context(), req)
	if err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "ADD_SPEAKER_FAILED", err.Error(), nil)
		return
	}
	core.Created(w, r, sp)
}

func (h *EventHandler) UpdateSpeaker(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req service.UpdateSpeaker
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid body", nil)
		return
	}
	sp, err := h.svc.UpdateSpeaker(r.Context(), id, req)
	if err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "UPDATE_SPEAKER_FAILED", err.Error(), nil)
		return
	}
	core.OK(w, r, sp)
}

func (h *EventHandler) DeleteSpeaker(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.svc.DeleteSpeaker(r.Context(), id); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "DELETE_SPEAKER_FAILED", err.Error(), nil)
		return
	}
	core.NoContent(w, r)
}

func (h *EventHandler) ListSpeakers(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	lp := &repository.ListParams{
		Search:   q.Get("search"),
		Filters:  map[string]any{},
		Sort:     parseSorts(q.Get("sort")),
		Page:     atoiDefault(q.Get("page"), 1),
		PageSize: atoiDefault(q.Get("page_size"), 20),
	}
	if evID := chi.URLParam(r, "event_id"); evID != "" {
		lp.Filters["event_id"] = evID
	}
	if v := q.Get("event_id"); v != "" {
		lp.Filters["event_id"] = v
	}
	res, err := h.svc.ListSpeakers(r.Context(), lp)
	if err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "LIST_SPEAKERS_FAILED", err.Error(), nil)
		return
	}
	core.OK(w, r, res)
}

/* ======================
   Registrations
   ====================== */

// POST /api/v1/events/:event_id/register (public)
func (h *EventHandler) RegisterToEvent(w http.ResponseWriter, r *http.Request) {
	eventID := chi.URLParam(r, "event_id")
	var req service.CreateEventRegistration
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid body", nil)
		return
	}
	req.EventID = eventID
	reg, err := h.svc.RegisterToEvent(r.Context(), req)
	if err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "RSVP_FAILED", err.Error(), nil)
		return
	}
	core.Created(w, r, reg)
}

func (h *EventHandler) ListRegistrations(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	lp := &repository.ListParams{
		Search:   q.Get("search"),
		Filters:  map[string]any{},
		Sort:     parseSorts(q.Get("sort")),
		Page:     atoiDefault(q.Get("page"), 1),
		PageSize: atoiDefault(q.Get("page_size"), 20),
	}
	if v := q.Get("event_id"); v != "" {
		lp.Filters["event_id"] = v
	}
	if v := q.Get("email"); v != "" {
		lp.Filters["email"] = v
	}
	res, err := h.svc.ListRegistrations(r.Context(), lp)
	if err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "LIST_EVENT_REG_FAILED", err.Error(), nil)
		return
	}
	core.OK(w, r, res)
}

func (h *EventHandler) Unregister(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.svc.Unregister(r.Context(), id); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "UNREGISTER_FAILED", err.Error(), nil)
		return
	}
	core.NoContent(w, r)
}
