import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../utility/response';
import {
  createRoadmapApi,
  createRoadmapItemApi,
  deleteRoadmapApi,
  deleteRoadmapItemApi,
  getRoadmapItemApi,
  getRoadmapApi,
  listRoadmapItemsApi,
  listRoadmapsApi,
  updateRoadmapApi,
  updateRoadmapItemApi,
} from './api';
import type {
  CreateRoadmapItemRequest,
  CreateRoadmapRequest,
  ListRoadmapItemsParams,
  ListRoadmapsParams,
  UpdateRoadmapItemRequest,
  UpdateRoadmapRequest,
} from './types';

export const roadmapKeys = {
  all: ['roadmaps'] as const,
  lists: () => [...roadmapKeys.all, 'list'] as const,
  list: (params?: ListRoadmapsParams) => [...roadmapKeys.lists(), params] as const,
  details: () => [...roadmapKeys.all, 'detail'] as const,
  detail: (id: string) => [...roadmapKeys.details(), id] as const,
  items: ['roadmap-items'] as const,
  itemLists: () => [...roadmapKeys.items, 'list'] as const,
  itemList: (params?: ListRoadmapItemsParams) => [...roadmapKeys.itemLists(), params] as const,
  itemDetails: () => [...roadmapKeys.items, 'detail'] as const,
  itemDetail: (id: string) => [...roadmapKeys.itemDetails(), id] as const,
};

export function useListRoadmaps(params?: ListRoadmapsParams) {
  return useQuery({
    queryKey: roadmapKeys.list(params),
    queryFn: async () => {
      const response = await listRoadmapsApi(params);
      return response.data;
    },
    staleTime: 30 * 1000,
  });
}

export function useRoadmap(id: string, enabled = true) {
  return useQuery({
    queryKey: roadmapKeys.detail(id),
    queryFn: async () => {
      const response = await getRoadmapApi(id);
      return response.data;
    },
    enabled: enabled && !!id,
    staleTime: 30 * 1000,
  });
}

export function useListRoadmapItems(params?: ListRoadmapItemsParams) {
  return useQuery({
    queryKey: roadmapKeys.itemList(params),
    queryFn: async () => {
      const response = await listRoadmapItemsApi(params);
      return response.data;
    },
    staleTime: 30 * 1000,
  });
}

export function useRoadmapItem(id: string, enabled = true) {
  return useQuery({
    queryKey: roadmapKeys.itemDetail(id),
    queryFn: async () => {
      const response = await getRoadmapItemApi(id);
      return response.data;
    },
    enabled: enabled && !!id,
    staleTime: 30 * 1000,
  });
}

export function useCreateRoadmap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRoadmapRequest) => createRoadmapApi(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: roadmapKeys.lists() });
      toast.success(`Roadmap "${response.data.title}" created`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateRoadmap(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateRoadmapRequest) => updateRoadmapApi(id, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: roadmapKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roadmapKeys.detail(id) });
      toast.success(`Roadmap "${response.data.title}" updated`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteRoadmap() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteRoadmapApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roadmapKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roadmapKeys.itemLists() });
      queryClient.invalidateQueries({ queryKey: roadmapKeys.details() });
      toast.success('Roadmap deleted');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useCreateRoadmapItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRoadmapItemRequest) => createRoadmapItemApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roadmapKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roadmapKeys.itemLists() });
      queryClient.invalidateQueries({ queryKey: roadmapKeys.details() });
      toast.success('Roadmap item created');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateRoadmapItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRoadmapItemRequest }) => updateRoadmapItemApi(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roadmapKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roadmapKeys.itemLists() });
      queryClient.invalidateQueries({ queryKey: roadmapKeys.itemDetails() });
      queryClient.invalidateQueries({ queryKey: roadmapKeys.details() });
      toast.success('Roadmap item updated');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteRoadmapItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteRoadmapItemApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roadmapKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roadmapKeys.itemLists() });
      queryClient.invalidateQueries({ queryKey: roadmapKeys.itemDetails() });
      queryClient.invalidateQueries({ queryKey: roadmapKeys.details() });
      toast.success('Roadmap item deleted');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
