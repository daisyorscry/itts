"use client";

/**
 * Auth Components
 *
 * Reusable components for authentication and authorization
 */

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./context";
import { useMe } from "./hooks";

// ============================================================================
// PROTECTED ROUTE WRAPPER
// ============================================================================

type ProtectedRouteProps = {
  children: ReactNode;
  /**
   * Required permission to access this route
   * If not provided, only authentication is required
   */
  permission?: string;
  /**
   * Required permissions (user must have ALL)
   */
  allPermissions?: string[];
  /**
   * Required permissions (user must have ANY)
   */
  anyPermissions?: string[];
  /**
   * Required role name
   */
  role?: string;
  /**
   * Required roles (user must have ANY)
   */
  anyRoles?: string[];
  /**
   * Require super admin
   */
  requireSuperAdmin?: boolean;
  /**
   * Redirect path when not authenticated (default: /login)
   */
  loginPath?: string;
  /**
   * Redirect path when not authorized (default: /)
   */
  unauthorizedPath?: string;
  /**
   * Loading component
   */
  loading?: ReactNode;
};

/**
 * Protected route wrapper component
 * Redirects to login if not authenticated
 * Redirects to unauthorized page if missing permissions
 */
export function ProtectedRoute({
  children,
  permission,
  allPermissions,
  anyPermissions,
  role,
  anyRoles,
  requireSuperAdmin,
  loginPath = "/login",
  unauthorizedPath = "/",
  loading,
}: ProtectedRouteProps) {
  const router = useRouter();
  const {
    isAuthenticated,
    isLoading: authLoading,
    user,
    hasPermission,
    hasAllPermissions: checkAllPermissions,
    hasAnyPermission,
    hasRole,
    hasAnyRole,
    isSuperAdmin,
  } = useAuth();

  // Fetch user data if authenticated but no user info in context
  // useMe hook is already configured to only run when needed
  const { isLoading: meLoading } = useMe();

  const isLoading = authLoading || meLoading;

  useEffect(() => {
    if (isLoading) return;

    // Not authenticated -> redirect to login
    if (!isAuthenticated || !user) {
      router.push(loginPath);
      return;
    }

    // Check super admin requirement
    if (requireSuperAdmin && !isSuperAdmin()) {
      router.push(unauthorizedPath);
      return;
    }

    // Check single permission
    if (permission && !hasPermission(permission)) {
      router.push(unauthorizedPath);
      return;
    }

    // Check all permissions
    if (allPermissions && !checkAllPermissions(allPermissions)) {
      router.push(unauthorizedPath);
      return;
    }

    // Check any permissions
    if (anyPermissions && !hasAnyPermission(anyPermissions)) {
      router.push(unauthorizedPath);
      return;
    }

    // Check single role
    if (role && !hasRole(role)) {
      router.push(unauthorizedPath);
      return;
    }

    // Check any roles
    if (anyRoles && !hasAnyRole(anyRoles)) {
      router.push(unauthorizedPath);
      return;
    }
  }, [
    isAuthenticated,
    isLoading,
    user,
    permission,
    allPermissions,
    anyPermissions,
    role,
    anyRoles,
    requireSuperAdmin,
    loginPath,
    unauthorizedPath,
    router,
    hasPermission,
    checkAllPermissions,
    hasAnyPermission,
    hasRole,
    hasAnyRole,
    isSuperAdmin,
  ]);

  // Show loading state
  if (isLoading) {
    return (
      <>
        {loading || (
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-sm text-foreground/60">Loading...</p>
            </div>
          </div>
        )}
      </>
    );
  }

  // Not authenticated or not authorized
  if (!isAuthenticated || !user) {
    return null; // Will redirect in useEffect
  }

  // Check authorization
  if (requireSuperAdmin && !isSuperAdmin()) return null;
  if (permission && !hasPermission(permission)) return null;
  if (allPermissions && !checkAllPermissions(allPermissions)) return null;
  if (anyPermissions && !hasAnyPermission(anyPermissions)) return null;
  if (role && !hasRole(role)) return null;
  if (anyRoles && !hasAnyRole(anyRoles)) return null;

  return <>{children}</>;
}

// ============================================================================
// PERMISSION-BASED UI COMPONENTS
// ============================================================================

