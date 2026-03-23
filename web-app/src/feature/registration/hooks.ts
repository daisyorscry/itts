import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../utility/response';
import {
  approveRegistrationApi,
  deleteRegistrationApi,
  getRegistrationApi,
  listRegistrationsApi,
  rejectRegistrationApi,
} from './api';
import type { ListRegistrationsParams, RejectRegistrationRequest } from './types';

export const registrationKeys = {
  all: ['registrations'] as const,
  lists: () => [...registrationKeys.all, 'list'] as const,
  list: (params?: ListRegistrationsParams) => [...registrationKeys.lists(), params] as const,
  details: () => [...registrationKeys.all, 'detail'] as const,
  detail: (id: string) => [...registrationKeys.details(), id] as const,
};

export function useListRegistrations(params?: ListRegistrationsParams) {
  return useQuery({
    queryKey: registrationKeys.list(params),
    queryFn: async () => {
      const response = await listRegistrationsApi(params);
      return response.data;
    },
    staleTime: 30 * 1000,
  });
}

export function useRegistration(id: string, enabled = true) {
  return useQuery({
    queryKey: registrationKeys.detail(id),
    queryFn: async () => {
      const response = await getRegistrationApi(id);
      return response.data;
    },
    enabled: enabled && !!id,
    staleTime: 30 * 1000,
  });
}

export function useApproveRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => approveRegistrationApi(id),
    onSuccess: (response, id) => {
      queryClient.invalidateQueries({ queryKey: registrationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: registrationKeys.detail(id) });
      toast.success(`Registration for ${response.data.full_name} approved`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useRejectRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: RejectRegistrationRequest }) => rejectRegistrationApi(id, payload),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: registrationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: registrationKeys.detail(variables.id) });
      toast.success(`Registration for ${response.data.full_name} rejected`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteRegistration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteRegistrationApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: registrationKeys.lists() });
      toast.success('Registration deleted');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
