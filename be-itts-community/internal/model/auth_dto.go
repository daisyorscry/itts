package model

import "time"

// =====================================
// Auth Request/Response DTOs
// =====================================

// LoginRequest represents user login request
type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
}

// LoginResponse represents successful login response
type LoginResponse struct {
	AccessToken  string        `json:"access_token"`
	RefreshToken string        `json:"refresh_token"`
	TokenType    string        `json:"token_type"` // "Bearer"
	ExpiresIn    int64         `json:"expires_in"` // seconds
	User         UserResponse  `json:"user"`
}

// RefreshTokenRequest represents token refresh request
type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" validate:"required"`
}

// RefreshTokenResponse represents token refresh response
type RefreshTokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	TokenType    string `json:"token_type"`
	ExpiresIn    int64  `json:"expires_in"`
}

// ChangePasswordRequest represents password change request
type ChangePasswordRequest struct {
	OldPassword string `json:"old_password" validate:"required"`
	NewPassword string `json:"new_password" validate:"required,min=8"`
}

// ResetPasswordRequest represents password reset request (admin only)
type ResetPasswordRequest struct {
	NewPassword string `json:"new_password" validate:"required,min=8"`
}

// =====================================
// User Management DTOs
// =====================================

// CreateUserRequest represents user creation request
type CreateUserRequest struct {
	Email        string   `json:"email" validate:"required,email"`
	Password     string   `json:"password" validate:"required,min=8"`
	FullName     string   `json:"full_name" validate:"required"`
	IsActive     bool     `json:"is_active"`
	IsSuperAdmin bool     `json:"is_super_admin"`
	RoleIDs      []string `json:"role_ids" validate:"dive,uuid4"`
}

// UpdateUserRequest represents user update request
type UpdateUserRequest struct {
	Email        *string  `json:"email" validate:"omitempty,email"`
	FullName     *string  `json:"full_name" validate:"omitempty"`
	IsActive     *bool    `json:"is_active"`
	IsSuperAdmin *bool    `json:"is_super_admin"`
	RoleIDs      []string `json:"role_ids" validate:"omitempty,dive,uuid4"`
}

// UserResponse represents user in API response
type UserResponse struct {
	ID           string          `json:"id"`
	Email        string          `json:"email"`
	FullName     string          `json:"full_name"`
	IsActive     bool            `json:"is_active"`
	IsSuperAdmin bool            `json:"is_super_admin"`
	LastLoginAt  *time.Time      `json:"last_login_at"`
	CreatedAt    time.Time       `json:"created_at"`
	UpdatedAt    time.Time       `json:"updated_at"`
	Roles        []RoleResponse  `json:"roles,omitempty"`
	Permissions  []string        `json:"permissions,omitempty"` // computed permission names
}

// =====================================
// Role Management DTOs
// =====================================

// CreateRoleRequest represents role creation request
type CreateRoleRequest struct {
	Name          string   `json:"name" validate:"required,min=3,max=100"`
	Description   *string  `json:"description"`
	ParentRoleID  *string  `json:"parent_role_id" validate:"omitempty,uuid4"`
	PermissionIDs []string `json:"permission_ids" validate:"dive,uuid4"`
}

// UpdateRoleRequest represents role update request
type UpdateRoleRequest struct {
	Name          *string  `json:"name" validate:"omitempty,min=3,max=100"`
	Description   *string  `json:"description"`
	ParentRoleID  *string  `json:"parent_role_id" validate:"omitempty,uuid4"`
	PermissionIDs []string `json:"permission_ids" validate:"omitempty,dive,uuid4"`
}

// RoleResponse represents role in API response
type RoleResponse struct {
	ID           string               `json:"id"`
	Name         string               `json:"name"`
	Description  *string              `json:"description"`
	IsSystem     bool                 `json:"is_system"`
	ParentRoleID *string              `json:"parent_role_id"`
	CreatedAt    time.Time            `json:"created_at"`
	UpdatedAt    time.Time            `json:"updated_at"`
	Permissions  []PermissionResponse `json:"permissions,omitempty"`
}

// AssignRoleRequest represents role assignment to user
type AssignRoleRequest struct {
	RoleIDs   []string   `json:"role_ids" validate:"required,min=1,dive,uuid4"`
	ExpiresAt *time.Time `json:"expires_at"` // optional: temporary assignment
}

// =====================================
// Permission DTOs
// =====================================

// PermissionResponse represents permission in API response
type PermissionResponse struct {
	ID          string           `json:"id"`
	Name        string           `json:"name"` // e.g., "events:create"
	Description *string          `json:"description"`
	Resource    ResourceResponse `json:"resource"`
	Action      ActionResponse   `json:"action"`
	CreatedAt   time.Time        `json:"created_at"`
	UpdatedAt   time.Time        `json:"updated_at"`
}

// ResourceResponse represents resource in API response
type ResourceResponse struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description *string   `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// ActionResponse represents action in API response
type ActionResponse struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description *string   `json:"description"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// =====================================
// Audit Log DTOs
// =====================================

