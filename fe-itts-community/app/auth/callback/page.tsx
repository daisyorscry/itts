"use client";

/**
 * OAuth Callback Page
 *
 * Handles OAuth callbacks from providers (GitHub, Google, etc.)
 */

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/feature/auth";
import { type Role, type User } from "@/feature/auth/adapter";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(true);
  const [hasProcessed, setHasProcessed] = useState(false);

  useEffect(() => {
    // Prevent running multiple times
    if (hasProcessed) return;

    const processCallback = async () => {
      try {
        // Check for error from backend redirect
        const error = searchParams.get("error");
        if (error) {
          setError(error);
          setProcessing(false);
          setHasProcessed(true);
          return;
        }

        // Get tokens from URL query params (backend redirected with these)
        const accessToken = searchParams.get("access_token");
        const refreshToken = searchParams.get("refresh_token");
        const expiresIn = searchParams.get("expires_in");

        // Validate required parameters
        if (!accessToken || !refreshToken) {
          setError("Missing authentication tokens");
          setProcessing(false);
          setHasProcessed(true);
          return;
        }

        // Parse user data from JWT token (decode without verification - just for display)
        const tokenParts = accessToken.split(".");
        if (tokenParts.length === 3) {
          try {
            const payload = JSON.parse(atob(tokenParts[1]));
            const user = buildUserFromPayload(payload);

            login(accessToken, refreshToken, parseInt(expiresIn || "900", 10), user);
            setHasProcessed(true);

            // Redirect to dashboard (use replace to avoid back button issues)
            const redirectTo = searchParams.get("redirect") || "/admin/event";
            setTimeout(() => {
              router.replace(redirectTo);
            }, 500);
          } catch (err) {
            setError("Failed to parse authentication data");
            setProcessing(false);
            setHasProcessed(true);
          }
        } else {
          setError("Invalid token format");
          setProcessing(false);
          setHasProcessed(true);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "OAuth authentication failed");
        setProcessing(false);
        setHasProcessed(true);
      }
    };

    processCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        {processing ? (
          <>
            <div className="flex justify-center">
              <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Authenticating...</h1>
              <p className="mt-2 text-sm text-foreground/60">
                Please wait while we complete your sign in
              </p>
            </div>
          </>
        ) : error ? (
          <>
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Authentication Failed</h1>
              <p className="mt-2 text-sm text-foreground/60">{error}</p>
              <button
                onClick={() => router.push("/login")}
                className="mt-6 rounded-md bg-primary px-6 py-2 text-sm font-semibold text-white hover:bg-primary/90"
              >
                Back to Login
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}

function buildUserFromPayload(payload: any): User {
  const nowIso = new Date().toISOString();
  const rolesPayload = Array.isArray(payload?.roles) ? payload.roles : [];
  const roles: Role[] = rolesPayload.map((role: any, index: number) => ({
    id: role?.id ?? String(index),
    name: role?.name ?? `Role ${index + 1}`,
    description: role?.description ?? undefined,
    is_system: Boolean(role?.is_system),
    parent_role_id: role?.parent_role_id ?? null,
    created_at: role?.created_at ?? nowIso,
    updated_at: role?.updated_at ?? nowIso,
  }));

  return {
    id: payload?.user_id ?? payload?.sub ?? "unknown",
    email: payload?.email ?? "unknown@example.com",
    full_name:
      payload?.full_name ??
      (payload?.email ? payload.email.split("@")[0] : "User"),
    is_active: payload?.is_active ?? true,
    is_super_admin: Boolean(payload?.is_super_admin),
    last_login_at: payload?.last_login_at ?? null,
    created_at: payload?.created_at ?? nowIso,
    updated_at: payload?.updated_at ?? nowIso,
    roles,
    permissions: Array.isArray(payload?.permissions)
      ? payload.permissions.map((perm: any) => String(perm))
      : [],
  };
}
