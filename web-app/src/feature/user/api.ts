import { apiClient } from '../../utility/api';
import { ApiResponse } from '../../utility/response';
import type {
  CreateUserRequest,
  UpdateUserRequest,
  ResetPasswordRequest,
  AssignRolesRequest,
  ListUsersParams,
  User,
  ListUsersResponse,
} from './types';

const BASE_URL = '/admin/users';

/**
 * Create a new user
 */
export async function createUserApi(payload: CreateUserRequest): Promise<ApiResponse<User>> {
  const response = await apiClient.post<ApiResponse<User>>(BASE_URL, payload);
  return response.data;
}

/**
 * List users with pagination and filters
 */
export async function listUsersApi(params?: ListUsersParams): Promise<ApiResponse<ListUsersResponse>> {
  const response = await apiClient.get<ApiResponse<ListUsersResponse>>(BASE_URL, { params });
  return response.data;
}

/**
 * Get user detail by ID
 */
export async function getUserApi(id: string): Promise<ApiResponse<User>> {
  const response = await apiClient.get<ApiResponse<User>>(`${BASE_URL}/${id}`);
  return response.data;
}

/**
 * Update user by ID
 */
export async function updateUserApi(id: string, payload: UpdateUserRequest): Promise<ApiResponse<User>> {
  const response = await apiClient.patch<ApiResponse<User>>(`${BASE_URL}/${id}`, payload);
  return response.data;
}

/**
 * Delete user by ID
 */
export async function deleteUserApi(id: string): Promise<void> {
  await apiClient.delete(`${BASE_URL}/${id}`);
}

/**
 * Reset user password
 */
export async function resetPasswordApi(id: string, payload: ResetPasswordRequest): Promise<void> {
  await apiClient.post(`${BASE_URL}/${id}/reset-password`, payload);
}

/**
 * Assign roles to user
 */
export async function assignRolesApi(id: string, payload: AssignRolesRequest): Promise<void> {
  await apiClient.post(`${BASE_URL}/${id}/roles`, payload);
}