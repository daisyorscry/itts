package rest

import (
	"net/http"

	"github.com/gofiber/fiber/v2"

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
func (h *PartnerHandler) Create(c *fiber.Ctx) error {
	var req service.CreatePartner
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid body"})
	}
	p, err := h.svc.Create(c.Context(), req)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(http.StatusCreated).JSON(p)
}

// GET /api/v1/admin/partners/:id
func (h *PartnerHandler) Get(c *fiber.Ctx) error {
	id := c.Params("id")
	p, err := h.svc.Get(c.Context(), id)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(p)
}

// PATCH /api/v1/admin/partners/:id
func (h *PartnerHandler) Update(c *fiber.Ctx) error {
	id := c.Params("id")
	var req service.UpdatePartner
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid body"})
	}
	p, err := h.svc.Update(c.Context(), id, req)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(p)
}

// DELETE /api/v1/admin/partners/:id
func (h *PartnerHandler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := h.svc.Delete(c.Context(), id); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.SendStatus(http.StatusNoContent)
}

// GET /api/v1/admin/partners
// Query: search, kind, is_active, sort, page, page_size
func (h *PartnerHandler) List(c *fiber.Ctx) error {
	lp := &repository.ListParams{
		Search:   c.Query("search"),
		Filters:  map[string]any{},
		Sort:     parseSorts(c.Query("sort")),
		Page:     atoiDefault(c.Query("page"), 1),
		PageSize: atoiDefault(c.Query("page_size"), 20),
	}
	if v := c.Query("kind"); v != "" {
		lp.Filters["kind"] = v
	}
	if v := c.Query("is_active"); v != "" {
		switch v {
		case "true", "1":
			lp.Filters["is_active"] = true
		case "false", "0":
			lp.Filters["is_active"] = false
		}
	}
	res, err := h.svc.List(c.Context(), lp)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(res)
}

func (h *PartnerHandler) SetActive(c *fiber.Ctx) error {
	id := c.Params("id")
	var req setActiveReq
	_ = c.BodyParser(&req)
	p, err := h.svc.SetActive(c.Context(), id, req.Active)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(p)
}

// PATCH /api/v1/admin/partners/:id/priority

func (h *PartnerHandler) SetPriority(c *fiber.Ctx) error {
	id := c.Params("id")
	var req setPriorityReq
	_ = c.BodyParser(&req)
	p, err := h.svc.SetPriority(c.Context(), id, req.Priority)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(p)
}
