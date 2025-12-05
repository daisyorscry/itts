import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/feature/auth';
import {
  listEventRegistrations,
  deleteEventRegistration,
} from './api';
import { ListEventRegistrationsParams } from './types';

export function useListEventRegistrations(params: ListEventRegistrationsParams = {}) {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: ['event-registrations-admin', params],
    queryFn: () => listEventRegistrations(params, accessToken),
    enabled: !!accessToken,
  });
}

export function useDeleteEventRegistration() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      if (!accessToken) throw new Error('Not authenticated');
      return deleteEventRegistration(id, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['event-registrations-admin'] });
      queryClient.invalidateQueries({ queryKey: ['events-admin'] });
    },
  });
}
