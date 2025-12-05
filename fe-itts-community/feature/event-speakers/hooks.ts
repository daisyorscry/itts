import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/feature/auth';
import {
  listSpeakers,
  createSpeakerUnderEvent,
  updateSpeaker,
  deleteSpeaker,
} from './api';
import {
  ListSpeakersParams,
  CreateSpeakerRequest,
  UpdateSpeakerRequest,
} from './types';

export function useListSpeakers(params: ListSpeakersParams = {}) {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: ['event-speakers', params],
    queryFn: () => listSpeakers(params, accessToken),
    enabled: !!accessToken,
  });
}

export function useCreateSpeakerUnderEvent() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ eventId, data }: { eventId: string; data: CreateSpeakerRequest }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return createSpeakerUnderEvent(eventId, data, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-speakers'] });
      queryClient.invalidateQueries({ queryKey: ['events-admin'] });
    },
  });
}

export function useUpdateSpeaker() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSpeakerRequest }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return updateSpeaker(id, data, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-speakers'] });
      queryClient.invalidateQueries({ queryKey: ['events-admin'] });
    },
  });
}

export function useDeleteSpeaker() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      if (!accessToken) throw new Error('Not authenticated');
      return deleteSpeaker(id, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-speakers'] });
      queryClient.invalidateQueries({ queryKey: ['events-admin'] });
    },
  });
}
