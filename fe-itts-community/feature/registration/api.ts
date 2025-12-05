/**
 * Registration API Service
 */

import type {
  Registration,
  PageResult,
  ListRegistrationsParams,
  RejectRegistrationRequest,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

function getAuthHeaders(token?: string | null): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function parseApi<T>(res: Response): Promise<T> {
  if (res.ok) {
    try {
      const json = await res.json();
      return json.data !== undefined ? json.data : json;
    } catch {
      return {} as T;
    }
  }

  // Handle errors - standardized backend format
  let msg = "Failed to perform action.";
  try {
    const json = await res.json();
    // New standardized format: { error: { code, message }, meta }
    if (json.error && json.error.message) {
      msg = json.error.message;
    } else if (json.message) {
      msg = json.message;
    } else if (json.error && typeof json.error === 'string') {
      msg = json.error;
    }
  } catch {
    const text = await res.text();
    msg = text || msg;
  }
  throw new Error(msg);
}

function buildQueryString(
  params: Record<string, string | number | boolean | undefined>
): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

/**
 * List registrations with pagination
 * GET /api/v1/admin/registrations
 */
export async function listRegistrations(
  params: ListRegistrationsParams,
  accessToken: string
): Promise<PageResult<Registration>> {
  const query = buildQueryString(params);
  const res = await fetch(`${API_BASE}/api/v1/admin/registrations${query}`, {
    method: "GET",
    headers: getAuthHeaders(accessToken),
    credentials: "include",
  });
  return parseApi<PageResult<Registration>>(res);
}

/**
 * Get registration by ID
 * GET /api/v1/admin/registrations/:id
 */
export async function getRegistration(
  id: string,
  accessToken: string
): Promise<Registration> {
  const res = await fetch(`${API_BASE}/api/v1/admin/registrations/${id}`, {
    method: "GET",
    headers: getAuthHeaders(accessToken),
    credentials: "include",
  });
  return parseApi<Registration>(res);
}

/**
 * Approve registration
 * PATCH /api/v1/admin/registrations/:id/approve
 */
export async function approveRegistration(
  id: string,
  accessToken: string
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/api/v1/admin/registrations/${id}/approve`,
    {
      method: "PATCH",
      headers: getAuthHeaders(accessToken),
      credentials: "include",
    }
  );
  await parseApi(res);
}

/**
 * Reject registration
 * PATCH /api/v1/admin/registrations/:id/reject
 */
export async function rejectRegistration(
  id: string,
  reason: string,
  accessToken: string
): Promise<void> {
  const res = await fetch(
    `${API_BASE}/api/v1/admin/registrations/${id}/reject`,
    {
      method: "PATCH",
      headers: getAuthHeaders(accessToken),
      credentials: "include",
      body: JSON.stringify({ reason }),
    }
  );
  await parseApi(res);
}

/**
 * Delete registration
 * DELETE /api/v1/admin/registrations/:id
 */
export async function deleteRegistration(
  id: string,
  accessToken: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/api/v1/admin/registrations/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(accessToken),
    credentials: "include",
  });
  await parseApi(res);
}
