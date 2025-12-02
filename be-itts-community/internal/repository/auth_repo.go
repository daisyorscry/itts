package repository

import (
	"context"
	"fmt"
	"time"

	"be-itts-community/internal/db"
	"be-itts-community/internal/model"
)

type authRepository struct {
	db db.Connection
}

// NewAuthRepository creates a new auth repository
func NewAuthRepository(conn db.Connection) AuthRepository {
	return &authRepository{db: conn}
}

// CreateUser creates a new user
func (r *authRepository) CreateUser(ctx context.Context, user *model.User) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "users", "INSERT")()
	}
	return r.db.Get(ctx).Create(user).Error
}

// GetUserByID retrieves user by ID
func (r *authRepository) GetUserByID(ctx context.Context, id string) (*model.User, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "users", "SELECT")()
	}
	var user model.User
	err := r.db.Get(ctx).Where("id = ?", id).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// GetUserByEmail retrieves user by email
func (r *authRepository) GetUserByEmail(ctx context.Context, email string) (*model.User, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "users", "SELECT")()
	}
	var user model.User
	err := r.db.Get(ctx).Where("email = ?", email).First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// ListUsers lists users with pagination
func (r *authRepository) ListUsers(ctx context.Context, params ListParams) (*PageResult[model.User], error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "users", "SELECT")()
	}

	query := r.db.Get(ctx).Model(&model.User{})

	// Search
	if params.Search != "" {
		searchPattern := "%" + params.Search + "%"
		query = query.Where("full_name ILIKE ? OR email ILIKE ?", searchPattern, searchPattern)
	}

	// Filters
	if isActive, ok := params.Filters["is_active"].(bool); ok {
		query = query.Where("is_active = ?", isActive)
	}
	if isSuperAdmin, ok := params.Filters["is_super_admin"].(bool); ok {
		query = query.Where("is_super_admin = ?", isSuperAdmin)
	}

	var users []model.User
	return Paginate(ctx, query, &params, &users)
}

// UpdateUser updates user information
func (r *authRepository) UpdateUser(ctx context.Context, user *model.User) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "users", "UPDATE")()
	}
	user.UpdatedAt = time.Now()
	return r.db.Get(ctx).Save(user).Error
}

// DeleteUser deletes a user
func (r *authRepository) DeleteUser(ctx context.Context, id string) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "users", "DELETE")()
	}
	return r.db.Get(ctx).Where("id = ?", id).Delete(&model.User{}).Error
}

// UpdateLastLogin updates user's last login timestamp
func (r *authRepository) UpdateLastLogin(ctx context.Context, userID string) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "users", "UPDATE")()
	}
	now := time.Now()
	return r.db.Get(ctx).Model(&model.User{}).
		Where("id = ?", userID).
		Update("last_login_at", now).Error
}

// GetUserWithRoles retrieves user with preloaded roles
func (r *authRepository) GetUserWithRoles(ctx context.Context, id string) (*model.User, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "users", "SELECT")()
	}
	var user model.User
	err := r.db.Get(ctx).
		Preload("Roles").
		Where("id = ?", id).
		First(&user).Error
	if err != nil {
		return nil, err
	}
	return &user, nil
}

// GetUserWithPermissions retrieves user with all permissions (from roles)
func (r *authRepository) GetUserWithPermissions(ctx context.Context, id string) (*model.User, []string, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "users", "SELECT")()
	}

	db := r.db.Get(ctx)

	// Get user with roles
	var user model.User
	err := db.Preload("Roles").Where("id = ?", id).First(&user).Error
	if err != nil {
		return nil, nil, err
	}

	// If super admin, return all permissions (wildcard)
	if user.IsSuperAdmin {
		return &user, []string{"*:*"}, nil
	}

	// Get all permissions from user's roles
	var permissions []string
	err = db.Raw(`
		SELECT DISTINCT p.name
		FROM permissions p
		JOIN role_permissions rp ON rp.permission_id = p.id
		JOIN user_roles ur ON ur.role_id = rp.role_id
		WHERE ur.user_id = ?
		  AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
		ORDER BY p.name
	`, id).Scan(&permissions).Error

	if err != nil {
		return nil, nil, err
	}

	return &user, permissions, nil
}

