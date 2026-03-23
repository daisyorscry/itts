/**
 * Permission utilities for PBAC (Permission-Based Access Control)
 * 
 * Permission format: "resource:action"
 * Examples: "users:create", "users:update", "events:delete", etc.
 */

import { useAuthStore } from '../store/auth.store';

/**
 * Check if user has a specific permission
 */
export function hasPermission(permission: string): boolean {
  const { user } = useAuthStore.getState();
  
  // Super admin has all permissions
  if (user?.is_super_admin) {
    return true;
  }
  
  // Check if user has the permission
  return user?.permissions?.includes(permission) || false;
}

/**
 * Check if user has ANY of the provided permissions
 */
export function hasAnyPermission(permissions: string[]): boolean {
  const { user } = useAuthStore.getState();
  
  // Super admin has all permissions
  if (user?.is_super_admin) {
    return true;
  }
  
  // Check if user has any of the permissions
  return permissions.some(permission => 
    user?.permissions?.includes(permission)
  );
}

/**
 * Check if user has ALL of the provided permissions
 */
export function hasAllPermissions(permissions: string[]): boolean {
  const { user } = useAuthStore.getState();
  
  // Super admin has all permissions
  if (user?.is_super_admin) {
    return true;
  }
  
  // Check if user has all permissions
  return permissions.every(permission => 
    user?.permissions?.includes(permission)
  );
}

/**
 * React hook to check if user has a specific permission
 * Re-renders when auth state changes
 */
export function useHasPermission(permission: string): boolean {
  const user = useAuthStore((state) => state.user);
  
  // Super admin has all permissions
  if (user?.is_super_admin) {
    return true;
  }
  
  return user?.permissions?.includes(permission) || false;
}

/**
 * React hook to check if user has ANY of the provided permissions
 */
export function useHasAnyPermission(permissions: string[]): boolean {
  const user = useAuthStore((state) => state.user);
  
  // Super admin has all permissions
  if (user?.is_super_admin) {
    return true;
  }
  
  return permissions.some(permission => 
    user?.permissions?.includes(permission)
  );
}

/**
 * React hook to check if user has ALL of the provided permissions
 */
export function useHasAllPermissions(permissions: string[]): boolean {
  const user = useAuthStore((state) => state.user);
  
  // Super admin has all permissions
  if (user?.is_super_admin) {
    return true;
  }
  
  return permissions.every(permission => 
    user?.permissions?.includes(permission)
  );
}

/**
 * React hook to get all user permissions
 */
export function usePermissions(): string[] {
  const user = useAuthStore((state) => state.user);
  return user?.permissions || [];
}

/**
 * Permission constants for type safety
 */
export const PERMISSIONS = {
  // Users
  USERS_LIST: 'users:list',
  USERS_READ: 'users:read',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  
  // Roles
  ROLES_LIST: 'roles:list',
  ROLES_READ: 'roles:read',
  ROLES_CREATE: 'roles:create',
  ROLES_UPDATE: 'roles:update',
  ROLES_DELETE: 'roles:delete',
  
  // Permissions
  PERMISSIONS_LIST: 'permissions:list',
  PERMISSIONS_READ: 'permissions:read',
  PERMISSIONS_CREATE: 'permissions:create',
  PERMISSIONS_UPDATE: 'permissions:update',
  PERMISSIONS_DELETE: 'permissions:delete',
  
  // Events
  EVENTS_LIST: 'events:list',
  EVENTS_READ: 'events:read',
  EVENTS_CREATE: 'events:create',
  EVENTS_UPDATE: 'events:update',
  EVENTS_DELETE: 'events:delete',
  
  // Event Speakers
  EVENT_SPEAKERS_LIST: 'event_speakers:list',
  EVENT_SPEAKERS_READ: 'event_speakers:read',
  EVENT_SPEAKERS_CREATE: 'event_speakers:create',
  EVENT_SPEAKERS_UPDATE: 'event_speakers:update',
  EVENT_SPEAKERS_DELETE: 'event_speakers:delete',
  
  // Event Registrations
  EVENT_REGISTRATIONS_LIST: 'event_registrations:list',
  EVENT_REGISTRATIONS_READ: 'event_registrations:read',
  EVENT_REGISTRATIONS_CREATE: 'event_registrations:create',
  EVENT_REGISTRATIONS_UPDATE: 'event_registrations:update',
  EVENT_REGISTRATIONS_DELETE: 'event_registrations:delete',
  
  // Registrations
  REGISTRATIONS_LIST: 'registrations:list',
  REGISTRATIONS_READ: 'registrations:read',
  REGISTRATIONS_CREATE: 'registrations:create',
  REGISTRATIONS_UPDATE: 'registrations:update',
  REGISTRATIONS_DELETE: 'registrations:delete',
  
  // Mentors
  MENTORS_LIST: 'mentors:list',
  MENTORS_READ: 'mentors:read',
  MENTORS_CREATE: 'mentors:create',
  MENTORS_UPDATE: 'mentors:update',
  MENTORS_DELETE: 'mentors:delete',
  
  // Partners
  PARTNERS_LIST: 'partners:list',
  PARTNERS_READ: 'partners:read',
  PARTNERS_CREATE: 'partners:create',
  PARTNERS_UPDATE: 'partners:update',
  PARTNERS_DELETE: 'partners:delete',
  
  // Roadmaps
  ROADMAPS_LIST: 'roadmaps:list',
  ROADMAPS_READ: 'roadmaps:read',
  ROADMAPS_CREATE: 'roadmaps:create',
  ROADMAPS_UPDATE: 'roadmaps:update',
  ROADMAPS_DELETE: 'roadmaps:delete',
  
  // Roadmap Items
  ROADMAP_ITEMS_LIST: 'roadmap_items:list',
  ROADMAP_ITEMS_READ: 'roadmap_items:read',
  ROADMAP_ITEMS_CREATE: 'roadmap_items:create',
  ROADMAP_ITEMS_UPDATE: 'roadmap_items:update',
  ROADMAP_ITEMS_DELETE: 'roadmap_items:delete',
} as const;
