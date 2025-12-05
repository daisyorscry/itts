import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/feature/auth';
import {
  listRoadmapItems,
  getRoadmapItem,
  createRoadmapItem,
  createRoadmapItemUnderRoadmap,
  updateRoadmapItem,
  deleteRoadmapItem,
} from './api';
import {
  ListRoadmapItemsParams,
  CreateRoadmapItemRequest,
  UpdateRoadmapItemRequest,
} from './types';

export function useListRoadmapItems(params: ListRoadmapItemsParams = {}) {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: ['roadmap-items', params],
    queryFn: () => listRoadmapItems(params, accessToken),
    enabled: !!accessToken,
  });
}

export function useGetRoadmapItem(id: string) {
  const { accessToken } = useAuth();
  return useQuery({
    queryKey: ['roadmap-items', id],
    queryFn: () => getRoadmapItem(id, accessToken),
    enabled: !!id && !!accessToken,
  });
}

export function useCreateRoadmapItem() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateRoadmapItemRequest) => {
      if (!accessToken) throw new Error('Not authenticated');
      return createRoadmapItem(data, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap-items'] });
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
    },
  });
}

export function useCreateRoadmapItemUnderRoadmap() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      roadmapId,
      data,
    }: {
      roadmapId: string;
      data: Omit<CreateRoadmapItemRequest, 'roadmap_id'>;
    }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return createRoadmapItemUnderRoadmap(roadmapId, data, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap-items'] });
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
    },
  });
}

export function useUpdateRoadmapItem() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoadmapItemRequest }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return updateRoadmapItem(id, data, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap-items'] });
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
    },
  });
}

export function useDeleteRoadmapItem() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => {
      if (!accessToken) throw new Error('Not authenticated');
      return deleteRoadmapItem(id, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap-items'] });
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
    },
  });
}
