package rest

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/daisyorscry/itts/core"

	"be-itts-community/internal/middleware"
	"be-itts-community/internal/model"
	"be-itts-community/internal/service"
)

type UserHandler struct {
	authService service.AuthService
}

func NewUserHandler(authService service.AuthService) *UserHandler {
	return &UserHandler{
		authService: authService,
	}
}

// CreateUser handles user creation
func (h *UserHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
	authCtx := middleware.MustGetAuthContext(r.Context())

	var req model.CreateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid request body", nil)
		return
	}

	user, err := h.authService.CreateUser(r.Context(), req, authCtx.UserID)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.Created(w, r, user)
}

// GetUser retrieves user by ID
func (h *UserHandler) GetUser(w http.ResponseWriter, r *http.Request) {
	userID := chi.URLParam(r, "id")

	user, err := h.authService.GetUser(r.Context(), userID)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, user)
}

// ListUsers lists users with pagination
func (h *UserHandler) ListUsers(w http.ResponseWriter, r *http.Request) {
	// Parse query params
	page, _ := strconv.Atoi(r.URL.Query().Get("page"))
	if page <= 0 {
		page = 1
	}

	pageSize, _ := strconv.Atoi(r.URL.Query().Get("page_size"))
	if pageSize <= 0 {
		pageSize = 20
	}

	search := r.URL.Query().Get("search")

	// Parse filters
	filters := make(map[string]interface{})
	if isActive := r.URL.Query().Get("is_active"); isActive != "" {
		filters["is_active"] = isActive == "true"
	}
	if isSuperAdmin := r.URL.Query().Get("is_super_admin"); isSuperAdmin != "" {
		filters["is_super_admin"] = isSuperAdmin == "true"
	}

	result, err := h.authService.ListUsers(r.Context(), search, page, pageSize, filters)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, result)
}

// UpdateUser updates user information
func (h *UserHandler) UpdateUser(w http.ResponseWriter, r *http.Request) {
	userID := chi.URLParam(r, "id")

	var req model.UpdateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid request body", nil)
		return
	}

	user, err := h.authService.UpdateUser(r.Context(), userID, req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, user)
}

// DeleteUser deletes a user
func (h *UserHandler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	userID := chi.URLParam(r, "id")

	if err := h.authService.DeleteUser(r.Context(), userID); err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.NoContent(w, r)
}

// ResetPassword resets user password (admin only)
func (h *UserHandler) ResetPassword(w http.ResponseWriter, r *http.Request) {
	userID := chi.URLParam(r, "id")

	var req model.ResetPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid request body", nil)
		return
	}

	if err := h.authService.ResetPassword(r.Context(), userID, req.NewPassword); err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.NoContent(w, r)
}

// AssignRoles assigns roles to user
func (h *UserHandler) AssignRoles(w http.ResponseWriter, r *http.Request) {
	authCtx := middleware.MustGetAuthContext(r.Context())
	userID := chi.URLParam(r, "id")

	var req model.AssignRoleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid request body", nil)
		return
	}

	if err := h.authService.AssignRolesToUser(r.Context(), userID, req, authCtx.UserID); err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.NoContent(w, r)
}

// RemoveRoles removes roles from user
func (h *UserHandler) RemoveRoles(w http.ResponseWriter, r *http.Request) {
	userID := chi.URLParam(r, "id")

	var req struct {
		RoleIDs []string `json:"role_ids"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid request body", nil)
		return
	}

	if err := h.authService.RemoveRolesFromUser(r.Context(), userID, req.RoleIDs); err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.NoContent(w, r)
}
