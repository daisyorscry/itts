package rest

import (
	"net/http"

	"github.com/gofiber/fiber/v2"

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
func (h *MentorHandler) Create(c *fiber.Ctx) error {
	var req service.CreateMentor
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid body"})
	}
	m, err := h.svc.Create(c.Context(), req)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(http.StatusCreated).JSON(m)
}

// GET /api/v1/admin/mentors/:id
func (h *MentorHandler) Get(c *fiber.Ctx) error {
	id := c.Params("id")
	m, err := h.svc.Get(c.Context(), id)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(m)
}

// PATCH /api/v1/admin/mentors/:id
func (h *MentorHandler) Update(c *fiber.Ctx) error {
	id := c.Params("id")
	var req service.UpdateMentor
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid body"})
	}
	m, err := h.svc.Update(c.Context(), id, req)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(m)
}

// DELETE /api/v1/admin/mentors/:id
func (h *MentorHandler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := h.svc.Delete(c.Context(), id); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.SendStatus(http.StatusNoContent)
}

// GET /api/v1/admin/mentors
// Query: search, is_active, program(in), sort, page, page_size
func (h *MentorHandler) List(c *fiber.Ctx) error {
	lp := &repository.ListParams{
		Search:   c.Query("search"),
		Filters:  map[string]any{},
		Sort:     parseSorts(c.Query("sort")),
		Page:     atoiDefault(c.Query("page"), 1),
		PageSize: atoiDefault(c.Query("page_size"), 20),
	}

	// filter is_active
	if v := c.Query("is_active"); v != "" {
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
	if v := c.Query("program"); v != "" {
		// Catatan: karena Programs adalah array enum, filtering optimal perlu custom query:
		// lp.Filters["program@array_contains"] = v  // jika ApplyListQuery kamu support operator seperti ini.
		// Untuk default, kita masukkan ke Search agar tetap ketemu.
		if lp.Search == "" {
			lp.Search = v
		} else {
			lp.Search = lp.Search + " " + v
		}
	}

	res, err := h.svc.List(c.Context(), lp)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(res)
}

// PATCH /api/v1/admin/mentors/:id/active
type setActiveReq struct {
	Active bool `json:"active"`
}

func (h *MentorHandler) SetActive(c *fiber.Ctx) error {
	id := c.Params("id")
	var req setActiveReq
	_ = c.BodyParser(&req)
	m, err := h.svc.SetActive(c.Context(), id, req.Active)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(m)
}

// PATCH /api/v1/admin/mentors/:id/priority
type setPriorityReq struct {
	Priority int `json:"priority"`
}

func (h *MentorHandler) SetPriority(c *fiber.Ctx) error {
	id := c.Params("id")
	var req setPriorityReq
	_ = c.BodyParser(&req)
	m, err := h.svc.SetPriority(c.Context(), id, req.Priority)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(m)
}
