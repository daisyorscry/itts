package rest

import (
	"net/http"
	"strconv"

	"github.com/gofiber/fiber/v2"

	"be-itts-community/internal/repository"
	"be-itts-community/internal/service"
	"be-itts-community/model"
)

type RoadmapHandler struct {
	svc service.RoadmapService
}

func NewRoadmapHandler(svc service.RoadmapService) *RoadmapHandler {
	return &RoadmapHandler{svc: svc}
}

// POST /api/v1/admin/roadmaps
func (h *RoadmapHandler) Create(c *fiber.Ctx) error {
	var req service.CreateRoadmap
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid body"})
	}
	rm, err := h.svc.Create(c.Context(), req)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(http.StatusCreated).JSON(rm)
}

// GET /api/v1/admin/roadmaps/:id
func (h *RoadmapHandler) Get(c *fiber.Ctx) error {
	id := c.Params("id")
	rm, err := h.svc.Get(c.Context(), id)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(rm)
}

// PATCH /api/v1/admin/roadmaps/:id
func (h *RoadmapHandler) Update(c *fiber.Ctx) error {
	id := c.Params("id")
	var req service.UpdateRoadmap
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid body"})
	}
	rm, err := h.svc.Update(c.Context(), id, req)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(rm)
}

// DELETE /api/v1/admin/roadmaps/:id
func (h *RoadmapHandler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := h.svc.Delete(c.Context(), id); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.SendStatus(http.StatusNoContent)
}

// GET /api/v1/admin/roadmaps
// Query: search, program, is_active, month_number, sort, page, page_size
func (h *RoadmapHandler) List(c *fiber.Ctx) error {
	lp := &repository.ListParams{
		Search:   c.Query("search"),
		Filters:  map[string]any{},
		Sort:     parseSorts(c.Query("sort")),
		Page:     atoiDefault(c.Query("page"), 1),
		PageSize: atoiDefault(c.Query("page_size"), 20),
	}
	if v := c.Query("program"); v != "" {
		lp.Filters["program"] = model.ProgramEnum(v)
	}
	if v := c.Query("is_active"); v != "" {
		if v == "true" || v == "1" {
			lp.Filters["is_active"] = true
		} else if v == "false" || v == "0" {
			lp.Filters["is_active"] = false
		}
	}
	if v := c.Query("month_number"); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			lp.Filters["month_number"] = n
		}
	}
	res, err := h.svc.List(c.Context(), lp)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(res)
}
