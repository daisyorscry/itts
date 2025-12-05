package service

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/daisyorscry/itts/core"
	"gorm.io/gorm"

	"be-itts-community/internal/model"
	"be-itts-community/internal/repository"
	"be-itts-community/pkg/auth"
	"be-itts-community/pkg/observability/nr"
)

type authService struct {
	authRepo       repository.AuthRepository
	permissionRepo repository.PermissionRepository
	auditRepo      repository.AuditLogRepository
	jwtManager     *auth.JWTManager
	tracer         nr.Tracer
}

// NewAuthService creates a new auth service
func NewAuthService(
	authRepo repository.AuthRepository,
	permissionRepo repository.PermissionRepository,
	auditRepo repository.AuditLogRepository,
	jwtManager *auth.JWTManager,
	tracer nr.Tracer,
) AuthService {
	return &authService{
		authRepo:       authRepo,
		permissionRepo: permissionRepo,
		auditRepo:      auditRepo,
		jwtManager:     jwtManager,
		tracer:         tracer,
	}
}

// Login authenticates a user and returns tokens
func (s *authService) Login(ctx context.Context, req model.LoginRequest) (*model.LoginResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "AuthService.Login")()
	}

	// Get user by email
	user, err := s.authRepo.GetUserByEmail(ctx, req.Email)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// Log failed attempt
			s.auditLog(ctx, nil, "user.login.failed", nil, nil, map[string]interface{}{
				"email":  req.Email,
				"reason": "user not found",
			})
			return nil, core.Unauthorized("Invalid email or password")
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	// Check if user is active
	if !user.IsActive {
		s.auditLog(ctx, &user.ID, "user.login.failed", nil, nil, map[string]interface{}{
			"email":  req.Email,
			"reason": "user not active",
		})
		return nil, core.Forbidden("Account is inactive")
	}

	// Check if user has password (not OAuth-only account)
	if user.PasswordHash == nil {
		s.auditLog(ctx, &user.ID, "user.login.failed", nil, nil, map[string]interface{}{
			"email":  req.Email,
			"reason": "OAuth-only account",
		})
		return nil, core.BadRequest("This account uses OAuth login. Please use the OAuth provider to sign in.")
	}

	// Verify password
	if err := auth.CheckPassword(*user.PasswordHash, req.Password); err != nil {
		s.auditLog(ctx, &user.ID, "user.login.failed", nil, nil, map[string]interface{}{
			"email":  req.Email,
			"reason": "invalid password",
		})
		return nil, core.Unauthorized("Invalid email or password")
	}

	// Get user permissions
	_, permissions, err := s.authRepo.GetUserWithPermissions(ctx, user.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user permissions: %w", err)
	}

	// Get role names
	roles, err := s.authRepo.GetUserRoles(ctx, user.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user roles: %w", err)
	}
	roleNames := make([]string, len(roles))
	for i, role := range roles {
		roleNames[i] = role.Name
	}

	// Generate access token
	accessToken, err := s.jwtManager.GenerateAccessToken(
		user.ID,
		user.Email,
		user.IsSuperAdmin,
		roleNames,
		permissions,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to generate access token: %w", err)
	}

	// Generate refresh token
	refreshTokenStr, err := s.jwtManager.GenerateRefreshToken()
	if err != nil {
		return nil, fmt.Errorf("failed to generate refresh token: %w", err)
	}

	// Save refresh token to database
	refreshToken := &model.RefreshToken{
		UserID:    user.ID,
		TokenHash: s.jwtManager.HashRefreshToken(refreshTokenStr),
		ExpiresAt: time.Now().Add(s.jwtManager.GetRefreshTokenDuration()),
	}
	if err := s.authRepo.CreateRefreshToken(ctx, refreshToken); err != nil {
		return nil, fmt.Errorf("failed to save refresh token: %w", err)
	}

	// Update last login
	if err := s.authRepo.UpdateLastLogin(ctx, user.ID); err != nil {
		// Non-critical error, just log it
		fmt.Printf("failed to update last login: %v\n", err)
	}

	// Audit log
	s.auditLog(ctx, &user.ID, "user.login.success", nil, nil, map[string]interface{}{
		"email": req.Email,
	})

	// Build response
	user.Roles = roles
	userResp := user.ToUserResponse()
	userResp.Permissions = permissions

	return &model.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshTokenStr,
		TokenType:    "Bearer",
		ExpiresIn:    int64(s.jwtManager.GetAccessTokenDuration().Seconds()),
		User:         userResp,
	}, nil
}

