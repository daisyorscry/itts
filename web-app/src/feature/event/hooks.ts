import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../utility/response';
import {
  approveEventRegistrationApi,
  createEventRegistrationPaymentApi,
  getPublicEventBySlugApi,
  getPublicEventRegistrationApi,
  getPublicEventRegistrationByTokenApi,
  listPublicEventsApi,
  promoteEventRegistrationApi,
  rejectEventRegistrationApi,
  resendEventRegistrationInvoiceApi,
  resendEventRegistrationVerificationApi,
  registerToPublicEventApi,
  verifyEventRegistrationApi,
  waitlistEventRegistrationApi,
  createEventApi,
  createSpeakerApi,
  deleteEventApi,
  deleteEventRegistrationApi,
  deleteSpeakerApi,
  getEventApi,
  getEventRegistrationApi,
  listEventRegistrationActivitiesApi,
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
  RejectEventRegistrationRequest,
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
  registrationDetails: () => [...eventKeys.registrations, 'detail'] as const,
  registrationDetail: (id: string) => [...eventKeys.registrationDetails(), id] as const,
  publicRegistrationDetails: () => [...eventKeys.registrations, 'public-detail'] as const,
  publicRegistrationDetail: (id: string) => [...eventKeys.publicRegistrationDetails(), id] as const,
  registrationActivities: () => [...eventKeys.registrations, 'activities'] as const,
  registrationActivity: (id: string) => [...eventKeys.registrationActivities(), id] as const,
  verification: () => [...eventKeys.registrations, 'verification'] as const,
  verificationToken: (token: string) => [...eventKeys.verification(), token] as const,
};

export function useListEvents(params?: ListEventsParams, enabled = true) {
  return useQuery({
    queryKey: eventKeys.list(params),
    queryFn: async () => {
      const response = await listEventsApi(params);
      return response.data;
    },
    enabled,
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

export function useListEventRegistrations(params?: ListEventRegistrationsParams, refetchInterval?: number | false) {
  return useQuery({
    queryKey: eventKeys.registrationList(params),
    queryFn: async () => {
      const response = await listEventRegistrationsApi(params);
      return response.data;
    },
    staleTime: 30 * 1000,
    refetchInterval,
  });
}

export function useEventRegistration(id: string, enabled = true, refetchInterval?: number | false) {
  return useQuery({
    queryKey: eventKeys.registrationDetail(id),
    queryFn: async () => {
      const response = await getEventRegistrationApi(id);
      return response.data;
    },
    enabled: enabled && !!id,
    staleTime: 30 * 1000,
    refetchInterval,
  });
}

export function usePublicEventRegistration(id: string, enabled = true, refetchInterval?: number | false) {
  return useQuery({
    queryKey: eventKeys.publicRegistrationDetail(id),
    queryFn: async () => {
      const response = await getPublicEventRegistrationApi(id);
      return response.data;
    },
    enabled: enabled && !!id,
    staleTime: 15 * 1000,
    refetchInterval,
  });
}

export function usePublicEventRegistrationByToken(token: string, enabled = true, refetchInterval?: number | false) {
  return useQuery({
    queryKey: [...eventKeys.publicRegistrationDetails(), 'token', token],
    queryFn: async () => {
      const response = await getPublicEventRegistrationByTokenApi(token);
      return response.data;
    },
    enabled: enabled && !!token,
    staleTime: 15 * 1000,
    refetchInterval,
  });
}

export function useEventRegistrationActivities(id: string, enabled = true, refetchInterval?: number | false) {
  return useQuery({
    queryKey: eventKeys.registrationActivity(id),
    queryFn: async () => {
      const response = await listEventRegistrationActivitiesApi(id);
      return response.data;
    },
    enabled: enabled && !!id,
    staleTime: 30 * 1000,
    refetchInterval,
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
      queryClient.invalidateQueries({ queryKey: eventKeys.registrationDetails() });
      queryClient.invalidateQueries({ queryKey: eventKeys.registrationActivities() });
      toast.success('Event registration removed');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useApproveEventRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => approveEventRegistrationApi(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.registrationLists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.registrationDetails() });
      queryClient.invalidateQueries({ queryKey: eventKeys.registrationActivities() });
      toast.success(
        response.data.promoted_registration
          ? `Approved ${response.data.registration.full_name}. ${response.data.promoted_registration.full_name} was auto-promoted.`
          : `Registration for ${response.data.registration.full_name} approved`,
      );
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useRejectEventRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RejectEventRegistrationRequest }) => rejectEventRegistrationApi(id, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.registrationLists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.registrationDetails() });
      queryClient.invalidateQueries({ queryKey: eventKeys.registrationActivities() });
      toast.success(
        response.data.promoted_registration
          ? `Rejected ${response.data.registration.full_name}. ${response.data.promoted_registration.full_name} was auto-promoted.`
          : `Registration for ${response.data.registration.full_name} rejected`,
      );
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useWaitlistEventRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => waitlistEventRegistrationApi(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.registrationLists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.registrationDetails() });
      queryClient.invalidateQueries({ queryKey: eventKeys.registrationActivities() });
      toast.success(
        response.data.promoted_registration
          ? `${response.data.registration.full_name} moved to waitlist. ${response.data.promoted_registration.full_name} was auto-promoted.`
          : `Registration for ${response.data.registration.full_name} moved to waitlist`,
      );
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function usePromoteEventRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => promoteEventRegistrationApi(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.registrationLists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.registrationDetails() });
      queryClient.invalidateQueries({ queryKey: eventKeys.registrationActivities() });
      toast.success(`Registration for ${response.data.registration.full_name} promoted`);
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateEventRegistrationPaymentRequest) => createEventRegistrationPaymentApi(id, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.publicRegistrationDetail(id) });
      queryClient.invalidateQueries({ queryKey: eventKeys.registrationDetail(id) });
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

export function useResendEventRegistrationVerification(token: string) {
  return useMutation({
    mutationFn: async () => resendEventRegistrationVerificationApi(token),
    onSuccess: () => {
      toast.success('Verification email sent');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useResendEventRegistrationInvoice(token: string) {
  return useMutation({
    mutationFn: async () => resendEventRegistrationInvoiceApi(token),
    onSuccess: () => {
      toast.success('Invoice email sent');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
