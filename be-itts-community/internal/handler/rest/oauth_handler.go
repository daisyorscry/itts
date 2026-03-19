package rest

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"be-itts-community/internal/service"
	"be-itts-community/pkg/oauth"
)

type OAuthHandler struct {
	authService     service.AuthService
	githubClient    *oauth.GitHubOAuthClient
	frontendBaseURL string
}

type oauthStatePayload struct {
	Nonce  string `json:"nonce"`
	Origin string `json:"origin,omitempty"`
}

// NewOAuthHandler creates a new OAuth handler
func NewOAuthHandler(authService service.AuthService, githubClient *oauth.GitHubOAuthClient, frontendBaseURL string) *OAuthHandler {
	return &OAuthHandler{
		authService:     authService,
		githubClient:    githubClient,
		frontendBaseURL: strings.TrimRight(frontendBaseURL, "/"),
	}
}

// HandleGitHubAuth redirects to GitHub OAuth page
// GET /api/v1/auth/oauth/github
func (h *OAuthHandler) HandleGitHubAuth(w http.ResponseWriter, r *http.Request) {
	origin := h.resolveRequestOrigin(r)
	state := r.URL.Query().Get("state")
	if state == "" {
		state = encodeOAuthState(oauthStatePayload{
			Nonce:  generateRandomState(),
			Origin: origin,
		})
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
	statePayload := decodeOAuthState(state)
	targetOrigin := strings.TrimSpace(statePayload.Origin)
	if targetOrigin == "" {
		targetOrigin = h.frontendBaseURL
	}

	if code == "" {
		h.writeOAuthPopupResponse(w, targetOrigin, map[string]any{
			"type":             "OAUTH_ERROR",
			"error":            "INVALID_REQUEST",
			"errorDescription": "missing authorization code",
		})
		return
	}

	// Exchange code for access token
	accessToken, err := h.githubClient.ExchangeCode(ctx, code)
	if err != nil {
		h.writeOAuthPopupResponse(w, targetOrigin, map[string]any{
			"type":             "OAUTH_ERROR",
			"error":            "oauth_exchange_failed",
			"errorDescription": fmt.Sprintf("Failed to exchange code: %v", err),
		})
		return
	}

	// Get GitHub user profile
	githubUser, err := h.githubClient.GetUser(ctx, accessToken)
	if err != nil {
		h.writeOAuthPopupResponse(w, targetOrigin, map[string]any{
			"type":             "OAUTH_ERROR",
			"error":            "oauth_user_fetch_failed",
			"errorDescription": fmt.Sprintf("Failed to get GitHub user: %v", err),
		})
		return
	}

	// Validate required fields
	if githubUser.Email == "" {
		h.writeOAuthPopupResponse(w, targetOrigin, map[string]any{
			"type":             "OAUTH_ERROR",
			"error":            "oauth_email_required",
			"errorDescription": "GitHub account must have a verified email",
		})
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
		h.writeOAuthPopupResponse(w, targetOrigin, map[string]any{
			"type":             "OAUTH_ERROR",
			"error":            "oauth_callback_failed",
			"errorDescription": err.Error(),
		})
		return
	}

	h.writeOAuthPopupResponse(w, targetOrigin, map[string]any{
		"type":         "OAUTH_SUCCESS",
		"accessToken":  response.AccessToken,
		"refreshToken": response.RefreshToken,
		"expiresIn":    response.ExpiresIn,
	})
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

func encodeOAuthState(payload oauthStatePayload) string {
	data, err := json.Marshal(payload)
	if err != nil {
		return generateRandomState()
	}
	return base64.RawURLEncoding.EncodeToString(data)
}

func decodeOAuthState(state string) oauthStatePayload {
	if strings.TrimSpace(state) == "" {
		return oauthStatePayload{}
	}

	raw, err := base64.RawURLEncoding.DecodeString(state)
	if err != nil {
		return oauthStatePayload{}
	}

	var payload oauthStatePayload
	if err := json.Unmarshal(raw, &payload); err != nil {
		return oauthStatePayload{}
	}
	return payload
}

func (h *OAuthHandler) resolveRequestOrigin(r *http.Request) string {
	requestOrigin := strings.TrimSpace(r.Header.Get("Origin"))
	if requestOrigin != "" {
		return requestOrigin
	}

	referer := strings.TrimSpace(r.Referer())
	if referer == "" {
		return h.frontendBaseURL
	}

	parsedReferer, err := url.Parse(referer)
	if err != nil || parsedReferer.Scheme == "" || parsedReferer.Host == "" {
		return h.frontendBaseURL
	}

	return parsedReferer.Scheme + "://" + parsedReferer.Host
}

func (h *OAuthHandler) writeOAuthPopupResponse(w http.ResponseWriter, targetOrigin string, payload map[string]any) {
	payloadJSON, err := json.Marshal(payload)
	if err != nil {
		http.Error(w, "failed to build oauth response", http.StatusInternalServerError)
		return
	}

	targetOriginJSON, err := json.Marshal(strings.TrimSpace(targetOrigin))
	if err != nil {
		http.Error(w, "failed to build oauth response", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	_, _ = fmt.Fprintf(w, `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>OAuth Callback</title>
</head>
<body>
  <script>
    (function () {
      var payload = %s;
      var targetOrigin = %s || "*";

      if (window.opener && !window.opener.closed) {
        window.opener.postMessage(payload, targetOrigin);
        window.close();
        return;
      }

      document.body.textContent = payload.type === "OAUTH_SUCCESS"
        ? "Authentication completed. You can close this window."
        : (payload.errorDescription || "Authentication failed. You can close this window.");
    })();
  </script>
</body>
</html>`, payloadJSON, targetOriginJSON)
}
