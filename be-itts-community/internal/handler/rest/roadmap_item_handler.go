package rest

import (
	"net/http"

	"github.com/gofiber/fiber/v2"

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
func (h *RoadmapItemHandler) Create(c *fiber.Ctx) error {
	var req service.CreateRoadmapItem
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid body"})
	}
	it, err := h.svc.Create(c.Context(), req)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(http.StatusCreated).JSON(it)
}

// GET /api/v1/admin/roadmap-items/:id
func (h *RoadmapItemHandler) Get(c *fiber.Ctx) error {
	id := c.Params("id")
	it, err := h.svc.Get(c.Context(), id)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(it)
}

// PATCH /api/v1/admin/roadmap-items/:id
func (h *RoadmapItemHandler) Update(c *fiber.Ctx) error {
	id := c.Params("id")
	var req service.UpdateRoadmapItem
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid body"})
	}
	it, err := h.svc.Update(c.Context(), id, req)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(it)
}

// DELETE /api/v1/admin/roadmap-items/:id
func (h *RoadmapItemHandler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := h.svc.Delete(c.Context(), id); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.SendStatus(http.StatusNoContent)
}

// GET /api/v1/admin/roadmap-items
// Query: search, roadmap_id, sort, page, page_size
func (h *RoadmapItemHandler) List(c *fiber.Ctx) error {
	lp := &repository.ListParams{
		Search:   c.Query("search"),
		Filters:  map[string]any{},
		Sort:     parseSorts(c.Query("sort")),
		Page:     atoiDefault(c.Query("page"), 1),
		PageSize: atoiDefault(c.Query("page_size"), 20),
	}
	if v := c.Query("roadmap_id"); v != "" {
		lp.Filters["roadmap_id"] = v
	}
	res, err := h.svc.List(c.Context(), lp)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(res)
}

// Optional: nested create via /roadmaps/:roadmap_id/items
// POST /api/v1/admin/roadmaps/:roadmap_id/items
func (h *RoadmapItemHandler) CreateUnderRoadmap(c *fiber.Ctx) error {
	roadmapID := c.Params("roadmap_id")
	var req service.CreateRoadmapItem
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid body"})
	}
	req.RoadmapID = roadmapID
	it, err := h.svc.Create(c.Context(), req)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(http.StatusCreated).JSON(it)
}
