// Permission React Query hooks

import { useQuery } from '@tanstack/react-query';
import { listPermissions, getPermission, listResources, listActions } from './api';
import type { ListPermissionsParams } from './types';

/**
 * Hook to list permissions with filters
 */
export function useListPermissions(params?: ListPermissionsParams) {
  return useQuery({
    queryKey: ['permissions', 'list', params],
    queryFn: () => listPermissions(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get permission detail
 */
export function useGetPermission(id: string, enabled = true) {
  return useQuery({
    queryKey: ['permissions', 'detail', id],
    queryFn: () => getPermission(id),
    enabled: !!id && enabled,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to list all resources
 */
export function useListResources() {
  return useQuery({
    queryKey: ['permissions', 'resources'],
    queryFn: listResources,
    staleTime: 10 * 60 * 1000, // 10 minutes - resources rarely change
  });
}

/**
 * Hook to list all actions
 */
export function useListActions() {
  return useQuery({
    queryKey: ['permissions', 'actions'],
    queryFn: listActions,
    staleTime: 10 * 60 * 1000, // 10 minutes - actions rarely change
  });
}
