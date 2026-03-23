import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../utility/response';
import {
  createEventRegistrationPaymentApi,
  getPublicEventBySlugApi,
  listPublicEventsApi,
  registerToPublicEventApi,
  verifyEventRegistrationApi,
  createEventApi,
  createSpeakerApi,
  deleteEventApi,
  deleteEventRegistrationApi,
  deleteSpeakerApi,
  getEventApi,
  listEventRegistrationsApi,
  listEventsApi,
  listSpeakersApi,
  setEventStatusApi,
  uploadEventImageApi,
  updateEventApi,
  updateSpeakerApi,
} from './api';
import type {
  CreateEventRegistrationPaymentRequest,
  CreatePublicEventRegistrationRequest,
  CreateEventRequest,
  CreateSpeakerRequest,
  ListEventRegistrationsParams,
  ListEventsParams,
  ListSpeakersParams,
  SetEventStatusRequest,
  UpdateEventRequest,
  UpdateSpeakerRequest,
  VerifyEventRegistrationRequest,
} from './types';

export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  list: (params?: ListEventsParams) => [...eventKeys.lists(), params] as const,
  details: () => [...eventKeys.all, 'detail'] as const,
  detail: (id: string) => [...eventKeys.details(), id] as const,
  publicDetails: () => [...eventKeys.all, 'public-detail'] as const,
  publicDetail: (slug: string) => [...eventKeys.publicDetails(), slug] as const,
  speakers: ['event-speakers'] as const,
  speakerLists: () => [...eventKeys.speakers, 'list'] as const,
  speakerList: (params?: ListSpeakersParams) => [...eventKeys.speakerLists(), params] as const,
  registrations: ['event-registrations'] as const,
  registrationLists: () => [...eventKeys.registrations, 'list'] as const,
  registrationList: (params?: ListEventRegistrationsParams) => [...eventKeys.registrationLists(), params] as const,
  verification: () => [...eventKeys.registrations, 'verification'] as const,
  verificationToken: (token: string) => [...eventKeys.verification(), token] as const,
};

export function useListEvents(params?: ListEventsParams) {
  return useQuery({
    queryKey: eventKeys.list(params),
    queryFn: async () => {
      const response = await listEventsApi(params);
      return response.data;
    },
    staleTime: 30 * 1000,
  });
}

export function useListPublicEvents(params?: ListEventsParams) {
  return useQuery({
    queryKey: [...eventKeys.lists(), 'public', params],
    queryFn: async () => {
      const response = await listPublicEventsApi(params);
      return response.data;
    },
    staleTime: 30 * 1000,
  });
}

export function useEvent(id: string, enabled = true) {
  return useQuery({
    queryKey: eventKeys.detail(id),
    queryFn: async () => {
      const response = await getEventApi(id);
      return response.data;
    },
    enabled: enabled && !!id,
    staleTime: 30 * 1000,
  });
}

export function usePublicEvent(slug: string, enabled = true) {
  return useQuery({
    queryKey: eventKeys.publicDetail(slug),
    queryFn: async () => {
      const response = await getPublicEventBySlugApi(slug);
      return response.data;
    },
    enabled: enabled && !!slug,
    staleTime: 30 * 1000,
  });
}

export function useListSpeakers(params?: ListSpeakersParams) {
  return useQuery({
    queryKey: eventKeys.speakerList(params),
    queryFn: async () => {
      const response = await listSpeakersApi(params);
      return response.data;
    },
    staleTime: 30 * 1000,
  });
}

export function useListEventRegistrations(params?: ListEventRegistrationsParams) {
  return useQuery({
    queryKey: eventKeys.registrationList(params),
    queryFn: async () => {
      const response = await listEventRegistrationsApi(params);
      return response.data;
    },
    staleTime: 30 * 1000,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEventRequest) => createEventApi(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      toast.success(`Event "${response.data.title}" created`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUploadEventImage() {
  return useMutation({
    mutationFn: (file: File) => uploadEventImageApi(file),
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateEvent(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateEventRequest) => updateEventApi(id, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(id) });
      toast.success(`Event "${response.data.title}" updated`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useSetEventStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SetEventStatusRequest }) => setEventStatusApi(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      toast.success('Event status updated');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteEventApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.speakerLists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.registrationLists() });
      toast.success('Event deleted');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useCreateSpeaker() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSpeakerRequest) => createSpeakerApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.speakerLists() });
      toast.success('Speaker created');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateSpeaker() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSpeakerRequest }) => updateSpeakerApi(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.speakerLists() });
      toast.success('Speaker updated');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteSpeaker() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSpeakerApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.speakerLists() });
      toast.success('Speaker deleted');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteEventRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteEventRegistrationApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.registrationLists() });
      toast.success('Event registration removed');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useRegisterToPublicEvent(eventId: string) {
  return useMutation({
    mutationFn: (payload: CreatePublicEventRegistrationRequest) => registerToPublicEventApi(eventId, payload),
    onSuccess: () => {
      toast.success('Registration submitted. Check your email to verify.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useVerifyEventRegistration() {
  return useMutation({
    mutationFn: (payload: VerifyEventRegistrationRequest) => verifyEventRegistrationApi(payload),
    onSuccess: (response) => {
      if (response.data.status === 'approved') {
        toast.success('Email verified. Your seat is confirmed.');
        return;
      }
      if (response.data.status === 'waitlisted') {
        toast.success('Email verified. You are on the waitlist.');
        return;
      }
      if (response.data.status === 'pending_payment') {
        toast.success('Email verified. Continue to payment.');
        return;
      }
      toast.success('Registration verified.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useCreateEventRegistrationPayment(id: string) {
  return useMutation({
    mutationFn: (payload: CreateEventRegistrationPaymentRequest) => createEventRegistrationPaymentApi(id, payload),
    onSuccess: (response) => {
      if (response.data.payment_url) {
        toast.success('Payment link created.');
        return;
      }
      toast.success('Payment initialized.');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
