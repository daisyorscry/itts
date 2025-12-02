package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/daisyorscry/itts/core"

	"be-itts-community/internal/model"
	"be-itts-community/pkg/auth"
)

type contextKey string

const (
	authContextKey contextKey = "auth_context"
)

// JWTMiddleware validates JWT tokens and sets auth context
func JWTMiddleware(jwtManager *auth.JWTManager) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Extract token from Authorization header
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				// No token provided - continue without auth context
				next.ServeHTTP(w, r)
				return
			}

			// Check Bearer format
			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) != 2 || parts[0] != "Bearer" {
				core.WriteAppError(w, r, core.Unauthorized("Invalid authorization header format"))
				return
			}

			tokenString := parts[1]

			// Verify token
			claims, err := jwtManager.VerifyAccessToken(tokenString)
			if err != nil {
				if err == auth.ErrExpiredToken {
					core.WriteAppError(w, r, core.Unauthorized("Token has expired"))
					return
				}
				core.WriteAppError(w, r, core.Unauthorized("Invalid token"))
				return
			}

			// Create auth context
			authCtx := &model.AuthContext{
				UserID:       claims.UserID,
				Email:        claims.Email,
				IsSuperAdmin: claims.IsSuperAdmin,
				Roles:        claims.Roles,
				Permissions:  claims.Permissions,
			}

			// Set auth context in request context
			ctx := context.WithValue(r.Context(), authContextKey, authCtx)

			// Also set UserID in core context for compatibility
			ctx = core.WithUserID(ctx, claims.UserID)

			// Continue with updated context
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// RequireAuth middleware requires authentication
func RequireAuth() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authCtx, err := GetAuthContext(r.Context())
			if err != nil {
				core.WriteAppError(w, r, core.Unauthorized("Authentication required"))
				return
			}

			// Check if user is active (optional, depending on your needs)
			if authCtx.UserID == "" {
				core.WriteAppError(w, r, core.Unauthorized("Invalid authentication"))
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

// RequirePermission middleware requires specific permission
func RequirePermission(permission string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authCtx, err := GetAuthContext(r.Context())
			if err != nil {
				core.WriteAppError(w, r, core.Unauthorized("Authentication required"))
				return
			}

			// Check permission
			if !authCtx.HasPermission(permission) {
				core.WriteAppError(w, r, core.Forbidden("Insufficient permissions"))
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

// RequireAnyPermission middleware requires any of the specified permissions
func RequireAnyPermission(permissions ...string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authCtx, err := GetAuthContext(r.Context())
			if err != nil {
				core.WriteAppError(w, r, core.Unauthorized("Authentication required"))
				return
			}

			// Check if user has any of the permissions
			if !authCtx.HasAnyPermission(permissions...) {
				core.WriteAppError(w, r, core.Forbidden("Insufficient permissions"))
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

// RequireRole middleware requires specific role
func RequireRole(role string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authCtx, err := GetAuthContext(r.Context())
			if err != nil {
				core.WriteAppError(w, r, core.Unauthorized("Authentication required"))
				return
			}

			// Check role
			if !authCtx.HasRole(role) {
				core.WriteAppError(w, r, core.Forbidden("Insufficient permissions"))
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

// GetAuthContext retrieves auth context from request context
func GetAuthContext(ctx context.Context) (*model.AuthContext, error) {
	authCtx, ok := ctx.Value(authContextKey).(*model.AuthContext)
	if !ok || authCtx == nil {
		return nil, core.Unauthorized("No authentication context")
	}
	return authCtx, nil
}

// MustGetAuthContext retrieves auth context or panics (use within RequireAuth)
func MustGetAuthContext(ctx context.Context) *model.AuthContext {
	authCtx, err := GetAuthContext(ctx)
	if err != nil {
		panic("auth context not found - ensure RequireAuth middleware is applied")
	}
	return authCtx
}
