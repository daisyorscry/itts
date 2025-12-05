import {
  RoadmapItem,
  PageResult,
  CreateRoadmapItemRequest,
  UpdateRoadmapItemRequest,
  ListRoadmapItemsParams,
} from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

function getAuthHeaders(token?: string | null): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

function parseApi(response: Response): Promise<any> {
  return response.json().then((json) => {
    if (!response.ok) {
      const errorData = json?.error || {};
      throw new Error(errorData.message || 'Request failed');
    }
    // Backend wraps response in { data: ... }
    return json.data !== undefined ? json.data : json;
  });
}

export async function listRoadmapItems(
  params: ListRoadmapItemsParams = {},
  accessToken?: string | null
): Promise<PageResult<RoadmapItem>> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', params.page.toString());
  if (params.page_size) query.set('page_size', params.page_size.toString());
  if (params.roadmap_id) query.set('roadmap_id', params.roadmap_id);
  if (params.search) query.set('search', params.search);

  const response = await fetch(`${API_BASE}/api/v1/admin/roadmap-items?${query}`, {
    headers: getAuthHeaders(accessToken),
    credentials: 'include',
  });
  return parseApi(response);
}

export async function getRoadmapItem(id: string, accessToken?: string | null): Promise<RoadmapItem> {
  const response = await fetch(`${API_BASE}/api/v1/admin/roadmap-items/${id}`, {
    headers: getAuthHeaders(accessToken),
    credentials: 'include',
  });
  return parseApi(response);
}

export async function createRoadmapItem(data: CreateRoadmapItemRequest, accessToken?: string | null): Promise<RoadmapItem> {
  const response = await fetch(`${API_BASE}/api/v1/admin/roadmap-items`, {
    method: 'POST',
    headers: getAuthHeaders(accessToken),
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return parseApi(response);
}

export async function createRoadmapItemUnderRoadmap(
  roadmapId: string,
  data: Omit<CreateRoadmapItemRequest, 'roadmap_id'>,
  accessToken?: string | null
): Promise<RoadmapItem> {
  const response = await fetch(`${API_BASE}/api/v1/admin/roadmaps/${roadmapId}/items`, {
    method: 'POST',
    headers: getAuthHeaders(accessToken),
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return parseApi(response);
}

export async function updateRoadmapItem(
  id: string,
  data: UpdateRoadmapItemRequest,
  accessToken?: string | null
): Promise<RoadmapItem> {
  const response = await fetch(`${API_BASE}/api/v1/admin/roadmap-items/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(accessToken),
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return parseApi(response);
}

export async function deleteRoadmapItem(id: string, accessToken?: string | null): Promise<void> {
  const response = await fetch(`${API_BASE}/api/v1/admin/roadmap-items/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(accessToken),
    credentials: 'include',
  });
  if (!response.ok) {
    const data = await response.json();
    const errorData = data?.error || {};
    throw new Error(errorData.message || 'Failed to delete roadmap item');
  }
}