// RefreshToken refreshes an access token using a refresh token
func (s *authService) RefreshToken(ctx context.Context, refreshTokenStr string) (*model.RefreshTokenResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "AuthService.RefreshToken")()
	}

	// Hash the token
	tokenHash := s.jwtManager.HashRefreshToken(refreshTokenStr)

	// Get token from database
	token, err := s.authRepo.GetRefreshTokenByHash(ctx, tokenHash)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, core.Unauthorized("Invalid or expired refresh token")
		}
		return nil, fmt.Errorf("failed to get refresh token: %w", err)
	}

	// Get user with permissions
	user, permissions, err := s.authRepo.GetUserWithPermissions(ctx, token.UserID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	// Check if user is still active
	if !user.IsActive {
		return nil, core.Forbidden("Account is inactive")
	}

	// Get role names
	roles, err := s.authRepo.GetUserRoles(ctx, user.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user roles: %w", err)
	}
	roleNames := make([]string, len(roles))
	for i, role := range roles {
		roleNames[i] = role.Name
	}

	// Generate new access token
	accessToken, err := s.jwtManager.GenerateAccessToken(
		user.ID,
		user.Email,
		user.IsSuperAdmin,
		roleNames,
		permissions,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to generate access token: %w", err)
	}

	// Generate new refresh token
	newRefreshTokenStr, err := s.jwtManager.GenerateRefreshToken()
	if err != nil {
		return nil, fmt.Errorf("failed to generate refresh token: %w", err)
	}

	// Revoke old refresh token and save new one in transaction
	err = s.authRepo.RunInTransaction(ctx, func(txCtx context.Context) error {
		// Revoke old token
		if err := s.authRepo.RevokeRefreshToken(txCtx, tokenHash); err != nil {
			return err
		}

		// Save new token
		newToken := &model.RefreshToken{
			UserID:    user.ID,
			TokenHash: s.jwtManager.HashRefreshToken(newRefreshTokenStr),
			ExpiresAt: time.Now().Add(s.jwtManager.GetRefreshTokenDuration()),
		}
		return s.authRepo.CreateRefreshToken(txCtx, newToken)
	})

	if err != nil {
		return nil, fmt.Errorf("failed to refresh token: %w", err)
	}

	return &model.RefreshTokenResponse{
		AccessToken:  accessToken,
		RefreshToken: newRefreshTokenStr,
		TokenType:    "Bearer",
		ExpiresIn:    int64(s.jwtManager.GetAccessTokenDuration().Seconds()),
	}, nil
}

// Logout logs out a user by revoking their refresh token
func (s *authService) Logout(ctx context.Context, refreshTokenStr string) error {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "AuthService.Logout")()
	}

	tokenHash := s.jwtManager.HashRefreshToken(refreshTokenStr)

	// Get token to find user ID for audit
	token, err := s.authRepo.GetRefreshTokenByHash(ctx, tokenHash)
	if err != nil {
		// Token not found or already revoked - that's okay for logout
		return nil
	}

	// Revoke token
	if err := s.authRepo.RevokeRefreshToken(ctx, tokenHash); err != nil {
		return fmt.Errorf("failed to revoke token: %w", err)
	}

	// Audit log
	s.auditLog(ctx, &token.UserID, "user.logout", nil, nil, nil)

	return nil
}

// GetCurrentUser returns current user info
func (s *authService) GetCurrentUser(ctx context.Context, userID string) (*model.UserResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "AuthService.GetCurrentUser")()
	}

	user, permissions, err := s.authRepo.GetUserWithPermissions(ctx, userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, core.NotFound("user", userID)
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	resp := user.ToUserResponse()
	resp.Permissions = permissions

	return &resp, nil
}

