import { apiClient } from '../../utility/api';
import type { ApiResponse } from '../../utility/response';
import type {
  ListRegistrationsParams,
  Registration,
  RegistrationListResponse,
  RejectRegistrationRequest,
} from './types';

const BASE_URL = '/admin/registrations';

export async function listRegistrationsApi(params?: ListRegistrationsParams): Promise<ApiResponse<RegistrationListResponse>> {
  const response = await apiClient.get<ApiResponse<RegistrationListResponse>>(BASE_URL, { params });
  return response.data;
}

export async function getRegistrationApi(id: string): Promise<ApiResponse<Registration>> {
  const response = await apiClient.get<ApiResponse<Registration>>(`${BASE_URL}/${id}`);
  return response.data;
}

export async function approveRegistrationApi(id: string): Promise<ApiResponse<Registration>> {
  const response = await apiClient.patch<ApiResponse<Registration>>(`${BASE_URL}/${id}/approve`);
  return response.data;
}

export async function rejectRegistrationApi(id: string, payload: RejectRegistrationRequest): Promise<ApiResponse<Registration>> {
  const response = await apiClient.patch<ApiResponse<Registration>>(`${BASE_URL}/${id}/reject`, payload);
  return response.data;
}

export async function deleteRegistrationApi(id: string): Promise<void> {
  await apiClient.delete(`${BASE_URL}/${id}`);
}
