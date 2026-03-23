import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import {
  loginApi,
  registerApi,
  logoutApi,
  getMeApi,
  updateProfileApi,
  changePasswordApi,
  verifyEmailApi,
} from './api';
import {
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from './types';
import { useAuthStore } from '../../store/auth.store';
import { getErrorMessage } from '../../utility/response';

// Query keys
export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

// Login Hook
export function useLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: (payload: LoginRequest) => loginApi(payload),
    onSuccess: (response) => {
      const { access_token, refresh_token, user } = response.data;
      
      // Set auth state
      setAuth(user, access_token, refresh_token);
      
      // Show success toast
      toast.success(`Welcome back, ${user.full_name}!`);
      
      // Navigate to admin dashboard
      navigate('/admin');
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
}

// Register Hook
export function useRegister() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: RegisterRequest) => registerApi(payload),
    onSuccess: (response) => {
      const { message } = response.data;
      
      // Show success toast
      toast.success(message);
      
      // Navigate to sign in
      navigate('/sign-in');
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
}

// Logout Hook
export function useLogout() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      return logoutApi({ refresh_token: refreshToken });
    },
    onSuccess: () => {
      // Clear auth state
      clearAuth();
      
      // Clear all queries
      queryClient.clear();
      
      // Show success toast
      toast.success('Logged out successfully');
      
      // Navigate to home
      navigate('/');
    },
    onError: (error) => {
      // Even if logout fails, clear local state
      clearAuth();
      queryClient.clear();
      
      const message = getErrorMessage(error);
      toast.error(message);
      
      navigate('/');
    },
  });
}

// Get Current User Hook
export function useMe() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: authKeys.me(),
    queryFn: async () => {
      const response = await getMeApi();
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });
}

// Update Profile Hook
export function useUpdateProfile() {
  const updateUser = useAuthStore((state) => state.updateUser);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfileRequest) => updateProfileApi(payload),
    onSuccess: (response) => {
      const user = response.data;
      
      // Update user in store
      updateUser(user);
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
      
      // Show success toast
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
}

// Change Password Hook
export function useChangePassword() {
  return useMutation({
    mutationFn: (payload: ChangePasswordRequest) => changePasswordApi(payload),
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
}

// Verify Email Hook
export function useVerifyEmail() {
  return useMutation({
    mutationFn: (token: string) => verifyEmailApi(token),
    onSuccess: (response) => {
      const { message } = response.data;
      toast.success(message);
    },
    onError: (error) => {
      const message = getErrorMessage(error);
      toast.error(message);
    },
  });
}
