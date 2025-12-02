package rest

import (
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/daisyorscry/itts/core"

	"be-itts-community/internal/service"
)

type PermissionHandler struct {
	permissionService service.PermissionService
}

func NewPermissionHandler(permissionService service.PermissionService) *PermissionHandler {
	return &PermissionHandler{
		permissionService: permissionService,
	}
}

// GetPermission retrieves permission by ID
func (h *PermissionHandler) GetPermission(w http.ResponseWriter, r *http.Request) {
	permissionID := chi.URLParam(r, "id")

	permission, err := h.permissionService.GetPermission(r.Context(), permissionID)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, permission)
}

// ListPermissions lists permissions with pagination
func (h *PermissionHandler) ListPermissions(w http.ResponseWriter, r *http.Request) {
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
	if resourceID := r.URL.Query().Get("resource_id"); resourceID != "" {
		filters["resource_id"] = resourceID
	}
	if actionID := r.URL.Query().Get("action_id"); actionID != "" {
		filters["action_id"] = actionID
	}

	result, err := h.permissionService.ListPermissions(r.Context(), search, page, pageSize, filters)
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, result)
}

// ListResources lists all resources
func (h *PermissionHandler) ListResources(w http.ResponseWriter, r *http.Request) {
	resources, err := h.permissionService.ListResources(r.Context())
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, resources)
}

// ListActions lists all actions
func (h *PermissionHandler) ListActions(w http.ResponseWriter, r *http.Request) {
	actions, err := h.permissionService.ListActions(r.Context())
	if err != nil {
		core.RespondError(w, r, err)
		return
	}

	core.OK(w, r, actions)
}
