package rest

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/daisyorscry/itts/core"
	"github.com/go-chi/chi/v5"

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

func (h *RegistrationHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req service.RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid body", nil)
		return
	}
	reg, err := h.svc.Register(r.Context(), req, h.verifyEmailURL)
	if err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "REGISTER_FAILED", err.Error(), nil)
		return
	}
	core.Created(w, r, map[string]any{
		"id":      reg.ID,
		"email":   reg.Email,
		"status":  reg.Status,
		"message": "Your registration has been received. Please check your email. We will approve it soon",
	})
}

func (h *RegistrationHandler) VerifyEmail(w http.ResponseWriter, r *http.Request) {
	token := r.URL.Query().Get("token")
	reg, err := h.svc.VerifyEmail(r.Context(), token)
	if err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "VERIFY_FAILED", err.Error(), nil)
		return
	}
	core.OK(w, r, map[string]any{
		"message": "email verified",
		"id":      reg.ID,
		"email":   reg.Email,
	})
}

func (h *RegistrationHandler) AdminList(w http.ResponseWriter, r *http.Request) {
	lp := &repository.ListParams{
		Search:   r.URL.Query().Get("search"),
		Filters:  make(map[string]any),
		Sort:     parseSorts(r.URL.Query().Get("sort")),
		Page:     atoiDefault(r.URL.Query().Get("page"), 1),
		PageSize: atoiDefault(r.URL.Query().Get("page_size"), 20),
	}

	// Filter equals; izinkan beberapa field umum
	if v := r.URL.Query().Get("status"); v != "" {
		lp.Filters["status"] = v
	}
	if v := r.URL.Query().Get("program"); v != "" {
		lp.Filters["program"] = v
	}
	if v := r.URL.Query().Get("intake_year"); v != "" {
		lp.Filters["intake_year"] = v
	}
	if v := r.URL.Query().Get("email"); v != "" {
		lp.Filters["email"] = v
	}

	res, err := h.svc.AdminList(r.Context(), lp)
	if err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "LIST_FAILED", err.Error(), nil)
		return
	}
	core.OK(w, r, res)
}

func (h *RegistrationHandler) AdminGet(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	rec, err := h.svc.AdminGet(r.Context(), id)
	if err != nil {
		core.WriteError(w, r, http.StatusNotFound, "NOT_FOUND", err.Error(), nil)
		return
	}
	core.OK(w, r, rec)
}

type approveReq struct {
	AdminID string `json:"admin_id"`
}

func (h *RegistrationHandler) AdminApprove(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req approveReq
	_ = json.NewDecoder(r.Body).Decode(&req)
	if req.AdminID == "" {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "admin_id required", nil)
		return
	}
	rec, err := h.svc.AdminApprove(r.Context(), id, req.AdminID)
	if err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "APPROVE_FAILED", err.Error(), nil)
		return
	}
	core.OK(w, r, rec)
}

type rejectReq struct {
	AdminID string `json:"admin_id"`
	Reason  string `json:"reason"`
}

func (h *RegistrationHandler) AdminReject(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	var req rejectReq
	_ = json.NewDecoder(r.Body).Decode(&req)
	if req.AdminID == "" || strings.TrimSpace(req.Reason) == "" {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "admin_id and reason required", nil)
		return
	}
	rec, err := h.svc.AdminReject(r.Context(), id, req.AdminID, req.Reason)
	if err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "REJECT_FAILED", err.Error(), nil)
		return
	}
	core.OK(w, r, rec)
}

func (h *RegistrationHandler) AdminDelete(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if err := h.svc.AdminDelete(r.Context(), id); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "DELETE_FAILED", err.Error(), nil)
		return
	}
	core.NoContent(w, r)
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
