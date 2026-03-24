import { apiClient } from '../../utility/api';
import type { ApiResponse } from '../../utility/response';
import type {
  CreateEventRegistrationPaymentRequest,
  CreatePublicEventRegistrationRequest,
  CreateEventRequest,
  CreateSpeakerRequest,
  Event,
  EventRegistration,
  EventRegistrationActionResult,
  EventRegistrationActivity,
  EventListResponse,
  EventRegistrationListResponse,
  ListEventRegistrationsParams,
  ListEventsParams,
  ListSpeakersParams,
  SetEventStatusRequest,
  Speaker,
  SpeakerListResponse,
  RejectEventRegistrationRequest,
  UploadedEventImage,
  UpdateEventRequest,
  UpdateSpeakerRequest,
  VerifyEventRegistrationRequest,
} from './types';

const EVENT_BASE = '/admin/events';
const SPEAKER_BASE = '/admin/event-speakers';
const REGISTRATION_BASE = '/admin/event-registrations';

export async function listEventsApi(params?: ListEventsParams): Promise<ApiResponse<EventListResponse>> {
  const response = await apiClient.get<ApiResponse<EventListResponse>>(EVENT_BASE, { params });
  return response.data;
}

export async function listPublicEventsApi(params?: ListEventsParams): Promise<ApiResponse<EventListResponse>> {
  const response = await apiClient.get<ApiResponse<EventListResponse>>('/events', { params });
  return response.data;
}

export async function getEventApi(id: string): Promise<ApiResponse<Event>> {
  const response = await apiClient.get<ApiResponse<Event>>(`${EVENT_BASE}/${id}`);
  return response.data;
}

export async function getPublicEventBySlugApi(slug: string): Promise<ApiResponse<Event>> {
  const response = await apiClient.get<ApiResponse<Event>>(`/events/slug/${encodeURIComponent(slug)}`);
  return response.data;
}

export async function createEventApi(payload: CreateEventRequest): Promise<ApiResponse<Event>> {
  const response = await apiClient.post<ApiResponse<Event>>(EVENT_BASE, payload);
  return response.data;
}

export async function updateEventApi(id: string, payload: UpdateEventRequest): Promise<ApiResponse<Event>> {
  const response = await apiClient.patch<ApiResponse<Event>>(`${EVENT_BASE}/${id}`, payload);
  return response.data;
}

