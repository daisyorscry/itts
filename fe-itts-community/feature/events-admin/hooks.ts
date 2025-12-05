import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/feature/auth';
import {
  listEvents,
  getEvent,
  createEvent,
  updateEvent,
  setEventStatus,
  deleteEvent,
} from './api';
import {
  ListEventsParams,
  CreateEventRequest,
  UpdateEventRequest,
  EventStatus,
} from './types';

export function useListEvents(params: ListEventsParams = {}) {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: ['events-admin', params],
    queryFn: () => listEvents(params, accessToken),
    enabled: !!accessToken,
  });
}

export function useGetEvent(id: string) {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: ['events-admin', id],
    queryFn: () => getEvent(id, accessToken),
    enabled: !!id && !!accessToken,
  });
}

export function useCreateEvent() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEventRequest) => {
      if (!accessToken) throw new Error('Not authenticated');
      return createEvent(data, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events-admin'] });
    },
  });
}

export function useUpdateEvent() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEventRequest }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return updateEvent(id, data, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events-admin'] });
    },
  });
}

export function useSetEventStatus() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: EventStatus }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return setEventStatus(id, status, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events-admin'] });
    },
  });
}

export function useDeleteEvent() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      if (!accessToken) throw new Error('Not authenticated');
      return deleteEvent(id, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events-admin'] });
    },
  });
}
