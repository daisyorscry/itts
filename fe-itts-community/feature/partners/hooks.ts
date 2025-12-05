import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/feature/auth';
import {
  listPartners,
  getPartner,
  createPartner,
  updatePartner,
  setPartnerActive,
  setPartnerPriority,
  deletePartner,
} from './api';
import {
  ListPartnersParams,
  CreatePartnerRequest,
  UpdatePartnerRequest,
} from './types';

export function useListPartners(params: ListPartnersParams = {}) {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: ['partners', params],
    queryFn: () => listPartners(params, accessToken),
    enabled: !!accessToken,
  });
}

export function useGetPartner(id: string) {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: ['partners', id],
    queryFn: () => getPartner(id, accessToken),
    enabled: !!id && !!accessToken,
  });
}

export function useCreatePartner() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePartnerRequest) => {
      if (!accessToken) throw new Error('Not authenticated');
      return createPartner(data, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
    },
  });
}

export function useUpdatePartner() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePartnerRequest }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return updatePartner(id, data, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
    },
  });
}

export function useSetPartnerActive() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return setPartnerActive(id, active, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
    },
  });
}

export function useSetPartnerPriority() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, priority }: { id: string; priority: number }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return setPartnerPriority(id, priority, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
    },
  });
}

export function useDeletePartner() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      if (!accessToken) throw new Error('Not authenticated');
      return deletePartner(id, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
    },
  });
}
