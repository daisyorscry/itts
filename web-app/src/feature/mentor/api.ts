import { apiClient } from '../../utility/api';
import type { ApiResponse } from '../../utility/response';
import type {
  CreateMentorRequest,
  ListMentorsParams,
  Mentor,
  MentorListResponse,
  UpdateMentorRequest,
} from './types';

const BASE_URL = '/admin/mentors';

export async function listMentorsApi(params?: ListMentorsParams): Promise<ApiResponse<MentorListResponse>> {
  const response = await apiClient.get<ApiResponse<MentorListResponse>>(BASE_URL, { params });
  return response.data;
}

export async function getMentorApi(id: string): Promise<ApiResponse<Mentor>> {
  const response = await apiClient.get<ApiResponse<Mentor>>(`${BASE_URL}/${id}`);
  return response.data;
}

export async function createMentorApi(payload: CreateMentorRequest): Promise<ApiResponse<Mentor>> {
  const response = await apiClient.post<ApiResponse<Mentor>>(BASE_URL, payload);
  return response.data;
}

export async function updateMentorApi(id: string, payload: UpdateMentorRequest): Promise<ApiResponse<Mentor>> {
  const response = await apiClient.patch<ApiResponse<Mentor>>(`${BASE_URL}/${id}`, payload);
  return response.data;
}

export async function setMentorActiveApi(id: string, active: boolean): Promise<ApiResponse<Mentor>> {
  const response = await apiClient.patch<ApiResponse<Mentor>>(`${BASE_URL}/${id}/active`, { active });
  return response.data;
}

export async function setMentorPriorityApi(id: string, priority: number): Promise<ApiResponse<Mentor>> {
  const response = await apiClient.patch<ApiResponse<Mentor>>(`${BASE_URL}/${id}/priority`, { priority });
  return response.data;
}

export async function deleteMentorApi(id: string): Promise<void> {
  await apiClient.delete(`${BASE_URL}/${id}`);
}
