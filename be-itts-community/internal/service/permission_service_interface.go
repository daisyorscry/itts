package service

import (
	"context"

	"be-itts-community/internal/model"
)

// PermissionService handles authorization and permission operations
type PermissionService interface {
	// Authorization
	CheckPermission(ctx context.Context, userID string, permission string) (bool, error)
	GetUserPermissions(ctx context.Context, userID string) ([]string, error)

	// Role Management
	CreateRole(ctx context.Context, req model.CreateRoleRequest) (*model.RoleResponse, error)
	GetRole(ctx context.Context, roleID string) (*model.RoleResponse, error)
	ListRoles(ctx context.Context, search string, page, pageSize int, filters map[string]interface{}) (*model.PageResult[model.RoleResponse], error)
	UpdateRole(ctx context.Context, roleID string, req model.UpdateRoleRequest) (*model.RoleResponse, error)
	DeleteRole(ctx context.Context, roleID string) error

	// Role Permissions
	AssignPermissionsToRole(ctx context.Context, roleID string, permissionIDs []string) error
	RemovePermissionsFromRole(ctx context.Context, roleID string, permissionIDs []string) error
	GetRolePermissions(ctx context.Context, roleID string) ([]model.PermissionResponse, error)

	// Permission Queries
	GetPermission(ctx context.Context, permissionID string) (*model.PermissionResponse, error)
	ListPermissions(ctx context.Context, search string, page, pageSize int, filters map[string]interface{}) (*model.PageResult[model.PermissionResponse], error)

	// Resource & Action Queries
	ListResources(ctx context.Context) ([]model.ResourceResponse, error)
	ListActions(ctx context.Context) ([]model.ActionResponse, error)
}
