/**
 * Auth API Service
 *
 * API functions for authentication and authorization
 */

import type {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  MeResponse,
  ChangePasswordRequest,
  CreateUserRequest,
  UpdateUserRequest,
  AssignRolesRequest,
  ResetPasswordRequest,
  CreateRoleRequest,
  UpdateRoleRequest,
  AssignPermissionsRequest,
  UpdateProfileRequest,
  User,
  Role,
  PermissionEntity,
  Resource,
  Action,
  PageResult,
  ListUsersParams,
  ListRolesParams,
  ListPermissionsParams,
} from "./adapter";

// ============================================================================
// API CONFIGURATION
// ============================================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * Parse API response and handle errors
 */
async function parseApi<T>(res: Response): Promise<T> {
  if (res.ok) {
    try {
      const json = await res.json();
      // Backend wraps responses in { data: ... }
      return json.data !== undefined ? json.data : json;
    } catch {
      // Handle 204 No Content or empty responses
      return {} as T;
    }
  }

  // Handle errors - standardized backend format
  let msg = "Failed to perform action.";
  try {
    const json = await res.json();
    // New standardized format: { error: { code, message }, meta }
    if (json.error && json.error.message) {
      msg = json.error.message;
    } else if (json.message) {
      msg = json.message;
    } else if (json.error && typeof json.error === 'string') {
      msg = json.error;
    }
  } catch {
    const text = await res.text();
    msg = text || msg;
  }
  throw new Error(msg);
}

/**
 * Build query string from params
 */
function buildQueryString(
  params: Record<string, string | number | boolean | undefined>
): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

/**
 * Get auth headers with Bearer token
 */
function getAuthHeaders(token?: string | null): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

// ============================================================================
// AUTHENTICATION ENDPOINTS
// ============================================================================

/**
 * Login with email and password
 * POST /api/v1/auth/login
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return parseApi<LoginResponse>(res);
}

/**
 * Refresh access token using refresh token
 * POST /api/v1/auth/refresh
 */
export async function refreshToken(
  data: RefreshTokenRequest
): Promise<RefreshTokenResponse> {
  const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return parseApi<RefreshTokenResponse>(res);
}

/**
 * Logout and revoke refresh token
 * POST /api/v1/auth/logout
 */
export async function logout(
  refreshToken: string,
  accessToken?: string | null | null
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/auth/logout`, {
    method: "POST",
    headers: getAuthHeaders(accessToken),
    credentials: "include",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  await parseApi(res);
}

/**
 * Get current user info
 * GET /api/v1/auth/me
 */
export async function getMe(accessToken: string): Promise<MeResponse> {
  const res = await fetch(`${API_BASE}/api/v1/auth/me`, {
    method: "GET",
    headers: getAuthHeaders(accessToken),
    credentials: "include",
  });
  return parseApi<MeResponse>(res);
}

/**
 * Update current user's profile
 * PATCH /api/v1/auth/me
 */
export async function updateProfile(
  data: UpdateProfileRequest,
  accessToken: string
): Promise<MeResponse> {
  const res = await fetch(`${API_BASE}/api/v1/auth/me`, {
    method: "PATCH",
    headers: getAuthHeaders(accessToken),
    credentials: "include",
    body: JSON.stringify(data),
  });
  return parseApi<MeResponse>(res);
}

/**
 * Change current user's password
 * POST /api/v1/auth/change-password
 */
export async function changePassword(
  data: ChangePasswordRequest,
  accessToken: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/auth/change-password`, {
    method: "POST",
    headers: getAuthHeaders(accessToken),
    credentials: "include",
    body: JSON.stringify(data),
  });
  await parseApi(res);
}

// ============================================================================
// USER MANAGEMENT ENDPOINTS (Admin)
// ============================================================================

/**
 * List all users with pagination
 * GET /api/v1/admin/users
 */
