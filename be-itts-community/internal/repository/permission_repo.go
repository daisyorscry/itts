package repository

import (
	"context"
	"fmt"
	"time"

	"be-itts-community/internal/db"
	"be-itts-community/internal/model"
)

type permissionRepository struct {
	db db.Connection
}

// NewPermissionRepository creates a new permission repository
func NewPermissionRepository(conn db.Connection) PermissionRepository {
	return &permissionRepository{db: conn}
}

// ===== ROLE OPERATIONS =====

// CreateRole creates a new role
func (r *permissionRepository) CreateRole(ctx context.Context, role *model.Role) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "roles", "INSERT")()
	}

	return r.db.Get(ctx).Create(role).Error
}

// GetRoleByID retrieves role by ID
func (r *permissionRepository) GetRoleByID(ctx context.Context, id string) (*model.Role, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "roles", "SELECT")()
	}

	var role model.Role
	err := r.db.Get(ctx).Where("id = ?", id).First(&role).Error
	if err != nil {
		return nil, err
	}
	return &role, nil
}

// GetRoleByName retrieves role by name
func (r *permissionRepository) GetRoleByName(ctx context.Context, name string) (*model.Role, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "roles", "SELECT")()
	}

	var role model.Role
	err := r.db.Get(ctx).Where("name = ?", name).First(&role).Error
	if err != nil {
		return nil, err
	}
	return &role, nil
}

// ListRoles lists roles with pagination
func (r *permissionRepository) ListRoles(ctx context.Context, params ListParams) (*PageResult[model.Role], error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "roles", "SELECT")()
	}

	query := r.db.Get(ctx).Model(&model.Role{})

	// Search
	if params.Search != "" {
		searchPattern := "%" + params.Search + "%"
		query = query.Where("name ILIKE ? OR description ILIKE ?", searchPattern, searchPattern)
	}

	// Filters
	if isSystem, ok := params.Filters["is_system"].(bool); ok {
		query = query.Where("is_system = ?", isSystem)
	}

	var roles []model.Role
	return Paginate(ctx, query, &params, &roles)
}

// UpdateRole updates role information
func (r *permissionRepository) UpdateRole(ctx context.Context, role *model.Role) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "roles", "UPDATE")()
	}

	role.UpdatedAt = time.Now()
	return r.db.Get(ctx).Save(role).Error
}

// DeleteRole deletes a role (only if not system role)
func (r *permissionRepository) DeleteRole(ctx context.Context, id string) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "roles", "DELETE")()
	}

	// Prevent deletion of system roles
	var role model.Role
	if err := r.db.Get(ctx).Where("id = ?", id).First(&role).Error; err != nil {
		return err
	}

	if role.IsSystem {
		return fmt.Errorf("cannot delete system role")
	}

	return r.db.Get(ctx).Where("id = ?", id).Delete(&model.Role{}).Error
}

// GetRoleWithPermissions retrieves role with preloaded permissions
func (r *permissionRepository) GetRoleWithPermissions(ctx context.Context, id string) (*model.Role, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "roles", "SELECT")()
	}

	var role model.Role
	err := r.db.Get(ctx).
		Preload("Permissions").
		Preload("Permissions.Resource").
		Preload("Permissions.Action").
		Where("id = ?", id).
		First(&role).Error
	if err != nil {
		return nil, err
	}
	return &role, nil
}

// GetRolesByIDs retrieves multiple roles by IDs
func (r *permissionRepository) GetRolesByIDs(ctx context.Context, roleIDs []string) ([]model.Role, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "roles", "SELECT")()
	}

	var roles []model.Role
	err := r.db.Get(ctx).Where("id IN ?", roleIDs).Find(&roles).Error
	if err != nil {
		return nil, err
	}
	return roles, nil
}

// ===== ROLE PERMISSION OPERATIONS =====

// AssignPermissionsToRole assigns permissions to a role
func (r *permissionRepository) AssignPermissionsToRole(ctx context.Context, roleID string, permissionIDs []string) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "role_permissions", "INSERT")()
	}

	db := r.db.Get(ctx)

	// Remove existing permissions first
	err := db.Where("role_id = ? AND permission_id IN ?", roleID, permissionIDs).
		Delete(&model.RolePermission{}).Error
	if err != nil {
		return fmt.Errorf("failed to remove existing permissions: %w", err)
	}

	// Insert new permission assignments
	for _, permissionID := range permissionIDs {
		rolePermission := model.RolePermission{
			RoleID:       roleID,
			PermissionID: permissionID,
		}
		if err := db.Create(&rolePermission).Error; err != nil {
			return fmt.Errorf("failed to assign permission %s: %w", permissionID, err)
		}
	}

	return nil
}

// RemovePermissionsFromRole removes permissions from a role
func (r *permissionRepository) RemovePermissionsFromRole(ctx context.Context, roleID string, permissionIDs []string) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "role_permissions", "DELETE")()
	}

	return r.db.Get(ctx).
		Where("role_id = ? AND permission_id IN ?", roleID, permissionIDs).
		Delete(&model.RolePermission{}).Error
}

// GetRolePermissions retrieves all permissions for a role
func (r *permissionRepository) GetRolePermissions(ctx context.Context, roleID string) ([]model.Permission, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "permissions", "SELECT")()
	}

	var permissions []model.Permission
	err := r.db.Get(ctx).
		Joins("JOIN role_permissions ON role_permissions.permission_id = permissions.id").
		Where("role_permissions.role_id = ?", roleID).
		Preload("Resource").
		Preload("Action").
		Find(&permissions).Error
	if err != nil {
		return nil, err
	}
	return permissions, nil
}

