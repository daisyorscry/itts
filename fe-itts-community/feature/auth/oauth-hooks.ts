"use client";

/**
 * OAuth React Query Hooks
 */

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "./context";
import { handleOAuthCallback, initiateOAuthLogin, type OAuthProvider } from "./oauth";

// ============================================================================
// OAUTH HOOKS
// ============================================================================

/**
 * Hook to initiate OAuth login
 * Redirects to OAuth provider
 */
export function useOAuthLogin() {
  return {
    login: (provider: OAuthProvider, redirectUri?: string) => {
      initiateOAuthLogin(provider, redirectUri);
    },
  };
}

/**
 * Hook to handle OAuth callback
 * Processes code and exchanges for tokens
 */
export function useOAuthCallback() {
  const { login } = useAuth();

  return useMutation({
    mutationFn: ({
      provider,
      code,
      state,
    }: {
      provider: OAuthProvider;
      code: string;
      state?: string;
    }) => handleOAuthCallback(provider, code, state),
    onSuccess: (response) => {
      // Store tokens and user in context
      login(
        response.access_token,
        response.refresh_token,
        response.expires_in,
        response.user
      );

      toast.success(`Welcome back, ${response.user.full_name}!`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "OAuth authentication failed");
    },
  });
}
