import { User } from '../feature/auth/types';

/**
 * Check if user has a specific permission
 */
export function hasPermission(user: User | null, permission: string): boolean {
  if (!user) return false;
  
  // Super admin has all permissions
  if (user.is_super_admin) return true;
  
  // Check if user has the specific permission
  return user.permissions.includes(permission);
}

/**
 * Check if user has any of the provided permissions
 */
export function hasAnyPermission(user: User | null, permissions: string[]): boolean {
  if (!user) return false;
  if (user.is_super_admin) return true;
  
  return permissions.some(permission => user.permissions.includes(permission));
}

/**
 * Check if user has all of the provided permissions
 */
export function hasAllPermissions(user: User | null, permissions: string[]): boolean {
  if (!user) return false;
  if (user.is_super_admin) return true;
  
  return permissions.every(permission => user.permissions.includes(permission));
}

/**
 * Check if user has a specific role
 */
export function hasRole(user: User | null, roleName: string): boolean {
  if (!user) return false;
  
  return user.roles.some(role => role.name === roleName);
}

/**
 * Check if user has any of the provided roles
 */
export function hasAnyRole(user: User | null, roleNames: string[]): boolean {
  if (!user) return false;
  
  return roleNames.some(roleName => hasRole(user, roleName));
}

/**
 * Get user's primary role (first role in the array)
 */
export function getPrimaryRole(user: User | null): string | null {
  if (!user || user.roles.length === 0) return null;
  return user.roles[0].name;
}

/**
 * Check if user can perform action on resource
 * Format: "resource:action" (e.g., "events:create", "users:read")
 */
export function canPerformAction(user: User | null, resource: string, action: string): boolean {
  const permission = `${resource}:${action}`;
  return hasPermission(user, permission);
}
