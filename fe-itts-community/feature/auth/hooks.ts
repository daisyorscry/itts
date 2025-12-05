"use client";

/**
 * Auth React Query Hooks
 *
 * Query and mutation hooks for authentication operations
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "./context";
import * as api from "./api";
import type {
  LoginRequest,
  ChangePasswordRequest,
  CreateUserRequest,
  UpdateUserRequest,
  AssignRolesRequest,
  ResetPasswordRequest,
  CreateRoleRequest,
  UpdateRoleRequest,
  AssignPermissionsRequest,
  ListUsersParams,
  ListRolesParams,
  ListPermissionsParams,
} from "./adapter";

// ============================================================================
// QUERY KEYS
// ============================================================================

export const QK = {
  me: ["auth", "me"] as const,
  users: (params?: ListUsersParams) => ["auth", "users", params] as const,
  user: (id: string) => ["auth", "user", id] as const,
  roles: (params?: ListRolesParams) => ["auth", "roles", params] as const,
  role: (id: string) => ["auth", "role", id] as const,
  rolePermissions: (id: string) => ["auth", "role", id, "permissions"] as const,
  permissions: (params?: ListPermissionsParams) =>
    ["auth", "permissions", params] as const,
  permission: (id: string) => ["auth", "permission", id] as const,
  resources: ["auth", "resources"] as const,
  actions: ["auth", "actions"] as const,
} as const;

// ============================================================================
// AUTHENTICATION HOOKS
// ============================================================================

/**
 * Login mutation
 */
export function useLogin() {
  const { login } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => api.login(data),
    onSuccess: (response) => {
      // Store tokens and user in context
      login(
        response.access_token,
        response.refresh_token,
        response.expires_in,
        response.user
      );

      // Invalidate all queries to refetch with new auth
      queryClient.invalidateQueries();

      toast.success(`Welcome back, ${response.user.full_name}!`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Login failed");
    },
  });
}

/**
 * Logout mutation
 */
export function useLogout() {
  const { logout: logoutContext, refreshToken, accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!refreshToken) throw new Error("No refresh token");
      await api.logout(refreshToken, accessToken);
    },
    onSuccess: () => {
      // Clear auth context
      logoutContext();

      // Clear all queries
      queryClient.clear();

      toast.success("Logged out successfully");
    },
    onError: (error: Error) => {
      // Even if logout API fails, clear local state
      logoutContext();
      queryClient.clear();
      toast.error(error.message || "Logout failed");
    },
  });
}

/**
 * Refresh token mutation
 */
export function useRefreshToken() {
  const { refreshToken, updateTokens } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!refreshToken) throw new Error("No refresh token");
      return api.refreshToken({ refresh_token: refreshToken });
    },
    onSuccess: (response) => {
      updateTokens(
        response.access_token,
        response.refresh_token,
        response.expires_in
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "Session expired, please login again");
    },
  });
}

/**
 * Get current user query
 *
 * Fetches user data and automatically updates auth context when successful.
 * Only fetches if user is not already in context.
 */
export function useMe() {
  const { accessToken, logout, user, updateUser } = useAuth();

  return useQuery({
    queryKey: QK.me,
    queryFn: async () => {
      if (!accessToken) throw new Error("No access token");
      const userData = await api.getMe(accessToken);
      // Update context immediately after successful fetch
      updateUser(userData);
      return userData;
    },
    // Only fetch if we have token AND don't have user data in context yet
    enabled: !!accessToken && !user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 401 (unauthorized)
      if (error instanceof Error && error.message.includes("401")) {
        logout(); // Auto logout on 401
        return false;
      }
      return failureCount < 2;
    },
  });
}

/**
 * Update profile mutation
 */
export function useUpdateProfile() {
  const { accessToken, updateUser } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => {
      if (!accessToken) throw new Error("Not authenticated");
      return api.updateProfile(data, accessToken);
    },
    onSuccess: (userData) => {
      // Update context with new user data
      updateUser(userData);
      queryClient.invalidateQueries({ queryKey: QK.me });
      toast.success("Profile updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });
}

/**
 * Change password mutation
 */
export function useChangePassword() {
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => {
      if (!accessToken) throw new Error("Not authenticated");
      return api.changePassword(data, accessToken);
    },
    onSuccess: () => {
      toast.success("Password changed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to change password");
    },
  });
}

// ============================================================================
// USER MANAGEMENT HOOKS (Admin)
// ============================================================================

/**
 * List users query
 */
export function useListUsers(params: ListUsersParams = {}) {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: QK.users(params),
    queryFn: () => {
      if (!accessToken) throw new Error("Not authenticated");
      return api.listUsers(params, accessToken);
    },
    enabled: !!accessToken,
  });
}

/**
 * Get user query
 */
export function useGetUser(userId: string, enabled = true) {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: QK.user(userId),
    queryFn: () => {
      if (!accessToken) throw new Error("Not authenticated");
      return api.getUser(userId, accessToken);
    },
    enabled: !!accessToken && enabled && !!userId,
  });
}

/**
 * Create user mutation
 */
export function useCreateUser() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => {
      if (!accessToken) throw new Error("Not authenticated");
      return api.createUser(data, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "users"] });
      toast.success("User created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create user");
    },
  });
}

/**
 * Update user mutation
 */
