/**
 * OAuth Authentication
 *
 * OAuth provider integration (GitHub, Google, etc.)
 */

import type { LoginResponse } from "./adapter";

// ============================================================================
// TYPES
// ============================================================================

export type OAuthProvider = "github" | "google";

export type OAuthCallbackRequest = {
  code: string;
  state?: string;
};

export type OAuthCallbackResponse = LoginResponse;

// ============================================================================
// API CONFIGURATION
// ============================================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * Parse API response and handle errors
 */
async function parseApi<T>(res: Response): Promise<T> {
  if (res.ok) {
    try {
      const json = await res.json();
      return json.data !== undefined ? json.data : json;
    } catch {
      return {} as T;
    }
  }

  let msg = "Gagal melakukan tindakan.";
  try {
    const json = await res.json();
    msg = json.error || json.message || msg;
  } catch {
    const text = await res.text();
    msg = text || msg;
  }
  throw new Error(msg);
}

// ============================================================================
// OAUTH FUNCTIONS
// ============================================================================

/**
 * Get OAuth authorization URL
 * Backend handles OAuth flow and redirects back to frontend with tokens
 */
export function getOAuthURL(provider: OAuthProvider, redirectUri?: string): string {
  // Simply redirect to backend OAuth endpoint
  // Backend will handle GitHub OAuth and redirect back with tokens
  return `${API_BASE}/api/v1/auth/oauth/${provider}`;
}

/**
 * Handle OAuth callback after user authorizes
 * GET /api/v1/auth/oauth/{provider}/callback
 */
export async function handleOAuthCallback(
  provider: OAuthProvider,
  code: string,
  state?: string
): Promise<OAuthCallbackResponse> {
  // Verify state to prevent CSRF
  if (typeof window !== "undefined" && state) {
    const savedState = sessionStorage.getItem("oauth_state");
    if (savedState !== state) {
      throw new Error("Invalid OAuth state. Possible CSRF attack.");
    }
    sessionStorage.removeItem("oauth_state");
  }

  // Build URL with query parameters
  const params = new URLSearchParams({ code });
  if (state) {
    params.append("state", state);
  }

  const res = await fetch(`${API_BASE}/api/v1/auth/oauth/${provider}/callback?${params.toString()}`, {
    method: "GET",
    credentials: "include",
  });

  return parseApi<OAuthCallbackResponse>(res);
}

/**
 * Initiate OAuth login flow
 * Redirects to OAuth provider
 */
export function initiateOAuthLogin(
  provider: OAuthProvider,
  redirectUri?: string
): void {
  const authUrl = getOAuthURL(provider, redirectUri);

  if (typeof window !== "undefined") {
    window.location.href = authUrl;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate random state for CSRF protection
 */
function generateRandomState(): string {
  const array = new Uint8Array(16);
  if (typeof window !== "undefined" && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    // Fallback for Node.js or older browsers
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Parse OAuth callback URL parameters
 */
export function parseOAuthCallback(): {
  code: string | null;
  state: string | null;
  error: string | null;
  error_description: string | null;
} {
  if (typeof window === "undefined") {
    return { code: null, state: null, error: null, error_description: null };
  }

  const params = new URLSearchParams(window.location.search);

  return {
    code: params.get("code"),
    state: params.get("state"),
    error: params.get("error"),
    error_description: params.get("error_description"),
  };
}

/**
 * Check if current URL is OAuth callback
 */
export function isOAuthCallback(): boolean {
  if (typeof window === "undefined") return false;

  const params = new URLSearchParams(window.location.search);
  return params.has("code") && params.has("state");
}

/**
 * Get OAuth provider icon name
 */
export function getOAuthProviderIcon(provider: OAuthProvider): string {
  const icons: Record<OAuthProvider, string> = {
    github: "HiOutlineMark", // GitHub icon
    google: "HiOutlineGlobeAlt", // Google icon
  };
  return icons[provider] || "HiOutlineUserCircle";
}

/**
 * Get OAuth provider display name
 */
export function getOAuthProviderName(provider: OAuthProvider): string {
  const names: Record<OAuthProvider, string> = {
    github: "GitHub",
    google: "Google",
  };
  return names[provider] || provider;
}
