package service

import (
	"context"

	"be-itts-community/internal/model"
)

// AuthService handles authentication operations
type AuthService interface {
	// Authentication
	Login(ctx context.Context, req model.LoginRequest) (*model.LoginResponse, error)
	RefreshToken(ctx context.Context, refreshToken string) (*model.RefreshTokenResponse, error)
	Logout(ctx context.Context, refreshToken string) error
	GetCurrentUser(ctx context.Context, userID string) (*model.UserResponse, error)

	// OAuth Authentication
	HandleOAuthCallback(ctx context.Context, provider, providerID, email, fullName string, providerData map[string]interface{}) (*model.LoginResponse, error)

	// Password Management
	ChangePassword(ctx context.Context, userID string, req model.ChangePasswordRequest) error
	ResetPassword(ctx context.Context, userID string, newPassword string) error

	// User Management (Admin)
	CreateUser(ctx context.Context, req model.CreateUserRequest, createdBy string) (*model.UserResponse, error)
	GetUser(ctx context.Context, userID string) (*model.UserResponse, error)
	ListUsers(ctx context.Context, search string, page, pageSize int, filters map[string]interface{}) (*model.PageResult[model.UserResponse], error)
	UpdateUser(ctx context.Context, userID string, req model.UpdateUserRequest) (*model.UserResponse, error)
	DeleteUser(ctx context.Context, userID string) error

	// Role Assignment
	AssignRolesToUser(ctx context.Context, userID string, req model.AssignRoleRequest, grantedBy string) error
	RemoveRolesFromUser(ctx context.Context, userID string, roleIDs []string) error
}
