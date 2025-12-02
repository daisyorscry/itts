package service

import (
	"context"
	"errors"
	"fmt"

	"github.com/daisyorscry/itts/core"
	"gorm.io/gorm"

	"be-itts-community/internal/model"
	"be-itts-community/internal/repository"
	"be-itts-community/pkg/observability/nr"
)

type permissionService struct {
	permissionRepo repository.PermissionRepository
	auditRepo      repository.AuditLogRepository
	tracer         nr.Tracer
}

// NewPermissionService creates a new permission service
func NewPermissionService(
	permissionRepo repository.PermissionRepository,
	auditRepo repository.AuditLogRepository,
	tracer nr.Tracer,
) PermissionService {
	return &permissionService{
		permissionRepo: permissionRepo,
		auditRepo:      auditRepo,
		tracer:         tracer,
	}
}

// CheckPermission checks if user has specific permission
func (s *permissionService) CheckPermission(ctx context.Context, userID string, permission string) (bool, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "PermissionService.CheckPermission")()
	}

	hasPermission, err := s.permissionRepo.CheckUserHasPermission(ctx, userID, permission)
	if err != nil {
		return false, fmt.Errorf("failed to check permission: %w", err)
	}

	return hasPermission, nil
}

// GetUserPermissions retrieves all permissions for a user
func (s *permissionService) GetUserPermissions(ctx context.Context, userID string) ([]string, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "PermissionService.GetUserPermissions")()
	}

	permissions, err := s.permissionRepo.GetUserPermissionNames(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user permissions: %w", err)
	}

	return permissions, nil
}

// CreateRole creates a new role
func (s *permissionService) CreateRole(ctx context.Context, req model.CreateRoleRequest) (*model.RoleResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "PermissionService.CreateRole")()
	}

	// Check if role name already exists
	existing, err := s.permissionRepo.GetRoleByName(ctx, req.Name)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, fmt.Errorf("failed to check existing role: %w", err)
	}
	if existing != nil {
		return nil, core.Conflict("Role name already exists")
	}

	// Create role
	role := &model.Role{
		Name:         req.Name,
		Description:  req.Description,
		ParentRoleID: req.ParentRoleID,
		IsSystem:     false, // User-created roles are not system roles
	}

	// Save role and assign permissions in transaction
	var roleResp *model.RoleResponse
	err = s.permissionRepo.RunInTransaction(ctx, func(txCtx context.Context) error {
		// Create role
		if err := s.permissionRepo.CreateRole(txCtx, role); err != nil {
			return err
		}

		// Assign permissions if provided
		if len(req.PermissionIDs) > 0 {
			if err := s.permissionRepo.AssignPermissionsToRole(txCtx, role.ID, req.PermissionIDs); err != nil {
				return err
			}
		}

		// Get role with permissions
		roleWithPerms, err := s.permissionRepo.GetRoleWithPermissions(txCtx, role.ID)
		if err != nil {
			return err
		}

		resp := roleWithPerms.ToRoleResponse()
		roleResp = &resp
		return nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to create role: %w", err)
	}

	// Audit log
	adminID := getUserIDFromContext(ctx)
	s.auditLog(ctx, adminID, "role.create", strPtr("roles"), &role.ID, map[string]interface{}{
		"role_name": role.Name,
	})

	return roleResp, nil
}

// GetRole retrieves role by ID
func (s *permissionService) GetRole(ctx context.Context, roleID string) (*model.RoleResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "PermissionService.GetRole")()
	}

	role, err := s.permissionRepo.GetRoleWithPermissions(ctx, roleID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, core.NotFound("role", roleID)
		}
		return nil, fmt.Errorf("failed to get role: %w", err)
	}

	resp := role.ToRoleResponse()
	return &resp, nil
}

// ListRoles lists roles with pagination
func (s *permissionService) ListRoles(ctx context.Context, search string, page, pageSize int, filters map[string]interface{}) (*model.PageResult[model.RoleResponse], error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "PermissionService.ListRoles")()
	}

	params := repository.ListParams{
		Search:   search,
		Page:     page,
		PageSize: pageSize,
		Filters:  filters,
		Sort:     []string{"name"},
	}

	result, err := s.permissionRepo.ListRoles(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("failed to list roles: %w", err)
	}

	// Convert to response DTOs
	respData := make([]model.RoleResponse, len(result.Data))
	for i, role := range result.Data {
		respData[i] = role.ToRoleResponse()
	}

	return &model.PageResult[model.RoleResponse]{
		Data:       respData,
		Total:      result.Total,
		Page:       result.Page,
		PageSize:   result.PageSize,
		TotalPages: result.TotalPages,
	}, nil
}

