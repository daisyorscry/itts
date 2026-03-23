// Permission API client

import { apiClient } from '../../utility/api';
import type { ApiResponse } from '../../utility/response';
import type {
  PermissionListResponse,
  PermissionDetailResponse,
  Resource,
  Action,
  ListPermissionsParams,
} from './types';

const BASE_URL = '/admin';

/**
 * List all permissions with optional filters
 * Required permission: permissions:list
 */
export async function listPermissions(params?: ListPermissionsParams): Promise<PermissionListResponse> {
  const response = await apiClient.get<ApiResponse<PermissionListResponse>>(`${BASE_URL}/permissions`, {
    params,
  });
  return response.data.data;
}

/**
 * Get permission detail by ID
 * Required permission: permissions:read
 */
export async function getPermission(id: string): Promise<PermissionDetailResponse> {
  const response = await apiClient.get<ApiResponse<PermissionDetailResponse>>(`${BASE_URL}/permissions/${id}`);
  return response.data.data;
}

/**
 * List all resources
 * Required permission: permissions:list OR roles:create OR roles:update
 */
export async function listResources(): Promise<Resource[]> {
  const response = await apiClient.get<ApiResponse<Resource[]>>(`${BASE_URL}/resources`);
  return response.data.data;
}

/**
 * List all actions
 * Required permission: permissions:list OR roles:create OR roles:update
 */
export async function listActions(): Promise<Action[]> {
  const response = await apiClient.get<ApiResponse<Action[]>>(`${BASE_URL}/actions`);
  return response.data.data;
}