// AuditLogResponse represents audit log in API response
type AuditLogResponse struct {
	ID           string                 `json:"id"`
	UserID       *string                `json:"user_id"`
	UserEmail    *string                `json:"user_email,omitempty"`
	Action       string                 `json:"action"`
	ResourceType *string                `json:"resource_type"`
	ResourceID   *string                `json:"resource_id"`
	Metadata     map[string]interface{} `json:"metadata,omitempty"`
	IPAddress    *string                `json:"ip_address"`
	UserAgent    *string                `json:"user_agent"`
	CreatedAt    time.Time              `json:"created_at"`
}

// =====================================
// Pagination
// =====================================

// PageResult represents a paginated result
type PageResult[T any] struct {
	Data       []T   `json:"data"`
	Total      int64 `json:"total"`
	Page       int   `json:"page"`
	PageSize   int   `json:"page_size"`
	TotalPages int   `json:"total_pages"`
}

// =====================================
// Authorization Context
// =====================================

// AuthContext represents authenticated user context
type AuthContext struct {
	UserID       string   `json:"user_id"`
	Email        string   `json:"email"`
	IsSuperAdmin bool     `json:"is_super_admin"`
	Roles        []string `json:"roles"`        // role names
	Permissions  []string `json:"permissions"`  // permission names like "events:create"
}

// HasPermission checks if user has specific permission
func (ac *AuthContext) HasPermission(permission string) bool {
	if ac.IsSuperAdmin {
		return true
	}
	for _, p := range ac.Permissions {
		if p == permission {
			return true
		}
	}
	return false
}

// HasAnyPermission checks if user has any of the specified permissions
func (ac *AuthContext) HasAnyPermission(permissions ...string) bool {
	if ac.IsSuperAdmin {
		return true
	}
	for _, required := range permissions {
		for _, p := range ac.Permissions {
			if p == required {
				return true
			}
		}
	}
	return false
}

// HasRole checks if user has specific role
func (ac *AuthContext) HasRole(role string) bool {
	for _, r := range ac.Roles {
		if r == role {
			return true
		}
	}
	return false
}

// =====================================
// Mappers
// =====================================

// ToUserResponse converts User model to UserResponse DTO
func (u *User) ToUserResponse() UserResponse {
	resp := UserResponse{
		ID:           u.ID,
		Email:        u.Email,
		FullName:     u.FullName,
		IsActive:     u.IsActive,
		IsSuperAdmin: u.IsSuperAdmin,
		LastLoginAt:  u.LastLoginAt,
		CreatedAt:    u.CreatedAt,
		UpdatedAt:    u.UpdatedAt,
	}

	// Include roles if loaded
	if len(u.Roles) > 0 {
		resp.Roles = make([]RoleResponse, len(u.Roles))
		for i, role := range u.Roles {
			resp.Roles[i] = role.ToRoleResponse()
		}
	}

	return resp
}

// ToRoleResponse converts Role model to RoleResponse DTO
func (r *Role) ToRoleResponse() RoleResponse {
	resp := RoleResponse{
		ID:           r.ID,
		Name:         r.Name,
		Description:  r.Description,
		IsSystem:     r.IsSystem,
		ParentRoleID: r.ParentRoleID,
		CreatedAt:    r.CreatedAt,
		UpdatedAt:    r.UpdatedAt,
	}

	// Include permissions if loaded
	if len(r.Permissions) > 0 {
		resp.Permissions = make([]PermissionResponse, len(r.Permissions))
		for i, perm := range r.Permissions {
			resp.Permissions[i] = perm.ToPermissionResponse()
		}
	}

	return resp
}

// ToPermissionResponse converts Permission model to PermissionResponse DTO
func (p *Permission) ToPermissionResponse() PermissionResponse {
	return PermissionResponse{
		ID:          p.ID,
		Name:        p.Name,
		Description: p.Description,
		Resource: ResourceResponse{
			ID:          p.Resource.ID,
			Name:        p.Resource.Name,
			Description: p.Resource.Description,
			CreatedAt:   p.Resource.CreatedAt,
			UpdatedAt:   p.Resource.UpdatedAt,
		},
		Action: ActionResponse{
			ID:          p.Action.ID,
			Name:        p.Action.Name,
			Description: p.Action.Description,
			CreatedAt:   p.Action.CreatedAt,
			UpdatedAt:   p.Action.UpdatedAt,
		},
		CreatedAt: p.CreatedAt,
		UpdatedAt: p.UpdatedAt,
	}
}

// ToAuditLogResponse converts AuditLog model to AuditLogResponse DTO
func (a *AuditLog) ToAuditLogResponse() AuditLogResponse {
	resp := AuditLogResponse{
		ID:           a.ID,
		UserID:       a.UserID,
		Action:       a.Action,
		ResourceType: a.ResourceType,
		ResourceID:   a.ResourceID,
		Metadata:     a.Metadata,
		IPAddress:    a.IPAddress,
		UserAgent:    a.UserAgent,
		CreatedAt:    a.CreatedAt,
	}

	// Include user email if loaded
	if a.User != nil {
		resp.UserEmail = &a.User.Email
	}

	return resp
}