export async function uploadEventImageApi(file: File): Promise<ApiResponse<UploadedEventImage>> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<ApiResponse<UploadedEventImage>>('/admin/uploads/images', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

export async function setEventStatusApi(id: string, payload: SetEventStatusRequest): Promise<ApiResponse<Event>> {
  const response = await apiClient.patch<ApiResponse<Event>>(`${EVENT_BASE}/${id}/status`, payload);
  return response.data;
}

export async function deleteEventApi(id: string): Promise<void> {
  await apiClient.delete(`${EVENT_BASE}/${id}`);
}

export async function listSpeakersApi(params?: ListSpeakersParams): Promise<ApiResponse<SpeakerListResponse>> {
  const response = await apiClient.get<ApiResponse<SpeakerListResponse>>(SPEAKER_BASE, { params });
  return response.data;
}

export async function createSpeakerApi(payload: CreateSpeakerRequest): Promise<ApiResponse<Speaker>> {
  const response = await apiClient.post<ApiResponse<Speaker>>(`${EVENT_BASE}/${payload.event_id}/speakers`, payload);
  return response.data;
}

export async function updateSpeakerApi(id: string, payload: UpdateSpeakerRequest): Promise<ApiResponse<Speaker>> {
  const response = await apiClient.patch<ApiResponse<Speaker>>(`${SPEAKER_BASE}/${id}`, payload);
  return response.data;
}

export async function deleteSpeakerApi(id: string): Promise<void> {
  await apiClient.delete(`${SPEAKER_BASE}/${id}`);
}

export async function listEventRegistrationsApi(params?: ListEventRegistrationsParams): Promise<ApiResponse<EventRegistrationListResponse>> {
  const response = await apiClient.get<ApiResponse<EventRegistrationListResponse>>(REGISTRATION_BASE, { params });
  return response.data;
}

export async function getEventRegistrationApi(id: string): Promise<ApiResponse<EventRegistration>> {
  const response = await apiClient.get<ApiResponse<EventRegistration>>(`${REGISTRATION_BASE}/${id}`);
  return response.data;
}

export async function getPublicEventRegistrationApi(id: string): Promise<ApiResponse<EventRegistration>> {
  const response = await apiClient.get<ApiResponse<EventRegistration>>(`/events/registrations/${id}`);
  return response.data;
}

export async function getPublicEventRegistrationByTokenApi(token: string): Promise<ApiResponse<EventRegistration>> {
  const response = await apiClient.get<ApiResponse<EventRegistration>>('/events/registrations/access', {
    params: { token },
  });
  return response.data;
}

export async function resendEventRegistrationVerificationApi(token: string): Promise<ApiResponse<{ message: string }>> {
  const response = await apiClient.post<ApiResponse<{ message: string }>>('/events/registrations/resend-verification', undefined, {
    params: { token },
  });
  return response.data;
}

export async function resendEventRegistrationInvoiceApi(token: string): Promise<ApiResponse<{ message: string }>> {
  const response = await apiClient.post<ApiResponse<{ message: string }>>('/events/registrations/resend-invoice', undefined, {
    params: { token },
  });
  return response.data;
}

export async function listEventRegistrationActivitiesApi(id: string): Promise<ApiResponse<EventRegistrationActivity[]>> {
  const response = await apiClient.get<ApiResponse<EventRegistrationActivity[]>>(`${REGISTRATION_BASE}/${id}/activities`);
  return response.data;
}

export async function deleteEventRegistrationApi(id: string): Promise<void> {
  await apiClient.delete(`${REGISTRATION_BASE}/${id}`);
}

export async function approveEventRegistrationApi(id: string): Promise<ApiResponse<EventRegistrationActionResult>> {
  const response = await apiClient.patch<ApiResponse<EventRegistrationActionResult>>(`${REGISTRATION_BASE}/${id}/approve`);
  return response.data;
}

export async function rejectEventRegistrationApi(
  id: string,
  payload: RejectEventRegistrationRequest,
): Promise<ApiResponse<EventRegistrationActionResult>> {
  const response = await apiClient.patch<ApiResponse<EventRegistrationActionResult>>(`${REGISTRATION_BASE}/${id}/reject`, payload);
  return response.data;
}

export async function waitlistEventRegistrationApi(id: string): Promise<ApiResponse<EventRegistrationActionResult>> {
  const response = await apiClient.patch<ApiResponse<EventRegistrationActionResult>>(`${REGISTRATION_BASE}/${id}/waitlist`);
  return response.data;
}

export async function promoteEventRegistrationApi(id: string): Promise<ApiResponse<EventRegistrationActionResult>> {
  const response = await apiClient.patch<ApiResponse<EventRegistrationActionResult>>(`${REGISTRATION_BASE}/${id}/promote`);
  return response.data;
}

export async function registerToPublicEventApi(
  eventId: string,
  payload: CreatePublicEventRegistrationRequest,
): Promise<ApiResponse<EventRegistration>> {
  const response = await apiClient.post<ApiResponse<EventRegistration>>(`/events/${eventId}/register`, payload);
  return response.data;
}

export async function verifyEventRegistrationApi(
  payload: VerifyEventRegistrationRequest,
): Promise<ApiResponse<EventRegistration>> {
  const response = await apiClient.get<ApiResponse<EventRegistration>>('/events/registrations/verify', {
    params: {
      token: payload.token,
    },
  });
  return response.data;
}

export async function createEventRegistrationPaymentApi(
  id: string,
  payload: CreateEventRegistrationPaymentRequest,
): Promise<ApiResponse<EventRegistration>> {
  const response = await apiClient.post<ApiResponse<EventRegistration>>(`/events/registrations/${id}/payment`, payload);
  return response.data;
}