export function useUpdateUser() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserRequest }) => {
      if (!accessToken) throw new Error("Not authenticated");
      return api.updateUser(userId, data, accessToken);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["auth", "users"] });
      queryClient.invalidateQueries({ queryKey: QK.user(variables.userId) });
      toast.success("User updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update user");
    },
  });
}

/**
 * Delete user mutation
 */
export function useDeleteUser() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => {
      if (!accessToken) throw new Error("Not authenticated");
      return api.deleteUser(userId, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "users"] });
      toast.success("User deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete user");
    },
  });
}

/**
 * Assign roles to user mutation
 */
export function useAssignRoles() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: AssignRolesRequest }) => {
      if (!accessToken) throw new Error("Not authenticated");
      return api.assignRolesToUser(userId, data, accessToken);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["auth", "users"] });
      queryClient.invalidateQueries({ queryKey: QK.user(variables.userId) });
      toast.success("Roles assigned successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to assign roles");
    },
  });
}

/**
 * Reset user password mutation
 */
export function useResetUserPassword() {
  const { accessToken } = useAuth();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: ResetPasswordRequest }) => {
      if (!accessToken) throw new Error("Not authenticated");
      return api.resetUserPassword(userId, data, accessToken);
    },
    onSuccess: () => {
      toast.success("Password reset successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reset password");
    },
  });
}

// ============================================================================
// ROLE MANAGEMENT HOOKS (Admin)
// ============================================================================

/**
 * List roles query
 */
export function useListRoles(params: ListRolesParams = {}) {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: QK.roles(params),
    queryFn: () => {
      if (!accessToken) throw new Error("Not authenticated");
      return api.listRoles(params, accessToken);
    },
    enabled: !!accessToken,
  });
}

/**
 * Get role query
 */
export function useGetRole(roleId: string, enabled = true) {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: QK.role(roleId),
    queryFn: () => {
      if (!accessToken) throw new Error("Not authenticated");
      return api.getRole(roleId, accessToken);
    },
    enabled: !!accessToken && enabled && !!roleId,
  });
}

/**
 * Create role mutation
 */
export function useCreateRole() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRoleRequest) => {
      if (!accessToken) throw new Error("Not authenticated");
      return api.createRole(data, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "roles"] });
      toast.success("Role created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create role");
    },
  });
}

/**
 * Update role mutation
 */
export function useUpdateRole() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roleId, data }: { roleId: string; data: UpdateRoleRequest }) => {
      if (!accessToken) throw new Error("Not authenticated");
      return api.updateRole(roleId, data, accessToken);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["auth", "roles"] });
      queryClient.invalidateQueries({ queryKey: QK.role(variables.roleId) });
      toast.success("Role updated successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update role");
    },
  });
}

/**
 * Delete role mutation
 */
export function useDeleteRole() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleId: string) => {
      if (!accessToken) throw new Error("Not authenticated");
      return api.deleteRole(roleId, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "roles"] });
      toast.success("Role deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete role");
    },
  });
}

/**
 * Assign permissions to role mutation
 */
export function useAssignPermissions() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      roleId,
      data,
    }: {
      roleId: string;
      data: AssignPermissionsRequest;
    }) => {
      if (!accessToken) throw new Error("Not authenticated");
      return api.assignPermissionsToRole(roleId, data, accessToken);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["auth", "roles"] });
      queryClient.invalidateQueries({ queryKey: QK.role(variables.roleId) });
      queryClient.invalidateQueries({
        queryKey: QK.rolePermissions(variables.roleId),
      });
      toast.success("Permissions assigned successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to assign permissions");
    },
  });
}

/**
 * Get role permissions query
 */
export function useGetRolePermissions(roleId: string, enabled = true) {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: QK.rolePermissions(roleId),
    queryFn: () => {
      if (!accessToken) throw new Error("Not authenticated");
      return api.getRolePermissions(roleId, accessToken);
    },
    enabled: !!accessToken && enabled && !!roleId,
  });
}

// ============================================================================
// PERMISSION MANAGEMENT HOOKS (Admin)
// ============================================================================

/**
 * List permissions query
 */
export function useListPermissions(params: ListPermissionsParams = {}) {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: QK.permissions(params),
    queryFn: () => {
      if (!accessToken) throw new Error("Not authenticated");
      return api.listPermissions(params, accessToken);
    },
    enabled: !!accessToken,
  });
}

/**
 * Get permission query
 */
export function useGetPermission(permissionId: string, enabled = true) {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: QK.permission(permissionId),
    queryFn: () => {
      if (!accessToken) throw new Error("Not authenticated");
      return api.getPermission(permissionId, accessToken);
    },
    enabled: !!accessToken && enabled && !!permissionId,
  });
}

/**
 * List resources query
 */
export function useListResources() {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: QK.resources,
    queryFn: () => {
      if (!accessToken) throw new Error("Not authenticated");
      return api.listResources(accessToken);
    },
    enabled: !!accessToken,
    staleTime: 60 * 60 * 1000, // 1 hour (resources rarely change)
  });
}

/**
 * List actions query
 */
export function useListActions() {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: QK.actions,
    queryFn: () => {
      if (!accessToken) throw new Error("Not authenticated");
      return api.listActions(accessToken);
    },
    enabled: !!accessToken,
    staleTime: 60 * 60 * 1000, // 1 hour (actions rarely change)
  });
}