export async function listUsers(
  params: ListUsersParams,
  accessToken: string
): Promise<PageResult<User>> {
  const query = buildQueryString(params);
  const res = await fetch(`${API_BASE}/api/v1/admin/users${query}`, {
    method: "GET",
    headers: getAuthHeaders(accessToken),
    credentials: "include",
  });
  return parseApi<PageResult<User>>(res);
}

/**
 * Get user by ID
 * GET /api/v1/admin/users/:id
 */
export async function getUser(
  userId: string,
  accessToken: string
): Promise<User> {
  const res = await fetch(`${API_BASE}/api/v1/admin/users/${userId}`, {
    method: "GET",
    headers: getAuthHeaders(accessToken),
    credentials: "include",
  });
  return parseApi<User>(res);
}

/**
 * Create new user
 * POST /api/v1/admin/users
 */
export async function createUser(
  data: CreateUserRequest,
  accessToken: string
): Promise<User> {
  const res = await fetch(`${API_BASE}/api/v1/admin/users`, {
    method: "POST",
    headers: getAuthHeaders(accessToken),
    credentials: "include",
    body: JSON.stringify(data),
  });
  return parseApi<User>(res);
}

/**
 * Update user
 * PATCH /api/v1/admin/users/:id
 */
export async function updateUser(
  userId: string,
  data: UpdateUserRequest,
  accessToken: string
): Promise<User> {
  const res = await fetch(`${API_BASE}/api/v1/admin/users/${userId}`, {
    method: "PATCH",
    headers: getAuthHeaders(accessToken),
    credentials: "include",
    body: JSON.stringify(data),
  });
  return parseApi<User>(res);
}

/**
 * Delete user
 * DELETE /api/v1/admin/users/:id
 */
export async function deleteUser(
  userId: string,
  accessToken: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/admin/users/${userId}`, {
    method: "DELETE",
    headers: getAuthHeaders(accessToken),
    credentials: "include",
  });
  await parseApi(res);
}

/**
 * Assign roles to user
 * POST /api/v1/admin/users/:id/roles
 */
export async function assignRolesToUser(
  userId: string,
  data: AssignRolesRequest,
  accessToken: string
): Promise<User> {
  const res = await fetch(`${API_BASE}/api/v1/admin/users/${userId}/roles`, {
    method: "POST",
    headers: getAuthHeaders(accessToken),
    credentials: "include",
    body: JSON.stringify(data),
  });
  return parseApi<User>(res);
}

/**
 * Reset user password (admin action)
 * POST /api/v1/admin/users/:id/reset-password
 */
export async function resetUserPassword(
  userId: string,
  data: ResetPasswordRequest,
  accessToken: string
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/api/v1/admin/users/${userId}/reset-password`,
    {
      method: "POST",
      headers: getAuthHeaders(accessToken),
      credentials: "include",
      body: JSON.stringify(data),
    }
  );
  await parseApi(res);
}

// ============================================================================
// ROLE MANAGEMENT ENDPOINTS (Admin)
// ============================================================================

/**
 * List all roles with pagination
 * GET /api/v1/admin/roles
 */
export async function listRoles(
  params: ListRolesParams,
  accessToken: string
): Promise<PageResult<Role>> {
  const query = buildQueryString(params);
  const res = await fetch(`${API_BASE}/api/v1/admin/roles${query}`, {
    method: "GET",
    headers: getAuthHeaders(accessToken),
    credentials: "include",
  });
  return parseApi<PageResult<Role>>(res);
}

/**
 * Get role by ID
 * GET /api/v1/admin/roles/:id
 */
export async function getRole(
  roleId: string,
  accessToken: string
): Promise<Role> {
  const res = await fetch(`${API_BASE}/api/v1/admin/roles/${roleId}`, {
    method: "GET",
    headers: getAuthHeaders(accessToken),
    credentials: "include",
  });
  return parseApi<Role>(res);
}

/**
 * Create new role
 * POST /api/v1/admin/roles
 */
