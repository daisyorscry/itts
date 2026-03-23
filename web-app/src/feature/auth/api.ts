import { apiClient, BASE_URL } from '../../utility/api';
import { ApiResponse } from '../../utility/response';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutRequest,
  VerifyEmailResponse,
  User,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from './types';

const AUTH_BASE = '/auth';

// Login
export async function loginApi(payload: LoginRequest): Promise<ApiResponse<LoginResponse>> {
  const response = await apiClient.post<ApiResponse<LoginResponse>>(
    `${AUTH_BASE}/login`,
    payload
  );
  return response.data;
}

// Register
export async function registerApi(payload: RegisterRequest): Promise<ApiResponse<RegisterResponse>> {
  const response = await apiClient.post<ApiResponse<RegisterResponse>>(
    `${AUTH_BASE}/register`,
    payload
  );
  return response.data;
}

// Refresh Token
export async function refreshTokenApi(payload: RefreshTokenRequest): Promise<ApiResponse<RefreshTokenResponse>> {
  const response = await apiClient.post<ApiResponse<RefreshTokenResponse>>(
    `${AUTH_BASE}/refresh`,
    payload
  );
  return response.data;
}

// Logout
export async function logoutApi(payload: LogoutRequest): Promise<void> {
  await apiClient.post(`${AUTH_BASE}/logout`, payload);
}

// Verify Email
export async function verifyEmailApi(token: string): Promise<ApiResponse<VerifyEmailResponse>> {
  const response = await apiClient.get<ApiResponse<VerifyEmailResponse>>(
    `${AUTH_BASE}/verify-email`,
    { params: { token } }
  );
  return response.data;
}

// Get Current User
export async function getMeApi(): Promise<ApiResponse<User>> {
  const response = await apiClient.get<ApiResponse<User>>(`${AUTH_BASE}/me`);
  return response.data;
}

// Update Profile
export async function updateProfileApi(payload: UpdateProfileRequest): Promise<ApiResponse<User>> {
  const response = await apiClient.patch<ApiResponse<User>>(
    `${AUTH_BASE}/me`,
    payload
  );
  return response.data;
}

// Change Password
export async function changePasswordApi(payload: ChangePasswordRequest): Promise<void> {
  await apiClient.post(`${AUTH_BASE}/change-password`, payload);
}

// OAuth GitHub - redirect to GitHub OAuth
export function getGithubOAuthUrl(state?: string): string {
  const baseUrl = BASE_URL || '';
  const params = state ? `?state=${encodeURIComponent(state)}` : '';
  return `${baseUrl}${AUTH_BASE}/oauth/github${params}`;
}

// OAuth Google - untuk future implementation
export function getGoogleOAuthUrl(state?: string): string {
  const baseUrl = BASE_URL || '';
  const params = state ? `?state=${encodeURIComponent(state)}` : '';
  return `${baseUrl}${AUTH_BASE}/oauth/google${params}`;
}