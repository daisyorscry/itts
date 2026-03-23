import { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAuthStore } from '../../store/auth.store';
import { hasPermission, hasAnyPermission, hasRole } from '../../utility/permissions';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requirePermission?: string;
  requireAnyPermission?: string[];
  requireRole?: string;
  redirectTo?: string;
}

/**
 * ProtectedRoute component untuk handle authorization
 * 
 * Usage:
 * <ProtectedRoute requireAuth>
 *   <AdminDashboard />
 * </ProtectedRoute>
 * 
 * <ProtectedRoute requirePermission="events:create">
 *   <CreateEvent />
 * </ProtectedRoute>
 * 
 * <ProtectedRoute requireAnyPermission={["events:create", "events:update"]}>
 *   <EventManagement />
 * </ProtectedRoute>
 */
export function ProtectedRoute({
  children,
  requireAuth = true,
  requirePermission,
  requireAnyPermission,
  requireRole,
  redirectTo = '/sign-in',
}: ProtectedRouteProps) {
  const { isAuthenticated, isHydrated, user } = useAuthStore();

  if (requireAuth && !isHydrated) {
    return null;
  }

  // Check authentication
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check specific permission
  if (requirePermission && !hasPermission(user, requirePermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check any permission from list
  if (requireAnyPermission && !hasAnyPermission(user, requireAnyPermission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check role
  if (requireRole && !hasRole(user, requireRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
