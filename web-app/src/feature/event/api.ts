import { apiClient } from '../../utility/api';
import type { ApiResponse } from '../../utility/response';
import type {
  CreateEventRequest,
  CreateSpeakerRequest,
  Event,
  EventListResponse,
  EventRegistrationListResponse,
  ListEventRegistrationsParams,
  ListEventsParams,
  ListSpeakersParams,
  SetEventStatusRequest,
  Speaker,
  SpeakerListResponse,
  UpdateEventRequest,
  UpdateSpeakerRequest,
} from './types';

const EVENT_BASE = '/admin/events';
const SPEAKER_BASE = '/admin/event-speakers';
const REGISTRATION_BASE = '/admin/event-registrations';

export async function listEventsApi(params?: ListEventsParams): Promise<ApiResponse<EventListResponse>> {
  const response = await apiClient.get<ApiResponse<EventListResponse>>(EVENT_BASE, { params });
  return response.data;
}

export async function getEventApi(id: string): Promise<ApiResponse<Event>> {
  const response = await apiClient.get<ApiResponse<Event>>(`${EVENT_BASE}/${id}`);
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

export async function deleteEventRegistrationApi(id: string): Promise<void> {
  await apiClient.delete(`${REGISTRATION_BASE}/${id}`);
}
