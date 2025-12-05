/**
 * Auth Type Definitions & Adapters
 *
 * Types for authentication, authorization, and user management
 * Follows backend RBAC system structure
 */

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export const PERMISSIONS = {
  // Registrations
  REGISTRATIONS_CREATE: "registrations:create",
  REGISTRATIONS_READ: "registrations:read",
  REGISTRATIONS_UPDATE: "registrations:update",
  REGISTRATIONS_DELETE: "registrations:delete",
  REGISTRATIONS_LIST: "registrations:list",
  REGISTRATIONS_APPROVE: "registrations:approve",
  REGISTRATIONS_REJECT: "registrations:reject",

  // Events
  EVENTS_CREATE: "events:create",
  EVENTS_READ: "events:read",
  EVENTS_UPDATE: "events:update",
  EVENTS_DELETE: "events:delete",
  EVENTS_LIST: "events:list",

  // Event Speakers
  EVENT_SPEAKERS_CREATE: "event_speakers:create",
  EVENT_SPEAKERS_READ: "event_speakers:read",
  EVENT_SPEAKERS_UPDATE: "event_speakers:update",
  EVENT_SPEAKERS_DELETE: "event_speakers:delete",
  EVENT_SPEAKERS_LIST: "event_speakers:list",

  // Event Registrations
  EVENT_REGISTRATIONS_CREATE: "event_registrations:create",
  EVENT_REGISTRATIONS_READ: "event_registrations:read",
  EVENT_REGISTRATIONS_DELETE: "event_registrations:delete",
  EVENT_REGISTRATIONS_LIST: "event_registrations:list",

  // Roadmaps
  ROADMAPS_CREATE: "roadmaps:create",
  ROADMAPS_READ: "roadmaps:read",
  ROADMAPS_UPDATE: "roadmaps:update",
  ROADMAPS_DELETE: "roadmaps:delete",
  ROADMAPS_LIST: "roadmaps:list",

  // Roadmap Items
  ROADMAP_ITEMS_CREATE: "roadmap_items:create",
  ROADMAP_ITEMS_READ: "roadmap_items:read",
  ROADMAP_ITEMS_UPDATE: "roadmap_items:update",
  ROADMAP_ITEMS_DELETE: "roadmap_items:delete",
  ROADMAP_ITEMS_LIST: "roadmap_items:list",

  // Mentors
  MENTORS_CREATE: "mentors:create",
  MENTORS_READ: "mentors:read",
  MENTORS_UPDATE: "mentors:update",
  MENTORS_DELETE: "mentors:delete",
  MENTORS_LIST: "mentors:list",

  // Partners
  PARTNERS_CREATE: "partners:create",
  PARTNERS_READ: "partners:read",
  PARTNERS_UPDATE: "partners:update",
  PARTNERS_DELETE: "partners:delete",
  PARTNERS_LIST: "partners:list",

  // Users
  USERS_CREATE: "users:create",
  USERS_READ: "users:read",
  USERS_UPDATE: "users:update",
  USERS_DELETE: "users:delete",
  USERS_LIST: "users:list",
  USERS_MANAGE: "users:manage",

  // Roles
  ROLES_CREATE: "roles:create",
  ROLES_READ: "roles:read",
  ROLES_UPDATE: "roles:update",
  ROLES_DELETE: "roles:delete",
  ROLES_LIST: "roles:list",
  ROLES_MANAGE: "roles:manage",

  // Permissions
  PERMISSIONS_READ: "permissions:read",
  PERMISSIONS_LIST: "permissions:list",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// ============================================================================
// USER & ROLE TYPES
// ============================================================================

export type Role = {
  id: string;
  name: string;
  description?: string;
  is_system: boolean;
  parent_role_id?: string | null;
  created_at: string;
  updated_at: string;
};

export type User = {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_super_admin: boolean;
  last_login_at?: string | null;
  created_at: string;
  updated_at: string;
  roles: Role[];
  permissions: string[];
};

// ============================================================================
// AUTH RESPONSE TYPES
// ============================================================================

export type LoginResponse = {
  access_token: string;
  refresh_token: string;
  token_type: "Bearer";
  expires_in: number;
  user: User;
};

export type RefreshTokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: "Bearer";
  expires_in: number;
};

export type MeResponse = User;

// ============================================================================
// AUTH REQUEST TYPES
// ============================================================================

export type LoginRequest = {
  email: string;
  password: string;
};

export type RefreshTokenRequest = {
  refresh_token: string;
};

export type UpdateProfileRequest = {
  email?: string;
  full_name?: string;
};

export type ChangePasswordRequest = {
  old_password: string;
  new_password: string;
};

// ============================================================================
// USER MANAGEMENT TYPES
// ============================================================================

export type CreateUserRequest = {
  email: string;
  password: string;
  full_name: string;
  is_active: boolean;
  is_super_admin?: boolean;
  role_ids?: string[];
};

export type UpdateUserRequest = {
  email?: string;
  full_name?: string;
  is_active?: boolean;
};

export type AssignRolesRequest = {
  role_ids: string[];
};

export type ResetPasswordRequest = {
  new_password: string;
};

// ============================================================================
// ROLE MANAGEMENT TYPES
// ============================================================================

export type CreateRoleRequest = {
  name: string;
  description?: string;
  parent_role_id?: string;
  permission_ids?: string[];
};

export type UpdateRoleRequest = {
  name?: string;
  description?: string;
  parent_role_id?: string;
};

export type AssignPermissionsRequest = {
  permission_ids: string[];
};

export type PermissionEntity = {
  id: string;
  resource_id: string;
  action_id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
};

export type Resource = {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
};

export type Action = {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
};

// ============================================================================
// PAGINATION TYPES
// ============================================================================

export type PageResult<T> = {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export type ListUsersParams = {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: boolean;
};

export type ListRolesParams = {
  page?: number;
  page_size?: number;
  search?: string;
};

export type ListPermissionsParams = {
  page?: number;
  page_size?: number;
  resource?: string;
  action?: string;
};

// ============================================================================
// AUTH CONTEXT STATE
// ============================================================================

export type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  user: User | null,
  permission: string
): boolean {
  if (!user) return false;
  if (user.is_super_admin) return true; // Super admin has all permissions
  return user.permissions.includes(permission);
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(
  user: User | null,
  permissions: string[]
): boolean {
  if (!user) return false;
  if (user.is_super_admin) return true;
  return permissions.some((p) => user.permissions.includes(p));
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(
  user: User | null,
  permissions: string[]
): boolean {
  if (!user) return false;
  if (user.is_super_admin) return true;
  return permissions.every((p) => user.permissions.includes(p));
}

/**
 * Check if user has a specific role
 */
export function hasRole(user: User | null, roleName: string): boolean {
  if (!user) return false;
  return user.roles.some((role) => role.name === roleName);
}

/**
 * Check if user has any of the specified roles
 */
export function hasAnyRole(user: User | null, roleNames: string[]): boolean {
  if (!user) return false;
  return roleNames.some((name) => hasRole(user, name));
}

/**
 * Check if user is super admin
 */
export function isSuperAdmin(user: User | null): boolean {
  return user?.is_super_admin ?? false;
}

/**
 * Get user's role names
 */
export function getUserRoles(user: User | null): string[] {
  if (!user) return [];
  return user.roles.map((role) => role.name);
}

/**
 * Format last login date
 */
export function formatLastLogin(lastLoginAt?: string | null): string {
  if (!lastLoginAt) return "Never";
  const date = new Date(lastLoginAt);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}
