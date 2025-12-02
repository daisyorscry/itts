package repository

import (
	"context"

	"be-itts-community/internal/model"
)

// PermissionRepository handles role and permission data operations
type PermissionRepository interface {
	// Role CRUD
	CreateRole(ctx context.Context, role *model.Role) error
	GetRoleByID(ctx context.Context, id string) (*model.Role, error)
	GetRoleByName(ctx context.Context, name string) (*model.Role, error)
	ListRoles(ctx context.Context, params ListParams) (*PageResult[model.Role], error)
	UpdateRole(ctx context.Context, role *model.Role) error
	DeleteRole(ctx context.Context, id string) error

	// Role with Relations
	GetRoleWithPermissions(ctx context.Context, id string) (*model.Role, error)
	GetRolesByIDs(ctx context.Context, roleIDs []string) ([]model.Role, error)

	// Role Permission Operations
	AssignPermissionsToRole(ctx context.Context, roleID string, permissionIDs []string) error
	RemovePermissionsFromRole(ctx context.Context, roleID string, permissionIDs []string) error
	GetRolePermissions(ctx context.Context, roleID string) ([]model.Permission, error)

	// Permission CRUD (mostly read-only, permissions are seeded)
	GetPermissionByID(ctx context.Context, id string) (*model.Permission, error)
	GetPermissionByName(ctx context.Context, name string) (*model.Permission, error)
	ListPermissions(ctx context.Context, params ListParams) (*PageResult[model.Permission], error)
	GetPermissionsByIDs(ctx context.Context, permissionIDs []string) ([]model.Permission, error)

	// Resource & Action (read-only)
	ListResources(ctx context.Context) ([]model.Resource, error)
	ListActions(ctx context.Context) ([]model.Action, error)
	GetResourceByName(ctx context.Context, name string) (*model.Resource, error)
	GetActionByName(ctx context.Context, name string) (*model.Action, error)

	// Helper Queries
	CheckUserHasPermission(ctx context.Context, userID string, permissionName string) (bool, error)
	GetUserPermissionNames(ctx context.Context, userID string) ([]string, error)

	// Transaction support
	RunInTransaction(ctx context.Context, fn func(txCtx context.Context) error) error
}