// UpdateRole updates role information
func (s *permissionService) UpdateRole(ctx context.Context, roleID string, req model.UpdateRoleRequest) (*model.RoleResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "PermissionService.UpdateRole")()
	}

	// Get existing role
	role, err := s.permissionRepo.GetRoleByID(ctx, roleID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, core.NotFound("role", roleID)
		}
		return nil, fmt.Errorf("failed to get role: %w", err)
	}

	// Prevent updating system roles
	if role.IsSystem {
		return nil, core.Forbidden("Cannot update system role")
	}

	// Update fields if provided
	if req.Name != nil {
		// Check name uniqueness
		existing, err := s.permissionRepo.GetRoleByName(ctx, *req.Name)
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("failed to check role name: %w", err)
		}
		if existing != nil && existing.ID != roleID {
			return nil, core.Conflict("Role name already exists")
		}
		role.Name = *req.Name
	}
	if req.Description != nil {
		role.Description = req.Description
	}
	if req.ParentRoleID != nil {
		role.ParentRoleID = req.ParentRoleID
	}

	// Update role and permissions in transaction
	var roleResp *model.RoleResponse
	err = s.permissionRepo.RunInTransaction(ctx, func(txCtx context.Context) error {
		// Update role
		if err := s.permissionRepo.UpdateRole(txCtx, role); err != nil {
			return err
		}

		// Update permissions if provided
		if req.PermissionIDs != nil {
			// Remove all existing permissions
			existingPerms, _ := s.permissionRepo.GetRolePermissions(txCtx, roleID)
			if len(existingPerms) > 0 {
				permIDs := make([]string, len(existingPerms))
				for i, perm := range existingPerms {
					permIDs[i] = perm.ID
				}
				if err := s.permissionRepo.RemovePermissionsFromRole(txCtx, roleID, permIDs); err != nil {
					return err
				}
			}

			// Assign new permissions
			if len(req.PermissionIDs) > 0 {
				if err := s.permissionRepo.AssignPermissionsToRole(txCtx, roleID, req.PermissionIDs); err != nil {
					return err
				}
			}
		}

		// Get updated role with permissions
		updatedRole, err := s.permissionRepo.GetRoleWithPermissions(txCtx, roleID)
		if err != nil {
			return err
		}

		resp := updatedRole.ToRoleResponse()
		roleResp = &resp
		return nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to update role: %w", err)
	}

	// Audit log
	adminID := getUserIDFromContext(ctx)
	s.auditLog(ctx, adminID, "role.update", strPtr("roles"), &roleID, map[string]interface{}{
		"role_name": role.Name,
	})

	return roleResp, nil
}

// DeleteRole deletes a role
func (s *permissionService) DeleteRole(ctx context.Context, roleID string) error {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "PermissionService.DeleteRole")()
	}

	// Get role
	role, err := s.permissionRepo.GetRoleByID(ctx, roleID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return core.NotFound("role", roleID)
		}
		return fmt.Errorf("failed to get role: %w", err)
	}

	// Prevent deletion of system roles
	if role.IsSystem {
		return core.Forbidden("Cannot delete system role")
	}

	// Delete role
	if err := s.permissionRepo.DeleteRole(ctx, roleID); err != nil {
		return fmt.Errorf("failed to delete role: %w", err)
	}

	// Audit log
	adminID := getUserIDFromContext(ctx)
	s.auditLog(ctx, adminID, "role.delete", strPtr("roles"), &roleID, map[string]interface{}{
		"role_name": role.Name,
	})

	return nil
}

// AssignPermissionsToRole assigns permissions to a role
func (s *permissionService) AssignPermissionsToRole(ctx context.Context, roleID string, permissionIDs []string) error {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "PermissionService.AssignPermissionsToRole")()
	}

	// Check if role exists
	role, err := s.permissionRepo.GetRoleByID(ctx, roleID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return core.NotFound("role", roleID)
		}
		return fmt.Errorf("failed to get role: %w", err)
	}

	// Prevent updating system roles
	if role.IsSystem {
		return core.Forbidden("Cannot modify system role permissions")
	}

	// Assign permissions
	if err := s.permissionRepo.AssignPermissionsToRole(ctx, roleID, permissionIDs); err != nil {
		return fmt.Errorf("failed to assign permissions: %w", err)
	}

	// Audit log
	adminID := getUserIDFromContext(ctx)
	s.auditLog(ctx, adminID, "role.permissions.assign", strPtr("roles"), &roleID, map[string]interface{}{
		"permission_ids": permissionIDs,
	})

	return nil
}

