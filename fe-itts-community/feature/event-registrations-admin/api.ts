import {
  EventRegistration,
  PageResult,
  ListEventRegistrationsParams,
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

export async function listEventRegistrations(
  params: ListEventRegistrationsParams = {},
  accessToken?: string | null
): Promise<PageResult<EventRegistration>> {
  const query = new URLSearchParams();
  if (params.event_id) query.set('event_id', params.event_id);
  if (params.page) query.set('page', params.page.toString());
  if (params.page_size) query.set('page_size', params.page_size.toString());
  if (params.search) query.set('search', params.search);

  const response = await fetch(`${API_BASE}/api/v1/admin/event-registrations?${query}`, {
    headers: getAuthHeaders(accessToken),
    credentials: 'include',
  });
  return parseApi(response);
}

export async function deleteEventRegistration(id: string, accessToken?: string | null): Promise<void> {
  const response = await fetch(`${API_BASE}/api/v1/admin/event-registrations/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(accessToken),
    credentials: 'include',
  });
  if (!response.ok) {
    const data = await response.json();
    const errorData = data?.error || {};
    throw new Error(errorData.message || 'Failed to delete event registration');
  }
}
