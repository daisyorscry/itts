package rest

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"

	"be-itts-community/internal/repository"
	"be-itts-community/internal/service"
)

type RegistrationHandler struct {
	svc            service.RegistrationService
	verifyEmailURL string
}

func NewRegistrationHandler(svc service.RegistrationService, verifyEmailURL string) *RegistrationHandler {
	return &RegistrationHandler{svc: svc, verifyEmailURL: verifyEmailURL}
}

func (h *RegistrationHandler) Register(c *fiber.Ctx) error {
	var req service.RegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "invalid body"})
	}
	reg, err := h.svc.Register(c.Context(), req, h.verifyEmailURL)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(http.StatusCreated).JSON(fiber.Map{
		"id":      reg.ID,
		"email":   reg.Email,
		"status":  reg.Status,
		"message": "Your registration has been received. Please check your email. We will approve it soon",
	})
}

func (h *RegistrationHandler) VerifyEmail(c *fiber.Ctx) error {
	token := c.Query("token")
	reg, err := h.svc.VerifyEmail(c.Context(), token)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{
		"message": "email verified",
		"id":      reg.ID,
		"email":   reg.Email,
	})
}

func (h *RegistrationHandler) AdminList(c *fiber.Ctx) error {
	lp := &repository.ListParams{
		Search:   c.Query("search"),
		Filters:  make(map[string]any),
		Sort:     parseSorts(c.Query("sort")),
		Page:     atoiDefault(c.Query("page"), 1),
		PageSize: atoiDefault(c.Query("page_size"), 20),
	}

	// Filter equals; izinkan beberapa field umum
	if v := c.Query("status"); v != "" {
		lp.Filters["status"] = v
	}
	if v := c.Query("program"); v != "" {
		lp.Filters["program"] = v
	}
	if v := c.Query("intake_year"); v != "" {
		lp.Filters["intake_year"] = v
	}
	if v := c.Query("email"); v != "" {
		lp.Filters["email"] = v
	}

	res, err := h.svc.AdminList(c.Context(), lp)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(res)
}

func (h *RegistrationHandler) AdminGet(c *fiber.Ctx) error {
	id := c.Params("id")
	r, err := h.svc.AdminGet(c.Context(), id)
	if err != nil {
		return c.Status(http.StatusNotFound).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(r)
}

type approveReq struct {
	AdminID string `json:"admin_id"`
}

func (h *RegistrationHandler) AdminApprove(c *fiber.Ctx) error {
	id := c.Params("id")
	var req approveReq
	_ = c.BodyParser(&req)
	if req.AdminID == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "admin_id required"})
	}
	r, err := h.svc.AdminApprove(c.Context(), id, req.AdminID)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(r)
}

type rejectReq struct {
	AdminID string `json:"admin_id"`
	Reason  string `json:"reason"`
}

func (h *RegistrationHandler) AdminReject(c *fiber.Ctx) error {
	id := c.Params("id")
	var req rejectReq
	_ = c.BodyParser(&req)
	if req.AdminID == "" || strings.TrimSpace(req.Reason) == "" {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": "admin_id and reason required"})
	}
	r, err := h.svc.AdminReject(c.Context(), id, req.AdminID, req.Reason)
	if err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(r)
}

func (h *RegistrationHandler) AdminDelete(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := h.svc.AdminDelete(c.Context(), id); err != nil {
		return c.Status(http.StatusBadRequest).JSON(fiber.Map{"error": err.Error()})
	}
	return c.SendStatus(http.StatusNoContent)
}

func atoiDefault(s string, def int) int {
	if s == "" {
		return def
	}
	if v, err := strconv.Atoi(s); err == nil && v > 0 {
		return v
	}
	return def
}

func parseSorts(s string) []string {
	if s == "" {
		return nil
	}
	parts := strings.Split(s, ",")
	var out []string
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p != "" {
			out = append(out, p)
		}
	}
	return out
}