// CreateRefreshToken creates a new refresh token
func (r *authRepository) CreateRefreshToken(ctx context.Context, token *model.RefreshToken) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "refresh_tokens", "INSERT")()
	}
	return r.db.Get(ctx).Create(token).Error
}

// GetRefreshTokenByHash retrieves refresh token by hash
func (r *authRepository) GetRefreshTokenByHash(ctx context.Context, tokenHash string) (*model.RefreshToken, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "refresh_tokens", "SELECT")()
	}
	var token model.RefreshToken
	err := r.db.Get(ctx).
		Where("token_hash = ?", tokenHash).
		Where("revoked_at IS NULL").
		Where("expires_at > ?", time.Now()).
		First(&token).Error
	if err != nil {
		return nil, err
	}
	return &token, nil
}

// RevokeRefreshToken revokes a refresh token
func (r *authRepository) RevokeRefreshToken(ctx context.Context, tokenHash string) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "refresh_tokens", "UPDATE")()
	}
	now := time.Now()
	return r.db.Get(ctx).Model(&model.RefreshToken{}).
		Where("token_hash = ?", tokenHash).
		Update("revoked_at", now).Error
}

// RevokeAllUserRefreshTokens revokes all refresh tokens for a user
func (r *authRepository) RevokeAllUserRefreshTokens(ctx context.Context, userID string) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "refresh_tokens", "UPDATE")()
	}
	now := time.Now()
	return r.db.Get(ctx).Model(&model.RefreshToken{}).
		Where("user_id = ?", userID).
		Where("revoked_at IS NULL").
		Update("revoked_at", now).Error
}

// DeleteExpiredRefreshTokens deletes expired refresh tokens
func (r *authRepository) DeleteExpiredRefreshTokens(ctx context.Context) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "refresh_tokens", "DELETE")()
	}
	return r.db.Get(ctx).
		Where("expires_at < ?", time.Now()).
		Delete(&model.RefreshToken{}).Error
}

// AssignRolesToUser assigns roles to a user
func (r *authRepository) AssignRolesToUser(ctx context.Context, userID string, roleIDs []string, grantedBy *string) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "user_roles", "INSERT")()
	}

	db := r.db.Get(ctx)

	// Remove existing roles first to avoid duplicates
	err := db.Where("user_id = ? AND role_id IN ?", userID, roleIDs).Delete(&model.UserRole{}).Error
	if err != nil {
		return fmt.Errorf("failed to remove existing roles: %w", err)
	}

	// Insert new role assignments
	for _, roleID := range roleIDs {
		userRole := model.UserRole{
			UserID:    userID,
			RoleID:    roleID,
			GrantedBy: grantedBy,
			GrantedAt: time.Now(),
		}
		if err := db.Create(&userRole).Error; err != nil {
			return fmt.Errorf("failed to assign role %s: %w", roleID, err)
		}
	}

	return nil
}

// RemoveRolesFromUser removes roles from a user
func (r *authRepository) RemoveRolesFromUser(ctx context.Context, userID string, roleIDs []string) error {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "user_roles", "DELETE")()
	}
	return r.db.Get(ctx).
		Where("user_id = ? AND role_id IN ?", userID, roleIDs).
		Delete(&model.UserRole{}).Error
}

// GetUserRoles retrieves all roles for a user
func (r *authRepository) GetUserRoles(ctx context.Context, userID string) ([]model.Role, error) {
	if RepoTracer != nil {
		defer RepoTracer.StartDatastoreSegment(ctx, "roles", "SELECT")()
	}
	var roles []model.Role
	err := r.db.Get(ctx).
		Joins("JOIN user_roles ON user_roles.role_id = roles.id").
		Where("user_roles.user_id = ?", userID).
		Where("user_roles.expires_at IS NULL OR user_roles.expires_at > ?", time.Now()).
		Find(&roles).Error
	if err != nil {
		return nil, err
	}
	return roles, nil
}

// RunInTransaction executes a function within a transaction
func (r *authRepository) RunInTransaction(ctx context.Context, fn func(txCtx context.Context) error) error {
	return r.db.Run(ctx, fn)
}
