"use client";

/**
 * Auth Context & Provider
 *
 * Manages authentication state, JWT tokens, and user session
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { User, AuthState } from "./adapter";

// ============================================================================
// TOKEN STORAGE UTILITIES
// ============================================================================

const ACCESS_TOKEN_KEY = "itts_access_token";
const REFRESH_TOKEN_KEY = "itts_refresh_token";
const TOKEN_EXPIRY_KEY = "itts_token_expiry";

/**
 * Store tokens in localStorage
 */
function storeTokens(
  accessToken: string,
  refreshToken: string,
  expiresIn: number
) {
  if (typeof window === "undefined") return;

  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

  // Store expiry time (current time + expires_in seconds)
  const expiryTime = Date.now() + expiresIn * 1000;
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());
}

/**
 * Get stored tokens from localStorage
 */
function getStoredTokens(): {
  accessToken: string | null;
  refreshToken: string | null;
  expiryTime: number | null;
} {
  if (typeof window === "undefined") {
    return { accessToken: null, refreshToken: null, expiryTime: null };
  }

  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  const expiryTime = localStorage.getItem(TOKEN_EXPIRY_KEY);

  return {
    accessToken,
    refreshToken,
    expiryTime: expiryTime ? parseInt(expiryTime, 10) : null,
  };
}

/**
 * Clear all stored tokens
 */
function clearTokens() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
}

/**
 * Check if access token is expired
 */
function isTokenExpired(expiryTime: number | null): boolean {
  if (!expiryTime) return true;
  // Add 30 second buffer before actual expiry
  return Date.now() >= expiryTime - 30000;
}

// ============================================================================
// AUTH CONTEXT
// ============================================================================

type AuthContextType = AuthState & {
  login: (
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
    user: User
  ) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  updateTokens: (accessToken: string, refreshToken: string, expiresIn: number) => void;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  hasRole: (roleName: string) => boolean;
  hasAnyRole: (roleNames: string[]) => boolean;
  isSuperAdmin: () => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// AUTH PROVIDER
// ============================================================================

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const { accessToken, refreshToken, expiryTime } = getStoredTokens();

    if (!accessToken || !refreshToken) {
      setState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
      });
      return;
    }

    // Check if token is expired
    if (isTokenExpired(expiryTime)) {
      // Token expired, need to refresh
      setState({
        user: null,
        accessToken: null,
        refreshToken,
        isAuthenticated: false,
        isLoading: false,
      });
      return;
    }

    // Token is valid, fetch user info
    // This will be handled by the app calling getMe() after mount
    setState((prev) => ({
      ...prev,
      accessToken,
      refreshToken,
      isLoading: false,
    }));
  }, []);

  /**
   * Login - store tokens and user
   */
  const login = useCallback((
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
    user: User
  ) => {
    storeTokens(accessToken, refreshToken, expiresIn);
    setState({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  /**
   * Logout - clear tokens and user
   */
  const logout = useCallback(() => {
    clearTokens();
    setState({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  /**
   * Update user info (after profile update, role change, etc)
   */
  const updateUser = useCallback((user: User) => {
    setState((prev) => ({
      ...prev,
      user,
      isAuthenticated: true,
    }));
  }, []);

  /**
   * Update tokens (after refresh)
   */
  const updateTokens = useCallback((accessToken: string, refreshToken: string, expiresIn: number) => {
    storeTokens(accessToken, refreshToken, expiresIn);
    setState((prev) => ({
      ...prev,
      accessToken,
      refreshToken,
    }));
  }, []);

  /**
   * Check if user has a specific permission
   */
  const hasPermission = useCallback((permission: string): boolean => {
    if (!state.user) return false;
    if (state.user.is_super_admin) return true;
    return state.user.permissions.includes(permission);
  }, [state.user]);

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = useCallback((permissions: string[]): boolean => {
    if (!state.user) return false;
    if (state.user.is_super_admin) return true;
    return permissions.some((p) => state.user!.permissions.includes(p));
  }, [state.user]);

  /**
   * Check if user has all of the specified permissions
   */
  const hasAllPermissions = useCallback((permissions: string[]): boolean => {
    if (!state.user) return false;
    if (state.user.is_super_admin) return true;
    return permissions.every((p) => state.user!.permissions.includes(p));
  }, [state.user]);

  /**
   * Check if user has a specific role
   */
  const hasRole = useCallback((roleName: string): boolean => {
    if (!state.user) return false;
    return state.user.roles.some((role) => role.name === roleName);
  }, [state.user]);

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = useCallback((roleNames: string[]): boolean => {
    if (!state.user) return false;
    return roleNames.some((name) => hasRole(name));
  }, [state.user, hasRole]);

  /**
   * Check if user is super admin
   */
  const isSuperAdmin = useCallback((): boolean => {
    return state.user?.is_super_admin ?? false;
  }, [state.user]);

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    updateUser,
    updateTokens,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    isSuperAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ============================================================================
// USE AUTH HOOK
// ============================================================================

/**
 * Hook to access auth context
 * @throws Error if used outside AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// ============================================================================
// EXPORTS
// ============================================================================

export { AuthContext };
export type { AuthContextType };