export async function createRole(
  data: CreateRoleRequest,
  accessToken: string
): Promise<Role> {
  const res = await fetch(`${API_BASE}/api/v1/admin/roles`, {
    method: "POST",
    headers: getAuthHeaders(accessToken),
    credentials: "include",
    body: JSON.stringify(data),
  });
  return parseApi<Role>(res);
}

/**
 * Update role
 * PATCH /api/v1/admin/roles/:id
 */
export async function updateRole(
  roleId: string,
  data: UpdateRoleRequest,
  accessToken: string
): Promise<Role> {
  const res = await fetch(`${API_BASE}/api/v1/admin/roles/${roleId}`, {
    method: "PATCH",
    headers: getAuthHeaders(accessToken),
    credentials: "include",
    body: JSON.stringify(data),
  });
  return parseApi<Role>(res);
}

/**
 * Delete role
 * DELETE /api/v1/admin/roles/:id
 */
export async function deleteRole(
  roleId: string,
  accessToken: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/admin/roles/${roleId}`, {
    method: "DELETE",
    headers: getAuthHeaders(accessToken),
    credentials: "include",
  });
  await parseApi(res);
}

/**
 * Assign permissions to role
 * POST /api/v1/admin/roles/:id/permissions
 */
export async function assignPermissionsToRole(
  roleId: string,
  data: AssignPermissionsRequest,
  accessToken: string
): Promise<Role> {
  const res = await fetch(
    `${API_BASE}/api/v1/admin/roles/${roleId}/permissions`,
    {
      method: "POST",
      headers: getAuthHeaders(accessToken),
      credentials: "include",
      body: JSON.stringify(data),
    }
  );
  return parseApi<Role>(res);
}

/**
 * Get role permissions
 * GET /api/v1/admin/roles/:id/permissions
 */
export async function getRolePermissions(
  roleId: string,
  accessToken: string
): Promise<PermissionEntity[]> {
  const res = await fetch(
    `${API_BASE}/api/v1/admin/roles/${roleId}/permissions`,
    {
      method: "GET",
      headers: getAuthHeaders(accessToken),
      credentials: "include",
    }
  );
  return parseApi<PermissionEntity[]>(res);
}

// ============================================================================
// PERMISSION MANAGEMENT ENDPOINTS (Admin)
// ============================================================================

/**
 * List all permissions with pagination
 * GET /api/v1/admin/permissions
 */
export async function listPermissions(
  params: ListPermissionsParams,
  accessToken: string
): Promise<PageResult<PermissionEntity>> {
  const query = buildQueryString(params);
  const res = await fetch(`${API_BASE}/api/v1/admin/permissions${query}`, {
    method: "GET",
    headers: getAuthHeaders(accessToken),
    credentials: "include",
  });
  return parseApi<PageResult<PermissionEntity>>(res);
}

/**
 * Get permission by ID
 * GET /api/v1/admin/permissions/:id
 */
export async function getPermission(
  permissionId: string,
  accessToken: string
): Promise<PermissionEntity> {
  const res = await fetch(
    `${API_BASE}/api/v1/admin/permissions/${permissionId}`,
    {
      method: "GET",
      headers: getAuthHeaders(accessToken),
      credentials: "include",
    }
  );
  return parseApi<PermissionEntity>(res);
}

/**
 * List all resources
 * GET /api/v1/admin/resources
 */
export async function listResources(accessToken: string): Promise<Resource[]> {
  const res = await fetch(`${API_BASE}/api/v1/admin/resources`, {
    method: "GET",
    headers: getAuthHeaders(accessToken),
    credentials: "include",
  });
  return parseApi<Resource[]>(res);
}

/**
 * List all actions
 * GET /api/v1/admin/actions
 */
export async function listActions(accessToken: string): Promise<Action[]> {
  const res = await fetch(`${API_BASE}/api/v1/admin/actions`, {
    method: "GET",
    headers: getAuthHeaders(accessToken),
    credentials: "include",
  });
  return parseApi<Action[]>(res);
}
