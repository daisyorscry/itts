import {
  Speaker,
  PageResult,
  CreateSpeakerRequest,
  UpdateSpeakerRequest,
  ListSpeakersParams,
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

export async function listSpeakers(
  params: ListSpeakersParams = {},
  accessToken?: string
): Promise<PageResult<Speaker>> {
  const query = new URLSearchParams();
  if (params.event_id) query.set('event_id', params.event_id);
  if (params.page) query.set('page', params.page.toString());
  if (params.page_size) query.set('page_size', params.page_size.toString());

  const response = await fetch(`${API_BASE}/api/v1/admin/event-speakers?${query}`, {
    headers: getAuthHeaders(accessToken),
    credentials: 'include',
  });
  return parseApi(response);
}

export async function createSpeakerUnderEvent(
  eventId: string,
  data: CreateSpeakerRequest,
  accessToken?: string
): Promise<Speaker> {
  const response = await fetch(`${API_BASE}/api/v1/admin/events/${eventId}/speakers`, {
    method: 'POST',
    headers: getAuthHeaders(accessToken),
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return parseApi(response);
}

export async function updateSpeaker(
  id: string,
  data: UpdateSpeakerRequest,
  accessToken?: string
): Promise<Speaker> {
  const response = await fetch(`${API_BASE}/api/v1/admin/event-speakers/${id}`, {
    method: 'PATCH',
    headers: getAuthHeaders(accessToken),
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return parseApi(response);
}

export async function deleteSpeaker(id: string, accessToken?: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/v1/admin/event-speakers/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(accessToken),
    credentials: 'include',
  });
  if (!response.ok) {
    const data = await response.json();
    const errorData = data?.error || {};
    throw new Error(errorData.message || 'Failed to delete speaker');
  }
}
