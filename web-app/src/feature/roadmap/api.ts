import { apiClient } from '../../utility/api';
import type { ApiResponse } from '../../utility/response';
import type {
  CreateRoadmapItemRequest,
  CreateRoadmapRequest,
  ListRoadmapItemsParams,
  ListRoadmapsParams,
  Roadmap,
  RoadmapItem,
  RoadmapItemListResponse,
  RoadmapListResponse,
  UpdateRoadmapItemRequest,
  UpdateRoadmapRequest,
} from './types';

const ROADMAP_BASE = '/admin/roadmaps';
const ITEM_BASE = '/admin/roadmap-items';

export async function listRoadmapsApi(params?: ListRoadmapsParams): Promise<ApiResponse<RoadmapListResponse>> {
  const response = await apiClient.get<ApiResponse<RoadmapListResponse>>(ROADMAP_BASE, { params });
  return response.data;
}

export async function getRoadmapApi(id: string): Promise<ApiResponse<Roadmap>> {
  const response = await apiClient.get<ApiResponse<Roadmap>>(`${ROADMAP_BASE}/${id}`);
  return response.data;
}

export async function createRoadmapApi(payload: CreateRoadmapRequest): Promise<ApiResponse<Roadmap>> {
  const response = await apiClient.post<ApiResponse<Roadmap>>(ROADMAP_BASE, payload);
  return response.data;
}

export async function updateRoadmapApi(id: string, payload: UpdateRoadmapRequest): Promise<ApiResponse<Roadmap>> {
  const response = await apiClient.patch<ApiResponse<Roadmap>>(`${ROADMAP_BASE}/${id}`, payload);
  return response.data;
}

export async function deleteRoadmapApi(id: string): Promise<void> {
  await apiClient.delete(`${ROADMAP_BASE}/${id}`);
}

export async function listRoadmapItemsApi(params?: ListRoadmapItemsParams): Promise<ApiResponse<RoadmapItemListResponse>> {
  const response = await apiClient.get<ApiResponse<RoadmapItemListResponse>>(ITEM_BASE, { params });
  return response.data;
}

export async function getRoadmapItemApi(id: string): Promise<ApiResponse<RoadmapItem>> {
  const response = await apiClient.get<ApiResponse<RoadmapItem>>(`${ITEM_BASE}/${id}`);
  return response.data;
}

export async function createRoadmapItemApi(payload: CreateRoadmapItemRequest): Promise<ApiResponse<RoadmapItem>> {
  const response = await apiClient.post<ApiResponse<RoadmapItem>>(ITEM_BASE, payload);
  return response.data;
}

export async function updateRoadmapItemApi(id: string, payload: UpdateRoadmapItemRequest): Promise<ApiResponse<RoadmapItem>> {
  const response = await apiClient.patch<ApiResponse<RoadmapItem>>(`${ITEM_BASE}/${id}`, payload);
  return response.data;
}

export async function deleteRoadmapItemApi(id: string): Promise<void> {
  await apiClient.delete(`${ITEM_BASE}/${id}`);
}
