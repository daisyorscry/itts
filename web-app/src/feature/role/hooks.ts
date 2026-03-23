import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  listRolesApi,
  getRoleApi,
  createRoleApi,
  updateRoleApi,
  deleteRoleApi,
  getRolePermissionsApi,
  assignPermissionsApi,
} from './api';
import {
  CreateRoleRequest,
  UpdateRoleRequest,
  AssignPermissionsRequest,
  ListRolesParams,
} from './types';
import { getErrorMessage } from '../../utility/response';

// Query keys
export const roleKeys = {
  all: ['roles'] as const,
  lists: () => [...roleKeys.all, 'list'] as const,
  list: (params?: ListRolesParams) => [...roleKeys.lists(), params] as const,
  details: () => [...roleKeys.all, 'detail'] as const,
  detail: (id: string) => [...roleKeys.details(), id] as const,
  permissions: (id: string) => [...roleKeys.all, 'permissions', id] as const,
};

// List Roles Hook
export function useListRoles(params?: ListRolesParams) {
  return useQuery({
    queryKey: roleKeys.list(params),
    queryFn: async () => {
      const response = await listRolesApi(params);
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Get Role Detail Hook
export function useRole(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: roleKeys.detail(id),
    queryFn: async () => {
      const response = await getRoleApi(id);
      return response.data;
    },
    enabled: enabled && !!id,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Create Role Hook
export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRoleRequest) => createRoleApi(payload),
    onSuccess: (response) => {
      // Invalidate roles list
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      
      // Show success toast
      toast.success(`Role "${response.data.name}" created successfully`);
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
}

// Update Role Hook
export function useUpdateRole(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateRoleRequest) => updateRoleApi(id, payload),
    onSuccess: (response) => {
      // Invalidate roles list and detail
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(id) });
      
      // Show success toast
      toast.success(`Role "${response.data.name}" updated successfully`);
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
}

// Delete Role Hook
export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteRoleApi(id),
    onSuccess: () => {
      // Invalidate roles list
      queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
      
      // Show success toast
      toast.success('Role deleted successfully');
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
}

// Get Role Permissions Hook
export function useRolePermissions(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: roleKeys.permissions(id),
    queryFn: async () => {
      const response = await getRolePermissionsApi(id);
      return response.data;
    },
    enabled: enabled && !!id,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Assign Permissions Hook
export function useAssignPermissions(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AssignPermissionsRequest) => assignPermissionsApi(id, payload),
    onSuccess: () => {
      // Invalidate role detail and permissions
      queryClient.invalidateQueries({ queryKey: roleKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: roleKeys.permissions(id) });
      
      // Show success toast
      toast.success('Permissions assigned successfully');
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
}
