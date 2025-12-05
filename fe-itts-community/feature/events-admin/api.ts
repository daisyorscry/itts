import {
  Event,
  PageResult,
  CreateEventRequest,
  UpdateEventRequest,
  ListEventsParams,
  EventStatus,
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

export async function listEvents(
  params: ListEventsParams = {},
  accessToken?: string
): Promise<PageResult<Event>> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', params.page.toString());
  if (params.page_size) query.set('page_size', params.page_size.toString());
  if (params.status) query.set('status', params.status);
  if (params.program) query.set('program', params.program);
  if (params.search) query.set('search', params.search);

  const response = await fetch(`${API_BASE}/api/v1/admin/events?${query}`, {
    headers: getAuthHeaders(accessToken),
    credentials: 'include',
  });
  return parseApi(response);
}

export async function getEvent(id: string, accessToken?: string): Promise<Event> {
  const response = await fetch(`${API_BASE}/api/v1/admin/events/${id}`, {
    headers: getAuthHeaders(accessToken),
    credentials: 'include',
  });
  return parseApi(response);
}

export async function createEvent(data: CreateEventRequest, accessToken?: string): Promise<Event> {
  const response = await fetch(`${API_BASE}/api/v1/admin/events`, {
    method: 'POST',
    headers: getAuthHeaders(accessToken),
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return parseApi(response);
}

export async function updateEvent(id: string, data: UpdateEventRequest, accessToken?: string): Promise<Event> {
  const response = await fetch(`${API_BASE}/api/v1/admin/events/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(accessToken),
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return parseApi(response);
}

export async function setEventStatus(id: string, status: EventStatus, accessToken?: string): Promise<Event> {
  const response = await fetch(`${API_BASE}/api/v1/admin/events/${id}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(accessToken),
    credentials: 'include',
    body: JSON.stringify({ status }),
  });
  return parseApi(response);
}

export async function deleteEvent(id: string, accessToken?: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/v1/admin/events/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(accessToken),
    credentials: 'include',
  });
  if (!response.ok) {
    const data = await response.json();
    const errorData = data?.error || {};
    throw new Error(errorData.message || 'Failed to delete event');
  }
}
