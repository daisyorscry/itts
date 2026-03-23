import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  listUsersApi,
  getUserApi,
  createUserApi,
  updateUserApi,
  deleteUserApi,
  resetPasswordApi,
  assignRolesApi,
} from './api';
import {
  CreateUserRequest,
  UpdateUserRequest,
  ResetPasswordRequest,
  AssignRolesRequest,
  ListUsersParams,
} from './types';
import { getErrorMessage } from '../../utility/response';

// Query keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params?: ListUsersParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// List Users Hook
export function useListUsers(params?: ListUsersParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: async () => {
      const response = await listUsersApi(params);
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Get User Detail Hook
export function useUser(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      const response = await getUserApi(id);
      return response.data;
    },
    enabled: enabled && !!id,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Alias for useUser (more explicit naming)
export function useGetUser(id: string, enabled: boolean = true) {
  return useUser(id, enabled);
}

// Create User Hook
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateUserRequest) => createUserApi(payload),
    onSuccess: (response) => {
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      
      // Show success toast
      toast.success(`User "${response.data.full_name}" created successfully`);
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
}

// Update User Hook
export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateUserRequest) => updateUserApi(id, payload),
    onSuccess: (response) => {
      // Invalidate users list and detail
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      
      // Show success toast
      toast.success(`User "${response.data.full_name}" updated successfully`);
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
}

// Delete User Hook
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteUserApi(id),
    onSuccess: () => {
      // Invalidate users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      
      // Show success toast
      toast.success('User deleted successfully');
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
}

// Reset Password Hook
export function useResetPassword(id: string) {
  return useMutation({
    mutationFn: (payload: ResetPasswordRequest) => resetPasswordApi(id, payload),
    onSuccess: () => {
      // Show success toast
      toast.success('Password reset successfully. User must login again.');
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
}

// Assign Roles Hook
export function useAssignRoles(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AssignRolesRequest) => assignRolesApi(id, payload),
    onSuccess: () => {
      // Invalidate user detail
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      
      // Show success toast
      toast.success('Roles assigned successfully');
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
}