// UpdateProfile updates current user's profile
func (s *authService) UpdateProfile(ctx context.Context, userID string, req model.UpdateProfileRequest) (*model.UserResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "AuthService.UpdateProfile")()
	}

	// Get existing user
	user, err := s.authRepo.GetUserByID(ctx, userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, core.NotFound("user", userID)
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	// Update fields if provided
	if req.Email != nil {
		// Check email uniqueness
		existing, err := s.authRepo.GetUserByEmail(ctx, *req.Email)
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("failed to check email: %w", err)
		}
		if existing != nil && existing.ID != userID {
			return nil, core.Conflict("Email already exists")
		}
		user.Email = *req.Email
	}
	if req.FullName != nil {
		user.FullName = *req.FullName
	}

	// Update user
	if err := s.authRepo.UpdateUser(ctx, user); err != nil {
		return nil, fmt.Errorf("failed to update user: %w", err)
	}

	// Get updated user with permissions
	updatedUser, permissions, err := s.authRepo.GetUserWithPermissions(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get updated user: %w", err)
	}

	resp := updatedUser.ToUserResponse()
	resp.Permissions = permissions

	// Audit log
	s.auditLog(ctx, &userID, "user.profile.updated", strPtr("users"), &userID, map[string]interface{}{
		"fields_updated": getUpdatedFields(req),
	})

	return &resp, nil
}

// ChangePassword changes user's password
func (s *authService) ChangePassword(ctx context.Context, userID string, req model.ChangePasswordRequest) error {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "AuthService.ChangePassword")()
	}

	// Get user
	user, err := s.authRepo.GetUserByID(ctx, userID)
	if err != nil {
		return fmt.Errorf("failed to get user: %w", err)
	}

	// Check if user has password (not OAuth-only account)
	if user.PasswordHash == nil {
		s.auditLog(ctx, &userID, "user.password_change.failed", strPtr("users"), &userID, map[string]interface{}{
			"reason": "OAuth-only account",
		})
		return core.BadRequest("Cannot change password for OAuth-only accounts")
	}

	// Verify old password
	if err := auth.CheckPassword(*user.PasswordHash, req.OldPassword); err != nil {
		s.auditLog(ctx, &userID, "user.password_change.failed", strPtr("users"), &userID, map[string]interface{}{
			"reason": "invalid old password",
		})
		return core.BadRequest("Invalid old password")
	}

	// Hash new password
	hashedPassword, err := auth.HashPassword(req.NewPassword)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	// Update password and revoke all refresh tokens
	err = s.authRepo.RunInTransaction(ctx, func(txCtx context.Context) error {
		user.PasswordHash = &hashedPassword
		if err := s.authRepo.UpdateUser(txCtx, user); err != nil {
			return err
		}

		// Revoke all refresh tokens (force re-login)
		return s.authRepo.RevokeAllUserRefreshTokens(txCtx, userID)
	})

	if err != nil {
		return fmt.Errorf("failed to change password: %w", err)
	}

	// Audit log
	s.auditLog(ctx, &userID, "user.password_change.success", strPtr("users"), &userID, nil)

	return nil
}

// ResetPassword resets user's password (admin only)
func (s *authService) ResetPassword(ctx context.Context, userID string, newPassword string) error {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "AuthService.ResetPassword")()
	}

	// Get user
	user, err := s.authRepo.GetUserByID(ctx, userID)
	if err != nil {
		return fmt.Errorf("failed to get user: %w", err)
	}

	// Hash new password
	hashedPassword, err := auth.HashPassword(newPassword)
	if err != nil {
		return fmt.Errorf("failed to hash password: %w", err)
	}

	// Update password and revoke all refresh tokens
	err = s.authRepo.RunInTransaction(ctx, func(txCtx context.Context) error {
		user.PasswordHash = &hashedPassword
		if err := s.authRepo.UpdateUser(txCtx, user); err != nil {
			return err
		}

		// Revoke all refresh tokens
		return s.authRepo.RevokeAllUserRefreshTokens(txCtx, userID)
	})

	if err != nil {
		return fmt.Errorf("failed to reset password: %w", err)
	}

	// Audit log (get admin ID from context if available)
	adminID := getUserIDFromContext(ctx)
	s.auditLog(ctx, adminID, "user.password_reset", strPtr("users"), &userID, map[string]interface{}{
		"target_user_id": userID,
	})

	return nil
}

