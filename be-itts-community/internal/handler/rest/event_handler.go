package rest

import (
	"net/http"
	"time"

	"github.com/gofiber/fiber/v2"

	"be-itts-community/internal/repository"
	"be-itts-community/internal/service"
	"be-itts-community/model"
)

type EventHandler struct {
	svc service.EventService
}

func NewEventHandler(svc service.EventService) *EventHandler {
	return &EventHandler{svc: svc}

}

// POST /api/v1/admin/events
func (h *EventHandler) CreateEvent(c *fiber.Ctx) error {
	var req service.CreateEvent
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid body"})
	}
	// parsing aman untuk time jika body string ISO; kalau perlu custom, tambahkan binder
	ev, err := h.svc.Create(c.Context(), req)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(http.StatusCreated).JSON(ev)
}

// GET /api/v1/admin/events/:id
func (h *EventHandler) GetEvent(c *fiber.Ctx) error {
	id := c.Params("id")
	ev, err := h.svc.Get(c.Context(), id)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(ev)
}

// GET /api/v1/events/slug/:slug  (public)
func (h *EventHandler) GetEventBySlug(c *fiber.Ctx) error {
	slug := c.Params("slug")
	ev, err := h.svc.GetBySlug(c.Context(), slug)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(ev)
}

// PATCH /api/v1/admin/events/:id
func (h *EventHandler) UpdateEvent(c *fiber.Ctx) error {
	id := c.Params("id")
	var req service.UpdateEvent
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid body"})
	}
	ev, err := h.svc.Update(c.Context(), id, req)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(ev)
}

// DELETE /api/v1/admin/events/:id
func (h *EventHandler) DeleteEvent(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := h.svc.Delete(c.Context(), id); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.SendStatus(http.StatusNoContent)
}

// GET /api/v1/admin/events
// Query: search, program, status, from, to, sort, page, page_size
func (h *EventHandler) ListEvents(c *fiber.Ctx) error {
	lp := &repository.ListParams{
		Search:   c.Query("search"),
		Filters:  map[string]any{},
		Sort:     parseSorts(c.Query("sort")),
		Page:     atoiDefault(c.Query("page"), 1),
		PageSize: atoiDefault(c.Query("page_size"), 20),
	}

	if v := c.Query("program"); v != "" {
		lp.Filters["program"] = v
	}
	if v := c.Query("status"); v != "" {
		lp.Filters["status"] = v
	}
	if v := c.Query("from"); v != "" {
		if t, err := time.Parse(time.RFC3339, v); err == nil {
			lp.Filters["starts_at_gte"] = t
		}
	}
	if v := c.Query("to"); v != "" {
		if t, err := time.Parse(time.RFC3339, v); err == nil {
			lp.Filters["starts_at_lte"] = t
		}
	}

	res, err := h.svc.List(c.Context(), lp)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(res)
}

func (h *EventHandler) SetEventStatus(c *fiber.Ctx) error {
	id := c.Params("id")
	var body struct {
		Status string `json:"status"`
	}
	if err := c.BodyParser(&body); err != nil || body.Status == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid body"})
	}
	st := model.EventStatus(body.Status)
	ev, err := h.svc.SetStatus(c.Context(), id, st)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(ev)
}

func (h *EventHandler) AddSpeaker(c *fiber.Ctx) error {
	eventID := c.Params("event_id")
	var req service.CreateSpeaker
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid body"})
	}
	req.EventID = eventID

	sp, err := h.svc.AddSpeaker(c.Context(), req)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(http.StatusCreated).JSON(sp)
}

func (h *EventHandler) UpdateSpeaker(c *fiber.Ctx) error {
	id := c.Params("id")
	var req service.UpdateSpeaker
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid body"})
	}
	sp, err := h.svc.UpdateSpeaker(c.Context(), id, req)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(sp)
}

func (h *EventHandler) DeleteSpeaker(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := h.svc.DeleteSpeaker(c.Context(), id); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.SendStatus(http.StatusNoContent)
}

func (h *EventHandler) ListSpeakers(c *fiber.Ctx) error {
	lp := &repository.ListParams{
		Search:   c.Query("search"),
		Filters:  map[string]any{},
		Sort:     parseSorts(c.Query("sort")),
		Page:     atoiDefault(c.Query("page"), 1),
		PageSize: atoiDefault(c.Query("page_size"), 20),
	}

	// support nested param :event_id
	if evID := c.Params("event_id"); evID != "" {
		lp.Filters["event_id"] = evID
	}
	if v := c.Query("event_id"); v != "" {
		lp.Filters["event_id"] = v
	}

	res, err := h.svc.ListSpeakers(c.Context(), lp)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(res)
}

/* ======================
   Registrations
   ====================== */

// POST /api/v1/events/:event_id/register (public)
func (h *EventHandler) RegisterToEvent(c *fiber.Ctx) error {
	eventID := c.Params("event_id")
	var req service.CreateEventRegistration
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid body"})
	}
	req.EventID = eventID

	reg, err := h.svc.RegisterToEvent(c.Context(), req)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(http.StatusCreated).JSON(reg)
}

func (h *EventHandler) ListRegistrations(c *fiber.Ctx) error {
	lp := &repository.ListParams{
		Search:   c.Query("search"),
		Filters:  map[string]any{},
		Sort:     parseSorts(c.Query("sort")),
		Page:     atoiDefault(c.Query("page"), 1),
		PageSize: atoiDefault(c.Query("page_size"), 20),
	}
	if v := c.Query("event_id"); v != "" {
		lp.Filters["event_id"] = v
	}
	if v := c.Query("email"); v != "" {
		lp.Filters["email"] = v
	}
	res, err := h.svc.ListRegistrations(c.Context(), lp)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(res)
}

func (h *EventHandler) Unregister(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := h.svc.Unregister(c.Context(), id); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.SendStatus(http.StatusNoContent)
}
