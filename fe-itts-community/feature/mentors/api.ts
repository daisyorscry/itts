import {
  Mentor,
  PageResult,
  CreateMentorRequest,
  UpdateMentorRequest,
  ListMentorsParams,
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
    return json.data !== undefined ? json.data : json;
  });
}

export async function listMentors(
  params: ListMentorsParams = {},
  accessToken?: string
): Promise<PageResult<Mentor>> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', params.page.toString());
  if (params.page_size) query.set('page_size', params.page_size.toString());
  if (params.program) query.set('program', params.program);
  if (params.is_active !== undefined) query.set('is_active', params.is_active.toString());
  if (params.search) query.set('search', params.search);

  const response = await fetch(`${API_BASE}/api/v1/admin/mentors?${query}`, {
    headers: getAuthHeaders(accessToken),
    credentials: 'include',
  });
  return parseApi(response);
}

export async function getMentor(id: string, accessToken?: string): Promise<Mentor> {
  const response = await fetch(`${API_BASE}/api/v1/admin/mentors/${id}`, {
    headers: getAuthHeaders(accessToken),
    credentials: 'include',
  });
  return parseApi(response);
}

export async function createMentor(data: CreateMentorRequest, accessToken?: string): Promise<Mentor> {
  const response = await fetch(`${API_BASE}/api/v1/admin/mentors`, {
    method: 'POST',
    headers: getAuthHeaders(accessToken),
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return parseApi(response);
}

export async function updateMentor(id: string, data: UpdateMentorRequest, accessToken?: string): Promise<Mentor> {
  const response = await fetch(`${API_BASE}/api/v1/admin/mentors/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(accessToken),
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return parseApi(response);
}

export async function setMentorActive(id: string, active: boolean, accessToken?: string): Promise<Mentor> {
  const response = await fetch(`${API_BASE}/api/v1/admin/mentors/${id}/active`, {
    method: 'PATCH',
    headers: getAuthHeaders(accessToken),
    credentials: 'include',
    body: JSON.stringify({ active }),
  });
  return parseApi(response);
}

export async function setMentorPriority(id: string, priority: number, accessToken?: string): Promise<Mentor> {
  const response = await fetch(`${API_BASE}/api/v1/admin/mentors/${id}/priority`, {
    method: 'PATCH',
    headers: getAuthHeaders(accessToken),
    credentials: 'include',
    body: JSON.stringify({ priority }),
  });
  return parseApi(response);
}

export async function deleteMentor(id: string, accessToken?: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/v1/admin/mentors/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(accessToken),
    credentials: 'include',
  });
  if (!response.ok) {
    const data = await response.json();
    const errorData = data?.error || {};
    throw new Error(errorData.message || 'Failed to delete mentor');
  }
}
