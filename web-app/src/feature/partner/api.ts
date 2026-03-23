import { apiClient } from '../../utility/api';
import type { ApiResponse } from '../../utility/response';
import type {
  CreatePartnerRequest,
  ListPartnersParams,
  Partner,
  PartnerListResponse,
  SetPartnerActiveRequest,
  SetPartnerPriorityRequest,
  UpdatePartnerRequest,
} from './types';

const BASE_URL = '/admin/partners';

export async function listPartnersApi(params?: ListPartnersParams): Promise<ApiResponse<PartnerListResponse>> {
  const response = await apiClient.get<ApiResponse<PartnerListResponse>>(BASE_URL, { params });
  return response.data;
}

export async function getPartnerApi(id: string): Promise<ApiResponse<Partner>> {
  const response = await apiClient.get<ApiResponse<Partner>>(`${BASE_URL}/${id}`);
  return response.data;
}

export async function createPartnerApi(payload: CreatePartnerRequest): Promise<ApiResponse<Partner>> {
  const response = await apiClient.post<ApiResponse<Partner>>(BASE_URL, payload);
  return response.data;
}

export async function updatePartnerApi(id: string, payload: UpdatePartnerRequest): Promise<ApiResponse<Partner>> {
  const response = await apiClient.patch<ApiResponse<Partner>>(`${BASE_URL}/${id}`, payload);
  return response.data;
}

export async function setPartnerActiveApi(id: string, payload: SetPartnerActiveRequest): Promise<ApiResponse<Partner>> {
  const response = await apiClient.patch<ApiResponse<Partner>>(`${BASE_URL}/${id}/active`, payload);
  return response.data;
}

export async function setPartnerPriorityApi(id: string, payload: SetPartnerPriorityRequest): Promise<ApiResponse<Partner>> {
  const response = await apiClient.patch<ApiResponse<Partner>>(`${BASE_URL}/${id}/priority`, payload);
  return response.data;
}

export async function deletePartnerApi(id: string): Promise<void> {
  await apiClient.delete(`${BASE_URL}/${id}`);
}
