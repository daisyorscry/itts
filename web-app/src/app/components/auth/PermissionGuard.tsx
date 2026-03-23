import { ReactNode } from 'react';
import { useHasPermission, useHasAnyPermission, useHasAllPermissions } from '../../../utils/permissions';

interface PermissionGuardProps {
  children: ReactNode;
  permission?: string;
  anyPermission?: string[];
  allPermissions?: string[];
  fallback?: ReactNode;
}

/**
 * Component that conditionally renders children based on user permissions
 * 
 * Usage:
 * - Single permission: <PermissionGuard permission="users:update">...</PermissionGuard>
 * - Any permission: <PermissionGuard anyPermission={["users:update", "users:delete"]}>...</PermissionGuard>
 * - All permissions: <PermissionGuard allPermissions={["users:list", "users:read"]}>...</PermissionGuard>
 * - With fallback: <PermissionGuard permission="users:update" fallback={<div>No access</div>}>...</PermissionGuard>
 */
export function PermissionGuard({
  children,
  permission,
  anyPermission,
  allPermissions,
  fallback = null,
}: PermissionGuardProps) {
  const hasSinglePermission = useHasPermission(permission || '');
  const hasAny = useHasAnyPermission(anyPermission || []);
  const hasAll = useHasAllPermissions(allPermissions || []);

  let hasAccess = false;

  if (permission) {
    hasAccess = hasSinglePermission;
  } else if (anyPermission && anyPermission.length > 0) {
    hasAccess = hasAny;
  } else if (allPermissions && allPermissions.length > 0) {
    hasAccess = hasAll;
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