type CanAccessProps = {
  children: ReactNode;
  /**
   * Required permission to render children
   */
  permission?: string;
  /**
   * Required permissions (user must have ALL)
   */
  allPermissions?: string[];
  /**
   * Required permissions (user must have ANY)
   */
  anyPermissions?: string[];
  /**
   * Required role name
   */
  role?: string;
  /**
   * Required roles (user must have ANY)
   */
  anyRoles?: string[];
  /**
   * Require super admin
   */
  requireSuperAdmin?: boolean;
  /**
   * Fallback component when not authorized
   */
  fallback?: ReactNode;
};

/**
 * Conditionally render children based on permissions
 * Does not redirect, just hides content
 */
export function CanAccess({
  children,
  permission,
  allPermissions,
  anyPermissions,
  role,
  anyRoles,
  requireSuperAdmin,
  fallback = null,
}: CanAccessProps) {
  const {
    user,
    hasPermission,
    hasAllPermissions: checkAllPermissions,
    hasAnyPermission,
    hasRole,
    hasAnyRole,
    isSuperAdmin,
  } = useAuth();

  // Not authenticated
  if (!user) return <>{fallback}</>;

  // Check super admin
  if (requireSuperAdmin && !isSuperAdmin()) return <>{fallback}</>;

  // Check single permission
  if (permission && !hasPermission(permission)) return <>{fallback}</>;

  // Check all permissions
  if (allPermissions && !checkAllPermissions(allPermissions))
    return <>{fallback}</>;

  // Check any permissions
  if (anyPermissions && !hasAnyPermission(anyPermissions))
    return <>{fallback}</>;

  // Check single role
  if (role && !hasRole(role)) return <>{fallback}</>;

  // Check any roles
  if (anyRoles && !hasAnyRole(anyRoles)) return <>{fallback}</>;

  return <>{children}</>;
}

// ============================================================================
// REQUIRE AUTHENTICATION WRAPPER
// ============================================================================

type RequireAuthProps = {
  children: ReactNode;
  loginPath?: string;
  loading?: ReactNode;
};

/**
 * Simple authentication wrapper
 * Only checks if user is authenticated, no permission checks
 */
export function RequireAuth({
  children,
  loginPath = "/login",
  loading,
}: RequireAuthProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { isLoading: meLoading } = useMe();

  const isLoading = authLoading || meLoading;

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !user)) {
      router.push(loginPath);
    }
  }, [isAuthenticated, isLoading, user, loginPath, router]);

  if (isLoading) {
    return (
      <>
        {loading || (
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-sm text-foreground/60">Loading...</p>
            </div>
          </div>
        )}
      </>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return <>{children}</>;
}

// ============================================================================
// ROLE BADGE COMPONENT
// ============================================================================

type RoleBadgeProps = {
  roleName: string;
  className?: string;
};

/**
 * Display role badge with color coding
 */
export function RoleBadge({ roleName, className = "" }: RoleBadgeProps) {
  const roleColors: Record<string, string> = {
    super_admin: "bg-red-500/10 text-red-600 dark:text-red-400",
    admin: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
    moderator: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    event_manager: "bg-green-500/10 text-green-600 dark:text-green-400",
    content_manager: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    viewer: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
  };

  const color = roleColors[roleName] || "bg-gray-500/10 text-gray-600";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${color} ${className}`}
    >
      {roleName.replace(/_/g, " ")}
    </span>
  );
}

// ============================================================================
// USER AVATAR COMPONENT
// ============================================================================

type UserAvatarProps = {
  user: {
    full_name: string;
    email: string;
  };
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  className?: string;
};

/**
 * User avatar with initials
 */
export function UserAvatar({
  user,
  size = "md",
  showName = false,
  className = "",
}: UserAvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  // Get initials from full name
  const initials = user.full_name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`flex items-center justify-center rounded-full bg-primary/10 font-semibold text-primary ${sizeClasses[size]}`}
      >
        {initials}
      </div>
      {showName && (
        <div className="flex flex-col">
          <span className="text-sm font-medium">{user.full_name}</span>
          <span className="text-xs text-foreground/60">{user.email}</span>
        </div>
      )}
    </div>
  );
}
