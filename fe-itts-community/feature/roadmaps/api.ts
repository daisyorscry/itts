import {
  Roadmap,
  PageResult,
  CreateRoadmapRequest,
  UpdateRoadmapRequest,
  ListRoadmapsParams,
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

export async function listRoadmaps(
  params: ListRoadmapsParams = {},
  accessToken?: string | null
): Promise<PageResult<Roadmap>> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', params.page.toString());
  if (params.page_size) query.set('page_size', params.page_size.toString());
  if (params.program) query.set('program', params.program);
  if (params.month_number) query.set('month_number', params.month_number.toString());
  if (params.is_active !== undefined) query.set('is_active', params.is_active.toString());
  if (params.search) query.set('search', params.search);

  const response = await fetch(`${API_BASE}/api/v1/admin/roadmaps?${query}`, {
    headers: getAuthHeaders(accessToken),
    credentials: 'include',
  });
  return parseApi(response);
}

export async function getRoadmap(id: string, accessToken?: string | null): Promise<Roadmap> {
  const response = await fetch(`${API_BASE}/api/v1/admin/roadmaps/${id}`, {
    headers: getAuthHeaders(accessToken),
    credentials: 'include',
  });
  return parseApi(response);
}

export async function createRoadmap(data: CreateRoadmapRequest, accessToken?: string | null): Promise<Roadmap> {
  const response = await fetch(`${API_BASE}/api/v1/admin/roadmaps`, {
    method: 'POST',
    headers: getAuthHeaders(accessToken),
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return parseApi(response);
}

export async function updateRoadmap(id: string, data: UpdateRoadmapRequest, accessToken?: string | null): Promise<Roadmap> {
  const response = await fetch(`${API_BASE}/api/v1/admin/roadmaps/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(accessToken),
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return parseApi(response);
}

export async function deleteRoadmap(id: string, accessToken?: string | null): Promise<void> {
  const response = await fetch(`${API_BASE}/api/v1/admin/roadmaps/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(accessToken),
    credentials: 'include',
  });
  if (!response.ok) {
    const data = await response.json();
    const errorData = data?.error || {};
    throw new Error(errorData.message || 'Failed to delete roadmap');
  }
}