// RemovePermissionsFromRole removes permissions from a role
func (s *permissionService) RemovePermissionsFromRole(ctx context.Context, roleID string, permissionIDs []string) error {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "PermissionService.RemovePermissionsFromRole")()
	}

	// Check if role exists
	role, err := s.permissionRepo.GetRoleByID(ctx, roleID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return core.NotFound("role", roleID)
		}
		return fmt.Errorf("failed to get role: %w", err)
	}

	// Prevent updating system roles
	if role.IsSystem {
		return core.Forbidden("Cannot modify system role permissions")
	}

	// Remove permissions
	if err := s.permissionRepo.RemovePermissionsFromRole(ctx, roleID, permissionIDs); err != nil {
		return fmt.Errorf("failed to remove permissions: %w", err)
	}

	// Audit log
	adminID := getUserIDFromContext(ctx)
	s.auditLog(ctx, adminID, "role.permissions.remove", strPtr("roles"), &roleID, map[string]interface{}{
		"permission_ids": permissionIDs,
	})

	return nil
}

// GetRolePermissions retrieves all permissions for a role
func (s *permissionService) GetRolePermissions(ctx context.Context, roleID string) ([]model.PermissionResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "PermissionService.GetRolePermissions")()
	}

	permissions, err := s.permissionRepo.GetRolePermissions(ctx, roleID)
	if err != nil {
		return nil, fmt.Errorf("failed to get role permissions: %w", err)
	}

	respData := make([]model.PermissionResponse, len(permissions))
	for i, perm := range permissions {
		respData[i] = perm.ToPermissionResponse()
	}

	return respData, nil
}

// GetPermission retrieves permission by ID
func (s *permissionService) GetPermission(ctx context.Context, permissionID string) (*model.PermissionResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "PermissionService.GetPermission")()
	}

	permission, err := s.permissionRepo.GetPermissionByID(ctx, permissionID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, core.NotFound("permission", permissionID)
		}
		return nil, fmt.Errorf("failed to get permission: %w", err)
	}

	resp := permission.ToPermissionResponse()
	return &resp, nil
}

// ListPermissions lists permissions with pagination
func (s *permissionService) ListPermissions(ctx context.Context, search string, page, pageSize int, filters map[string]interface{}) (*model.PageResult[model.PermissionResponse], error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "PermissionService.ListPermissions")()
	}

	params := repository.ListParams{
		Search:   search,
		Page:     page,
		PageSize: pageSize,
		Filters:  filters,
		Sort:     []string{"name"},
	}

	result, err := s.permissionRepo.ListPermissions(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("failed to list permissions: %w", err)
	}

	// Convert to response DTOs
	respData := make([]model.PermissionResponse, len(result.Data))
	for i, perm := range result.Data {
		respData[i] = perm.ToPermissionResponse()
	}

	return &model.PageResult[model.PermissionResponse]{
		Data:       respData,
		Total:      result.Total,
		Page:       result.Page,
		PageSize:   result.PageSize,
		TotalPages: result.TotalPages,
	}, nil
}

// ListResources lists all resources
func (s *permissionService) ListResources(ctx context.Context) ([]model.ResourceResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "PermissionService.ListResources")()
	}

	resources, err := s.permissionRepo.ListResources(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to list resources: %w", err)
	}

	respData := make([]model.ResourceResponse, len(resources))
	for i, res := range resources {
		respData[i] = model.ResourceResponse{
			ID:          res.ID,
			Name:        res.Name,
			Description: res.Description,
			CreatedAt:   res.CreatedAt,
			UpdatedAt:   res.UpdatedAt,
		}
	}

	return respData, nil
}

// ListActions lists all actions
func (s *permissionService) ListActions(ctx context.Context) ([]model.ActionResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "PermissionService.ListActions")()
	}

	actions, err := s.permissionRepo.ListActions(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to list actions: %w", err)
	}

	respData := make([]model.ActionResponse, len(actions))
	for i, act := range actions {
		respData[i] = model.ActionResponse{
			ID:          act.ID,
			Name:        act.Name,
			Description: act.Description,
			CreatedAt:   act.CreatedAt,
			UpdatedAt:   act.UpdatedAt,
		}
	}

	return respData, nil
}

// Helper: audit logging
func (s *permissionService) auditLog(ctx context.Context, userID *string, action string, resourceType *string, resourceID *string, metadata map[string]interface{}) {
	log := &model.AuditLog{
		UserID:       userID,
		Action:       action,
		ResourceType: resourceType,
		ResourceID:   resourceID,
		Metadata:     metadata,
		IPAddress:    getIPFromContext(ctx),
		UserAgent:    getUserAgentFromContext(ctx),
	}

	// Non-blocking audit log
	go func() {
		_ = s.auditRepo.CreateAuditLog(context.Background(), log)
	}()
}