// ===== PERMISSION OPERATIONS =====

// GetPermissionByID retrieves permission by ID
func (r *permissionRepository) GetPermissionByID(ctx context.Context, id string) (*model.Permission, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "permissions", "SELECT")()
	}

	var permission model.Permission
	err := r.db.Get(ctx).
		Preload("Resource").
		Preload("Action").
		Where("id = ?", id).
		First(&permission).Error
	if err != nil {
		return nil, err
	}
	return &permission, nil
}

// GetPermissionByName retrieves permission by name
func (r *permissionRepository) GetPermissionByName(ctx context.Context, name string) (*model.Permission, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "permissions", "SELECT")()
	}

	var permission model.Permission
	err := r.db.Get(ctx).
		Preload("Resource").
		Preload("Action").
		Where("name = ?", name).
		First(&permission).Error
	if err != nil {
		return nil, err
	}
	return &permission, nil
}

// ListPermissions lists permissions with pagination
func (r *permissionRepository) ListPermissions(ctx context.Context, params ListParams) (*PageResult[model.Permission], error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "permissions", "SELECT")()
	}

	query := r.db.Get(ctx).Model(&model.Permission{}).
		Preload("Resource").
		Preload("Action")

	// Search
	if params.Search != "" {
		searchPattern := "%" + params.Search + "%"
		query = query.Where("name ILIKE ? OR description ILIKE ?", searchPattern, searchPattern)
	}

	// Filters
	if resourceID, ok := params.Filters["resource_id"].(string); ok {
		query = query.Where("resource_id = ?", resourceID)
	}
	if actionID, ok := params.Filters["action_id"].(string); ok {
		query = query.Where("action_id = ?", actionID)
	}

	var permissions []model.Permission
	return Paginate(ctx, query, &params, &permissions)
}

// GetPermissionsByIDs retrieves multiple permissions by IDs
func (r *permissionRepository) GetPermissionsByIDs(ctx context.Context, permissionIDs []string) ([]model.Permission, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "permissions", "SELECT")()
	}

	var permissions []model.Permission
	err := r.db.Get(ctx).
		Preload("Resource").
		Preload("Action").
		Where("id IN ?", permissionIDs).
		Find(&permissions).Error
	if err != nil {
		return nil, err
	}
	return permissions, nil
}

// ===== RESOURCE & ACTION OPERATIONS =====

// ListResources lists all resources
func (r *permissionRepository) ListResources(ctx context.Context) ([]model.Resource, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "resources", "SELECT")()
	}

	var resources []model.Resource
	err := r.db.Get(ctx).Order("name ASC").Find(&resources).Error
	if err != nil {
		return nil, err
	}
	return resources, nil
}

// ListActions lists all actions
func (r *permissionRepository) ListActions(ctx context.Context) ([]model.Action, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "actions", "SELECT")()
	}

	var actions []model.Action
	err := r.db.Get(ctx).Order("name ASC").Find(&actions).Error
	if err != nil {
		return nil, err
	}
	return actions, nil
}

// GetResourceByName retrieves resource by name
func (r *permissionRepository) GetResourceByName(ctx context.Context, name string) (*model.Resource, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "resources", "SELECT")()
	}

	var resource model.Resource
	err := r.db.Get(ctx).Where("name = ?", name).First(&resource).Error
	if err != nil {
		return nil, err
	}
	return &resource, nil
}

// GetActionByName retrieves action by name
func (r *permissionRepository) GetActionByName(ctx context.Context, name string) (*model.Action, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "actions", "SELECT")()
	}

	var action model.Action
	err := r.db.Get(ctx).Where("name = ?", name).First(&action).Error
	if err != nil {
		return nil, err
	}
	return &action, nil
}

// ===== HELPER QUERIES =====

// CheckUserHasPermission checks if user has specific permission
func (r *permissionRepository) CheckUserHasPermission(ctx context.Context, userID string, permissionName string) (bool, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "permissions", "SELECT")()
	}

	var count int64
	err := r.db.Get(ctx).Raw(`
		SELECT COUNT(DISTINCT p.id)
		FROM permissions p
		JOIN role_permissions rp ON rp.permission_id = p.id
		JOIN user_roles ur ON ur.role_id = rp.role_id
		WHERE ur.user_id = ?
		  AND p.name = ?
		  AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
	`, userID, permissionName).Count(&count).Error

	if err != nil {
		return false, err
	}

	return count > 0, nil
}

// GetUserPermissionNames retrieves all permission names for a user
func (r *permissionRepository) GetUserPermissionNames(ctx context.Context, userID string) ([]string, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "permissions", "SELECT")()
	}

	var permissions []string
	err := r.db.Get(ctx).Raw(`
		SELECT DISTINCT p.name
		FROM permissions p
		JOIN role_permissions rp ON rp.permission_id = p.id
		JOIN user_roles ur ON ur.role_id = rp.role_id
		WHERE ur.user_id = ?
		  AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
		ORDER BY p.name
	`, userID).Scan(&permissions).Error

	if err != nil {
		return nil, err
	}

	return permissions, nil
}

// RunInTransaction executes a function within a transaction
func (r *permissionRepository) RunInTransaction(ctx context.Context, fn func(txCtx context.Context) error) error {
	return r.db.Run(ctx, fn)
}
