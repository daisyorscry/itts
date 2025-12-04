"use client";

/**
 * Login Page
 *
 * Authentication page for admin/staff users
 */

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, useLogin } from "@/feature/auth";
import { useOAuthLogin } from "@/feature/auth/oauth-hooks";
import { HiEnvelope, HiLockClosed, HiEye, HiEyeSlash } from "react-icons/hi2";
import { FaGithub } from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const loginMutation = useLogin();
  const { login: oauthLogin } = useOAuthLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = searchParams.get("redirect") || "/admin/event";
      router.push(redirectTo);
    }
  }, [isAuthenticated, router, searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      return;
    }

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          const redirectTo = searchParams.get("redirect") || "/admin/event";
          router.push(redirectTo);
        },
      }
    );
  };

  const handleGitHubLogin = () => {
    const redirectTo = searchParams.get("redirect") || "/admin/event";
    const callbackUrl = `${window.location.origin}/auth/callback?provider=github&redirect=${encodeURIComponent(redirectTo)}`;
    oauthLogin("github", callbackUrl);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            ITTS Community
          </h1>
          <p className="mt-2 text-sm text-foreground/60">
            Sign in to your admin account
          </p>
        </div>

        {/* Login Form */}
        <div className="rounded-lg border border-border bg-surface p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground"
              >
                Email address
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <HiEnvelope className="h-5 w-5 text-foreground/40" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-md border border-border bg-background py-2 pl-10 pr-3 text-foreground placeholder-foreground/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="admin@itts.ac.id"
                  disabled={loginMutation.isPending}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground"
              >
                Password
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <HiLockClosed className="h-5 w-5 text-foreground/40" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border border-border bg-background py-2 pl-10 pr-10 text-foreground placeholder-foreground/40 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="••••••••"
                  disabled={loginMutation.isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  disabled={loginMutation.isPending}
                >
                  {showPassword ? (
                    <HiEyeSlash className="h-5 w-5 text-foreground/40 hover:text-foreground/60" />
                  ) : (
                    <HiEye className="h-5 w-5 text-foreground/40 hover:text-foreground/60" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loginMutation.isPending || !email || !password}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loginMutation.isPending ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="mr-2 h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-surface px-2 text-foreground/60">Or continue with</span>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGitHubLogin}
              className="flex w-full items-center justify-center gap-3 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              <FaGithub className="h-5 w-5" />
              <span>Sign in with GitHub</span>
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center text-xs text-foreground/60">
            <p>
              Default credentials: <span className="font-mono">admin@itts.ac.id</span> / <span className="font-mono">Admin123!</span>
            </p>
            <p className="mt-1">Please change your password after first login</p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-foreground/60">
          Protected by RBAC authentication system
        </p>
      </div>
    </div>
  );
}
