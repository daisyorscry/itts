import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/feature/auth';
import {
  listMentors,
  getMentor,
  createMentor,
  updateMentor,
  setMentorActive,
  setMentorPriority,
  deleteMentor,
} from './api';
import {
  ListMentorsParams,
  CreateMentorRequest,
  UpdateMentorRequest,
} from './types';

export function useListMentors(params: ListMentorsParams = {}) {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: ['mentors', params],
    queryFn: () => listMentors(params, accessToken),
    enabled: !!accessToken,
  });
}

export function useGetMentor(id: string) {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: ['mentors', id],
    queryFn: () => getMentor(id, accessToken),
    enabled: !!id && !!accessToken,
  });
}

export function useCreateMentor() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMentorRequest) => {
      if (!accessToken) throw new Error('Not authenticated');
      return createMentor(data, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentors'] });
    },
  });
}

export function useUpdateMentor() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMentorRequest }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return updateMentor(id, data, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentors'] });
    },
  });
}

export function useSetMentorActive() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return setMentorActive(id, active, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentors'] });
    },
  });
}

export function useSetMentorPriority() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, priority }: { id: string; priority: number }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return setMentorPriority(id, priority, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentors'] });
    },
  });
}

export function useDeleteMentor() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      if (!accessToken) throw new Error('Not authenticated');
      return deleteMentor(id, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mentors'] });
    },
  });
}
