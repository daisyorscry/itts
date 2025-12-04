package rest

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/daisyorscry/itts/core"

	"be-itts-community/internal/service"
	"be-itts-community/pkg/oauth"
)

type OAuthHandler struct {
	authService  service.AuthService
	githubClient *oauth.GitHubOAuthClient
}

// NewOAuthHandler creates a new OAuth handler
func NewOAuthHandler(authService service.AuthService, githubClient *oauth.GitHubOAuthClient) *OAuthHandler {
	return &OAuthHandler{
		authService:  authService,
		githubClient: githubClient,
	}
}

// HandleGitHubAuth redirects to GitHub OAuth page
// GET /api/v1/auth/oauth/github
func (h *OAuthHandler) HandleGitHubAuth(w http.ResponseWriter, r *http.Request) {
	state := r.URL.Query().Get("state")
	if state == "" {
		state = generateRandomState()
	}

	authURL := h.githubClient.GetAuthURL(state)
	http.Redirect(w, r, authURL, http.StatusTemporaryRedirect)
}

// HandleGitHubCallback handles GitHub OAuth callback
// GET /api/v1/auth/oauth/github/callback
func (h *OAuthHandler) HandleGitHubCallback(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	// Parse query parameters
	code := r.URL.Query().Get("code")
	state := r.URL.Query().Get("state")

	if code == "" {
		core.WriteError(w, r, http.StatusBadRequest, "INVALID_REQUEST", "missing authorization code", nil)
		return
	}

	// TODO: Validate state parameter for CSRF protection
	_ = state

	// Exchange code for access token
	accessToken, err := h.githubClient.ExchangeCode(ctx, code)
	if err != nil {
		core.RespondError(w, r, core.BadRequest(fmt.Sprintf("Failed to exchange code: %v", err)))
		return
	}

	// Get GitHub user profile
	githubUser, err := h.githubClient.GetUser(ctx, accessToken)
	if err != nil {
		core.RespondError(w, r, core.BadRequest(fmt.Sprintf("Failed to get GitHub user: %v", err)))
		return
	}

	// Validate required fields
	if githubUser.Email == "" {
		core.RespondError(w, r, core.BadRequest("GitHub account must have a verified email"))
		return
	}

	// Prepare full name
	fullName := githubUser.Name
	if fullName == "" {
		fullName = githubUser.Login // fallback to login if name not set
	}

	// Prepare provider data
	providerData := map[string]interface{}{
		"login":      githubUser.Login,
		"avatar_url": githubUser.AvatarURL,
		"bio":        githubUser.Bio,
		"location":   githubUser.Location,
		"company":    githubUser.Company,
	}

	// Handle OAuth callback in auth service
	response, err := h.authService.HandleOAuthCallback(
		ctx,
		"github",
		strconv.FormatInt(githubUser.ID, 10),
		githubUser.Email,
		fullName,
		providerData,
	)
	if err != nil {
		// Redirect to frontend with error
		errorURL := fmt.Sprintf("http://localhost:3000/login?error=%s", err.Error())
		http.Redirect(w, r, errorURL, http.StatusTemporaryRedirect)
		return
	}

	// Redirect to frontend with tokens
	// Frontend will receive tokens as query params and store them
	successURL := fmt.Sprintf(
		"http://localhost:3000/auth/callback?access_token=%s&refresh_token=%s&expires_in=%d",
		response.AccessToken,
		response.RefreshToken,
		response.ExpiresIn,
	)
	http.Redirect(w, r, successURL, http.StatusTemporaryRedirect)
}

// Helper: generate random state for CSRF protection
func generateRandomState() string {
	// Generate cryptographically secure random state
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		// Fallback to timestamp if crypto/rand fails
		return fmt.Sprintf("%d", time.Now().UnixNano())
	}
	return hex.EncodeToString(b)
}
