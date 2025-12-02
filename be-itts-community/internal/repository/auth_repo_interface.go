package repository

import (
	"context"

	"be-itts-community/internal/model"
)

// AuthRepository handles user and authentication data operations
type AuthRepository interface {
	// User CRUD
	CreateUser(ctx context.Context, user *model.User) error
	GetUserByID(ctx context.Context, id string) (*model.User, error)
	GetUserByEmail(ctx context.Context, email string) (*model.User, error)
	ListUsers(ctx context.Context, params ListParams) (*PageResult[model.User], error)
	UpdateUser(ctx context.Context, user *model.User) error
	DeleteUser(ctx context.Context, id string) error
	UpdateLastLogin(ctx context.Context, userID string) error

	// User with Relations
	GetUserWithRoles(ctx context.Context, id string) (*model.User, error)
	GetUserWithPermissions(ctx context.Context, id string) (*model.User, []string, error)

	// Refresh Token Operations
	CreateRefreshToken(ctx context.Context, token *model.RefreshToken) error
	GetRefreshTokenByHash(ctx context.Context, tokenHash string) (*model.RefreshToken, error)
	RevokeRefreshToken(ctx context.Context, tokenHash string) error
	RevokeAllUserRefreshTokens(ctx context.Context, userID string) error
	DeleteExpiredRefreshTokens(ctx context.Context) error

	// User Role Operations
	AssignRolesToUser(ctx context.Context, userID string, roleIDs []string, grantedBy *string) error
	RemoveRolesFromUser(ctx context.Context, userID string, roleIDs []string) error
	GetUserRoles(ctx context.Context, userID string) ([]model.Role, error)

	// Transaction support
	RunInTransaction(ctx context.Context, fn func(txCtx context.Context) error) error
}
