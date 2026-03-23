import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../utility/response';
import {
  createPartnerApi,
  deletePartnerApi,
  getPartnerApi,
  listPartnersApi,
  setPartnerActiveApi,
  setPartnerPriorityApi,
  updatePartnerApi,
} from './api';
import type {
  CreatePartnerRequest,
  ListPartnersParams,
  SetPartnerActiveRequest,
  SetPartnerPriorityRequest,
  UpdatePartnerRequest,
} from './types';

export const partnerKeys = {
  all: ['partners'] as const,
  lists: () => [...partnerKeys.all, 'list'] as const,
  list: (params?: ListPartnersParams) => [...partnerKeys.lists(), params] as const,
  details: () => [...partnerKeys.all, 'detail'] as const,
  detail: (id: string) => [...partnerKeys.details(), id] as const,
};

export function useListPartners(params?: ListPartnersParams) {
  return useQuery({
    queryKey: partnerKeys.list(params),
    queryFn: async () => {
      const response = await listPartnersApi(params);
      return response.data;
    },
    staleTime: 30 * 1000,
  });
}

export function usePartner(id: string, enabled = true) {
  return useQuery({
    queryKey: partnerKeys.detail(id),
    queryFn: async () => {
      const response = await getPartnerApi(id);
      return response.data;
    },
    enabled: enabled && !!id,
    staleTime: 30 * 1000,
  });
}

export function useCreatePartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePartnerRequest) => createPartnerApi(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.lists() });
      toast.success(`Partner "${response.data.name}" created`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdatePartner(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdatePartnerRequest) => updatePartnerApi(id, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: partnerKeys.detail(id) });
      toast.success(`Partner "${response.data.name}" updated`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useSetPartnerActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SetPartnerActiveRequest }) => setPartnerActiveApi(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: partnerKeys.details() });
      toast.success('Partner status updated');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useSetPartnerPriority() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SetPartnerPriorityRequest }) => setPartnerPriorityApi(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: partnerKeys.details() });
      toast.success('Partner priority updated');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeletePartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePartnerApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: partnerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: partnerKeys.details() });
      toast.success('Partner deleted');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
