package rest

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/daisyorscry/itts/core"

	"be-itts-community/internal/model"
	"be-itts-community/internal/service"
)

type RoleHandler struct {
	permissionService service.PermissionService
}

func NewRoleHandler(permissionService service.PermissionService) *RoleHandler {
	return &RoleHandler{
		permissionService: permissionService,
	}
}

// CreateRole handles role creation
func (h *RoleHandler) CreateRole(w http.ResponseWriter, r *http.Request) {
	var req model.CreateRoleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid request body", nil)
		return
	}

	role, err := h.permissionService.CreateRole(r.Context(), req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.Created(w, r, role)
}

// GetRole retrieves role by ID
func (h *RoleHandler) GetRole(w http.ResponseWriter, r *http.Request) {
	roleID := chi.URLParam(r, "id")

	role, err := h.permissionService.GetRole(r.Context(), roleID)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, role)
}

// ListRoles lists roles with pagination
func (h *RoleHandler) ListRoles(w http.ResponseWriter, r *http.Request) {
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
	if isSystem := r.URL.Query().Get("is_system"); isSystem != "" {
		filters["is_system"] = isSystem == "true"
	}

	result, err := h.permissionService.ListRoles(r.Context(), search, page, pageSize, filters)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, result)
}

// UpdateRole updates role information
func (h *RoleHandler) UpdateRole(w http.ResponseWriter, r *http.Request) {
	roleID := chi.URLParam(r, "id")

	var req model.UpdateRoleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid request body", nil)
		return
	}

	role, err := h.permissionService.UpdateRole(r.Context(), roleID, req)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, role)
}

// DeleteRole deletes a role
func (h *RoleHandler) DeleteRole(w http.ResponseWriter, r *http.Request) {
	roleID := chi.URLParam(r, "id")

	if err := h.permissionService.DeleteRole(r.Context(), roleID); err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.NoContent(w, r)
}

// GetRolePermissions retrieves all permissions for a role
func (h *RoleHandler) GetRolePermissions(w http.ResponseWriter, r *http.Request) {
	roleID := chi.URLParam(r, "id")

	permissions, err := h.permissionService.GetRolePermissions(r.Context(), roleID)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, permissions)
}

// AssignPermissions assigns permissions to a role
func (h *RoleHandler) AssignPermissions(w http.ResponseWriter, r *http.Request) {
	roleID := chi.URLParam(r, "id")

	var req struct {
		PermissionIDs []string `json:"permission_ids"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid request body", nil)
		return
	}

	if err := h.permissionService.AssignPermissionsToRole(r.Context(), roleID, req.PermissionIDs); err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.NoContent(w, r)
}

// RemovePermissions removes permissions from a role
func (h *RoleHandler) RemovePermissions(w http.ResponseWriter, r *http.Request) {
	roleID := chi.URLParam(r, "id")

	var req struct {
		PermissionIDs []string `json:"permission_ids"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_BODY", "invalid request body", nil)
		return
	}

	if err := h.permissionService.RemovePermissionsFromRole(r.Context(), roleID, req.PermissionIDs); err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.NoContent(w, r)
}