// CreateUser creates a new user (admin only)
func (s *authService) CreateUser(ctx context.Context, req model.CreateUserRequest, createdBy string) (*model.UserResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "AuthService.CreateUser")()
	}

	// Check if email already exists
	existing, err := s.authRepo.GetUserByEmail(ctx, req.Email)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, fmt.Errorf("failed to check existing user: %w", err)
	}
	if existing != nil {
		return nil, core.Conflict("Email already exists")
	}

	// Hash password
	hashedPassword, err := auth.HashPassword(req.Password)
	if err != nil {
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	// Create user
	user := &model.User{
		Email:        req.Email,
		PasswordHash: &hashedPassword,
		FullName:     req.FullName,
		IsActive:     req.IsActive,
		IsSuperAdmin: req.IsSuperAdmin,
	}

	// Save user and assign roles in transaction
	var userResp *model.UserResponse
	err = s.authRepo.RunInTransaction(ctx, func(txCtx context.Context) error {
		// Create user
		if err := s.authRepo.CreateUser(txCtx, user); err != nil {
			return err
		}

		// Assign roles if provided
		if len(req.RoleIDs) > 0 {
			if err := s.authRepo.AssignRolesToUser(txCtx, user.ID, req.RoleIDs, &createdBy); err != nil {
				return err
			}
		}

		// Get user with roles
		userWithRoles, err := s.authRepo.GetUserWithRoles(txCtx, user.ID)
		if err != nil {
			return err
		}

		resp := userWithRoles.ToUserResponse()
		userResp = &resp
		return nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	// Audit log
	s.auditLog(ctx, &createdBy, "user.create", strPtr("users"), &user.ID, map[string]interface{}{
		"email":     user.Email,
		"full_name": user.FullName,
	})

	return userResp, nil
}

// GetUser retrieves user by ID
func (s *authService) GetUser(ctx context.Context, userID string) (*model.UserResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "AuthService.GetUser")()
	}

	user, err := s.authRepo.GetUserWithRoles(ctx, userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, core.NotFound("user", userID)
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	resp := user.ToUserResponse()
	return &resp, nil
}

// ListUsers lists users with pagination
func (s *authService) ListUsers(ctx context.Context, search string, page, pageSize int, filters map[string]interface{}) (*model.PageResult[model.UserResponse], error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "AuthService.ListUsers")()
	}

	params := repository.ListParams{
		Search:   search,
		Page:     page,
		PageSize: pageSize,
		Filters:  filters,
		Sort:     []string{"-created_at"},
	}

	result, err := s.authRepo.ListUsers(ctx, params)
	if err != nil {
		return nil, fmt.Errorf("failed to list users: %w", err)
	}

	// Convert to response DTOs
	respData := make([]model.UserResponse, len(result.Data))
	for i, user := range result.Data {
		respData[i] = user.ToUserResponse()
	}

	return &model.PageResult[model.UserResponse]{
		Data:       respData,
		Total:      result.Total,
		Page:       result.Page,
		PageSize:   result.PageSize,
		TotalPages: result.TotalPages,
	}, nil
}

