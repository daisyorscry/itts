import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/feature/auth';
import {
  listRoadmaps,
  getRoadmap,
  createRoadmap,
  updateRoadmap,
  deleteRoadmap,
} from './api';
import {
  ListRoadmapsParams,
  CreateRoadmapRequest,
  UpdateRoadmapRequest,
} from './types';

export function useListRoadmaps(params: ListRoadmapsParams = {}) {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: ['roadmaps', params],
    queryFn: () => listRoadmaps(params, accessToken),
    enabled: !!accessToken,
  });
}

export function useGetRoadmap(id: string) {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: ['roadmaps', id],
    queryFn: () => getRoadmap(id, accessToken),
    enabled: !!id && !!accessToken,
  });
}

export function useCreateRoadmap() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRoadmapRequest) => {
      if (!accessToken) throw new Error('Not authenticated');
      return createRoadmap(data, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
    },
  });
}

export function useUpdateRoadmap() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoadmapRequest }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return updateRoadmap(id, data, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
    },
  });
}

export function useDeleteRoadmap() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      if (!accessToken) throw new Error('Not authenticated');
      return deleteRoadmap(id, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
    },
  });
}
