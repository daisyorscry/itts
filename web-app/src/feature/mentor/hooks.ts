import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../utility/response';
import {
  createMentorApi,
  deleteMentorApi,
  getMentorApi,
  listMentorsApi,
  setMentorActiveApi,
  setMentorPriorityApi,
  updateMentorApi,
} from './api';
import type { CreateMentorRequest, ListMentorsParams, UpdateMentorRequest } from './types';

export const mentorKeys = {
  all: ['mentors'] as const,
  lists: () => [...mentorKeys.all, 'list'] as const,
  list: (params?: ListMentorsParams) => [...mentorKeys.lists(), params] as const,
  details: () => [...mentorKeys.all, 'detail'] as const,
  detail: (id: string) => [...mentorKeys.details(), id] as const,
};

export function useListMentors(params?: ListMentorsParams) {
  return useQuery({
    queryKey: mentorKeys.list(params),
    queryFn: async () => {
      const response = await listMentorsApi(params);
      return response.data;
    },
    staleTime: 30 * 1000,
  });
}

export function useMentor(id: string, enabled = true) {
  return useQuery({
    queryKey: mentorKeys.detail(id),
    queryFn: async () => {
      const response = await getMentorApi(id);
      return response.data;
    },
    enabled: enabled && !!id,
    staleTime: 30 * 1000,
  });
}

export function useCreateMentor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateMentorRequest) => createMentorApi(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: mentorKeys.lists() });
      toast.success(`Mentor "${response.data.full_name}" created`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateMentor(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateMentorRequest) => updateMentorApi(id, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: mentorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: mentorKeys.detail(id) });
      toast.success(`Mentor "${response.data.full_name}" updated`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useSetMentorActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => setMentorActiveApi(id, active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mentorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: mentorKeys.details() });
      toast.success('Mentor status updated');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useSetMentorPriority() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, priority }: { id: string; priority: number }) => setMentorPriorityApi(id, priority),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mentorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: mentorKeys.details() });
      toast.success('Mentor priority updated');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteMentor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteMentorApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mentorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: mentorKeys.details() });
      toast.success('Mentor deleted');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