// UpdateUser updates user information
func (s *authService) UpdateUser(ctx context.Context, userID string, req model.UpdateUserRequest) (*model.UserResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "AuthService.UpdateUser")()
	}

	// Get existing user
	user, err := s.authRepo.GetUserByID(ctx, userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, core.NotFound("user", userID)
		}
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	// Update fields if provided
	if req.Email != nil {
		// Check email uniqueness
		existing, err := s.authRepo.GetUserByEmail(ctx, *req.Email)
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("failed to check email: %w", err)
		}
		if existing != nil && existing.ID != userID {
			return nil, core.Conflict("Email already exists")
		}
		user.Email = *req.Email
	}
	if req.FullName != nil {
		user.FullName = *req.FullName
	}
	if req.IsActive != nil {
		user.IsActive = *req.IsActive
	}
	if req.IsSuperAdmin != nil {
		user.IsSuperAdmin = *req.IsSuperAdmin
	}

	// Update user and roles in transaction
	var userResp *model.UserResponse
	err = s.authRepo.RunInTransaction(ctx, func(txCtx context.Context) error {
		// Update user
		if err := s.authRepo.UpdateUser(txCtx, user); err != nil {
			return err
		}

		// Update roles if provided
		if req.RoleIDs != nil {
			// Remove all existing roles
			existingRoles, _ := s.authRepo.GetUserRoles(txCtx, userID)
			existingRoleIDs := make([]string, len(existingRoles))
			for i, role := range existingRoles {
				existingRoleIDs[i] = role.ID
			}
			if len(existingRoleIDs) > 0 {
				if err := s.authRepo.RemoveRolesFromUser(txCtx, userID, existingRoleIDs); err != nil {
					return err
				}
			}

			// Assign new roles
			if len(req.RoleIDs) > 0 {
				adminID := getUserIDFromContext(ctx)
				if err := s.authRepo.AssignRolesToUser(txCtx, userID, req.RoleIDs, adminID); err != nil {
					return err
				}
			}
		}

		// Get updated user with roles
		updatedUser, err := s.authRepo.GetUserWithRoles(txCtx, userID)
		if err != nil {
			return err
		}

		resp := updatedUser.ToUserResponse()
		userResp = &resp
		return nil
	})

	if err != nil {
		return nil, fmt.Errorf("failed to update user: %w", err)
	}

	// Audit log
	adminID := getUserIDFromContext(ctx)
	s.auditLog(ctx, adminID, "user.update", strPtr("users"), &userID, map[string]interface{}{
		"email": user.Email,
	})

	return userResp, nil
}

// DeleteUser deletes a user
func (s *authService) DeleteUser(ctx context.Context, userID string) error {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "AuthService.DeleteUser")()
	}

	// Check if user exists
	user, err := s.authRepo.GetUserByID(ctx, userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return core.NotFound("user", userID)
		}
		return fmt.Errorf("failed to get user: %w", err)
	}

	// Prevent deletion of super admin
	if user.IsSuperAdmin {
		return core.Forbidden("Cannot delete super admin user")
	}

	// Delete user
	if err := s.authRepo.DeleteUser(ctx, userID); err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}

	// Audit log
	adminID := getUserIDFromContext(ctx)
	s.auditLog(ctx, adminID, "user.delete", strPtr("users"), &userID, map[string]interface{}{
		"email": user.Email,
	})

	return nil
}

// AssignRolesToUser assigns roles to a user
func (s *authService) AssignRolesToUser(ctx context.Context, userID string, req model.AssignRoleRequest, grantedBy string) error {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "AuthService.AssignRolesToUser")()
	}

	// Check if user exists
	_, err := s.authRepo.GetUserByID(ctx, userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return core.NotFound("user", userID)
		}
		return fmt.Errorf("failed to get user: %w", err)
	}

	// Assign roles
	if err := s.authRepo.AssignRolesToUser(ctx, userID, req.RoleIDs, &grantedBy); err != nil {
		return fmt.Errorf("failed to assign roles: %w", err)
	}

	// Audit log
	s.auditLog(ctx, &grantedBy, "user.roles.assign", strPtr("users"), &userID, map[string]interface{}{
		"role_ids": req.RoleIDs,
	})

	return nil
}

// RemoveRolesFromUser removes roles from a user
func (s *authService) RemoveRolesFromUser(ctx context.Context, userID string, roleIDs []string) error {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "AuthService.RemoveRolesFromUser")()
	}

	// Check if user exists
	_, err := s.authRepo.GetUserByID(ctx, userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return core.NotFound("user", userID)
		}
		return fmt.Errorf("failed to get user: %w", err)
	}

	// Remove roles
	if err := s.authRepo.RemoveRolesFromUser(ctx, userID, roleIDs); err != nil {
		return fmt.Errorf("failed to remove roles: %w", err)
	}

	// Audit log
	adminID := getUserIDFromContext(ctx)
	s.auditLog(ctx, adminID, "user.roles.remove", strPtr("users"), &userID, map[string]interface{}{
		"role_ids": roleIDs,
	})

	return nil
}

