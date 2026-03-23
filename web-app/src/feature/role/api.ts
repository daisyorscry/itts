import { apiClient } from '../../utility/api';
import { ApiResponse } from '../../utility/response';
import {
  Role,
  Permission,
  PaginatedRoles,
  CreateRoleRequest,
  UpdateRoleRequest,
  AssignPermissionsRequest,
  ListRolesParams,
} from './types';

const ROLES_BASE = '/admin/roles';

// List Roles
export async function listRolesApi(params?: ListRolesParams): Promise<ApiResponse<PaginatedRoles>> {
  const response = await apiClient.get<ApiResponse<PaginatedRoles>>(ROLES_BASE, {
    params,
  });
  return response.data;
}

// Get Role Detail
export async function getRoleApi(id: string): Promise<ApiResponse<Role>> {
  const response = await apiClient.get<ApiResponse<Role>>(`${ROLES_BASE}/${id}`);
  return response.data;
}

// Create Role
export async function createRoleApi(payload: CreateRoleRequest): Promise<ApiResponse<Role>> {
  const response = await apiClient.post<ApiResponse<Role>>(ROLES_BASE, payload);
  return response.data;
}

// Update Role
export async function updateRoleApi(id: string, payload: UpdateRoleRequest): Promise<ApiResponse<Role>> {
  const response = await apiClient.patch<ApiResponse<Role>>(`${ROLES_BASE}/${id}`, payload);
  return response.data;
}

// Delete Role
export async function deleteRoleApi(id: string): Promise<void> {
  await apiClient.delete(`${ROLES_BASE}/${id}`);
}

// Get Role Permissions
export async function getRolePermissionsApi(id: string): Promise<ApiResponse<Permission[]>> {
  const response = await apiClient.get<ApiResponse<Permission[]>>(`${ROLES_BASE}/${id}/permissions`);
  return response.data;
}

// Assign Permissions to Role
export async function assignPermissionsApi(
  id: string,
  payload: AssignPermissionsRequest
): Promise<void> {
  await apiClient.post(`${ROLES_BASE}/${id}/permissions`, payload);
}
