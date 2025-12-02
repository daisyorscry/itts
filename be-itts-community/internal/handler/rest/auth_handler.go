package rest

import (
	"encoding/json"
	"net/http"

	"github.com/daisyorscry/itts/core"

	"be-itts-community/internal/middleware"
	"be-itts-community/internal/model"
	"be-itts-community/internal/service"
)

type AuthHandler struct {
	authService service.AuthService
}

func NewAuthHandler(authService service.AuthService) *AuthHandler {
	return &AuthHandler{
		authService: authService,
	}
}

// Login handles user login
func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req model.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid request body", nil)
		return
	}

	resp, err := h.authService.Login(r.Context(), req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, resp)
}

// RefreshToken handles token refresh
func (h *AuthHandler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	var req model.RefreshTokenRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid request body", nil)
		return
	}

	resp, err := h.authService.RefreshToken(r.Context(), req.RefreshToken)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, resp)
}

// Logout handles user logout
func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	var req model.RefreshTokenRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid request body", nil)
		return
	}

	if err := h.authService.Logout(r.Context(), req.RefreshToken); err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.NoContent(w, r)
}

// Me returns current user info
func (h *AuthHandler) Me(w http.ResponseWriter, r *http.Request) {
	authCtx := middleware.MustGetAuthContext(r.Context())

	user, err := h.authService.GetCurrentUser(r.Context(), authCtx.UserID)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, user)
}

// ChangePassword handles password change
func (h *AuthHandler) ChangePassword(w http.ResponseWriter, r *http.Request) {
	authCtx := middleware.MustGetAuthContext(r.Context())

	var req model.ChangePasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid request body", nil)
		return
	}

	if err := h.authService.ChangePassword(r.Context(), authCtx.UserID, req); err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.NoContent(w, r)
}