// Helper: audit logging
func (s *authService) auditLog(ctx context.Context, userID *string, action string, resourceType *string, resourceID *string, metadata map[string]interface{}) {
	log := &model.AuditLog{
		UserID:       userID,
		Action:       action,
		ResourceType: resourceType,
		ResourceID:   resourceID,
		Metadata:     metadata,
		IPAddress:    getIPFromContext(ctx),
		UserAgent:    getUserAgentFromContext(ctx),
	}

	// Non-blocking audit log (fire and forget)
	go func() {
		_ = s.auditRepo.CreateAuditLog(context.Background(), log)
	}()
}

// Helper functions
func strPtr(s string) *string {
	return &s
}

func getUserIDFromContext(ctx context.Context) *string {
	if userID := core.GetUserIDFromContext(ctx); userID != "" {
		return &userID
	}
	return nil
}

func getIPFromContext(ctx context.Context) *string {
	// TODO: implement IP extraction from context
	return nil
}

func getUserAgentFromContext(ctx context.Context) *string {
	// TODO: implement user agent extraction from context
	return nil
}

// HandleOAuthCallback handles OAuth provider callback and creates/updates user
func (s *authService) HandleOAuthCallback(
	ctx context.Context,
	provider, providerID, email, fullName string,
	providerData map[string]interface{},
) (*model.LoginResponse, error) {
	if s.tracer != nil {
		defer s.tracer.StartSegment(ctx, "AuthService.HandleOAuthCallback")()
	}

	var user *model.User
	var isNewUser bool

	// Try to find existing OAuth account
	existingUser, err := s.authRepo.GetUserByOAuth(ctx, provider, providerID)
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, fmt.Errorf("failed to check existing OAuth account: %w", err)
	}

	if existingUser != nil {
		// User already exists with this OAuth provider
		user = existingUser

		// Update last login
		if err := s.authRepo.UpdateLastLogin(ctx, user.ID); err != nil {
			return nil, fmt.Errorf("failed to update last login: %w", err)
		}
	} else {
		// Check if user exists by email
		existingUserByEmail, err := s.authRepo.GetUserByEmail(ctx, email)
		if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("failed to check existing user by email: %w", err)
		}

		if existingUserByEmail != nil {
			// User exists with this email, link OAuth account
			user = existingUserByEmail

			// Create OAuth account linkage
			oauthAccount := &model.OAuthAccount{
				UserID:       user.ID,
				Provider:     provider,
				ProviderID:   providerID,
				ProviderData: providerData,
			}

			if err := s.authRepo.CreateOAuthAccount(ctx, oauthAccount); err != nil {
				return nil, fmt.Errorf("failed to link OAuth account: %w", err)
			}

			// Update last login
			if err := s.authRepo.UpdateLastLogin(ctx, user.ID); err != nil {
				return nil, fmt.Errorf("failed to update last login: %w", err)
			}

			// Audit log
			s.auditLog(ctx, &user.ID, "oauth.link", strPtr("oauth_accounts"), nil, map[string]interface{}{
				"provider":    provider,
				"provider_id": providerID,
				"email":       email,
			})
		} else {
			// New user - create account
			isNewUser = true

			// Create user without password (OAuth only)
			user = &model.User{
				Email:        email,
				FullName:     fullName,
				PasswordHash: nil, // OAuth-only users have no password
				IsActive:     true,
				IsSuperAdmin: false,
			}

			// Create user in transaction
			err := s.authRepo.RunInTransaction(ctx, func(txCtx context.Context) error {
				// Create user
				if err := s.authRepo.CreateUser(txCtx, user); err != nil {
					return fmt.Errorf("failed to create user: %w", err)
				}

				// Create OAuth account linkage
				oauthAccount := &model.OAuthAccount{
					UserID:       user.ID,
					Provider:     provider,
					ProviderID:   providerID,
					ProviderData: providerData,
				}

				if err := s.authRepo.CreateOAuthAccount(txCtx, oauthAccount); err != nil {
					return fmt.Errorf("failed to create OAuth account: %w", err)
				}

				// Assign default viewer role to new OAuth users
				viewerRole, err := s.permissionRepo.GetRoleByName(txCtx, "viewer")
				if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
					return fmt.Errorf("failed to get viewer role: %w", err)
				}

				if viewerRole != nil {
					if err := s.authRepo.AssignRolesToUser(txCtx, user.ID, []string{viewerRole.ID}, nil); err != nil {
						return fmt.Errorf("failed to assign default role: %w", err)
					}
				}

				return nil
			})

			if err != nil {
				return nil, err
			}

			// Audit log
			s.auditLog(ctx, &user.ID, "user.oauth.create", strPtr("users"), &user.ID, map[string]interface{}{
				"provider":    provider,
				"provider_id": providerID,
				"email":       email,
				"full_name":   fullName,
			})
		}
	}

	// Check if user is active
	if !user.IsActive {
		s.auditLog(ctx, &user.ID, "oauth.login.failed", nil, nil, map[string]interface{}{
			"provider": provider,
			"email":    email,
			"reason":   "user not active",
		})
		return nil, core.Forbidden("Account is inactive")
	}

	// Get user permissions
	_, permissions, err := s.authRepo.GetUserWithPermissions(ctx, user.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user permissions: %w", err)
	}

	// Get role names
	roles, err := s.authRepo.GetUserRoles(ctx, user.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to get user roles: %w", err)
	}
	roleNames := make([]string, len(roles))
	for i, role := range roles {
		roleNames[i] = role.Name
	}

	// Generate access token
	accessToken, err := s.jwtManager.GenerateAccessToken(
		user.ID,
		user.Email,
		user.IsSuperAdmin,
		roleNames,
		permissions,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to generate access token: %w", err)
	}

	// Generate refresh token
	refreshTokenStr, err := s.jwtManager.GenerateRefreshToken()
	if err != nil {
		return nil, fmt.Errorf("failed to generate refresh token: %w", err)
	}

	// Store refresh token
	refreshToken := &model.RefreshToken{
		UserID:    user.ID,
		TokenHash: s.jwtManager.HashRefreshToken(refreshTokenStr),
		ExpiresAt: time.Now().Add(s.jwtManager.GetRefreshTokenDuration()),
	}
	if err := s.authRepo.CreateRefreshToken(ctx, refreshToken); err != nil {
		return nil, fmt.Errorf("failed to store refresh token: %w", err)
	}

	// Update last login
	if !isNewUser { // already updated for new users
		if err := s.authRepo.UpdateLastLogin(ctx, user.ID); err != nil {
			return nil, fmt.Errorf("failed to update last login: %w", err)
		}
	}

	// Audit log
	s.auditLog(ctx, &user.ID, "oauth.login.success", nil, nil, map[string]interface{}{
		"provider": provider,
		"email":    email,
		"is_new":   isNewUser,
	})

	// Build response
	response := &model.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshTokenStr,
		TokenType:    "Bearer",
		ExpiresIn:    int64(s.jwtManager.GetAccessTokenDuration().Seconds()),
		User: model.UserResponse{
			ID:           user.ID,
			Email:        user.Email,
			FullName:     user.FullName,
			IsActive:     user.IsActive,
			IsSuperAdmin: user.IsSuperAdmin,
			LastLoginAt:  user.LastLoginAt,
			CreatedAt:    user.CreatedAt,
			UpdatedAt:    user.UpdatedAt,
			Roles:        make([]model.RoleResponse, len(roles)),
			Permissions:  permissions,
		},
	}

	// Map roles
	for i, role := range roles {
		response.User.Roles[i] = model.RoleResponse{
			ID:          role.ID,
			Name:        role.Name,
			Description: role.Description,
			IsSystem:    role.IsSystem,
			CreatedAt:   role.CreatedAt,
			UpdatedAt:   role.UpdatedAt,
		}
	}

	return response, nil
}

// getUpdatedFields returns list of updated fields from request
func getUpdatedFields(req model.UpdateProfileRequest) []string {
	fields := []string{}
	if req.Email != nil {
		fields = append(fields, "email")
	}
	if req.FullName != nil {
		fields = append(fields, "full_name")
	}
	return fields
}
