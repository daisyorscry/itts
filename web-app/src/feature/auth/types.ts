// Auth feature types

import { z } from 'zod';

export interface Role {
  id: string;
  name: string;
  description: string;
  is_system: boolean;
  parent_role_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_super_admin: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  roles: Role[];
  permissions: string[];
}

// ===== ZOD SCHEMAS =====

// Login Schema
export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Register Schema
export const registerSchema = z.object({
  full_name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/(?=.*[a-z])/, 'Password must contain lowercase letter')
    .regex(/(?=.*[A-Z])/, 'Password must contain uppercase letter')
    .regex(/(?=.*\d)/, 'Password must contain number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  program: z.enum(['networking', 'devsecops', 'programming'], {
    errorMap: () => ({ message: 'Please select a learning track' }),
  }),
  student_id: z.string()
    .min(1, 'Student ID is required')
    .regex(/^\d+$/, 'Student ID must be a number')
    .transform((val) => parseInt(val, 10)),
  intake_year: z.string()
    .min(1, 'Intake year is required')
    .regex(/^\d{4}$/, 'Year must be 4 digits')
    .transform((val) => parseInt(val, 10)),
  motivation: z.string().min(20, 'Motivation must be at least 20 characters'),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

// Update Profile Schema
export const updateProfileSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  full_name: z.string().min(3, 'Name must be at least 3 characters').optional(),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

// Change Password Schema
export const changePasswordSchema = z.object({
  old_password: z.string().min(1, 'Current password is required'),
  new_password: z.string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/(?=.*[a-z])/, 'Password must contain lowercase letter')
    .regex(/(?=.*[A-Z])/, 'Password must contain uppercase letter')
    .regex(/(?=.*\d)/, 'Password must contain number'),
  confirm_password: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.new_password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

// ===== API REQUEST/RESPONSE TYPES =====

// Login
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

// Register
export type ProgramType = 'networking' | 'devsecops' | 'programming';

export interface RegisterRequest {
  full_name: string;
  email: string;
  program: ProgramType;
  student_id: number;
  intake_year: number;
  motivation: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
  status: string;
  message: string;
}

// Refresh Token
export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

// Logout
export interface LogoutRequest {
  refresh_token: string;
}

// Verify Email
export interface VerifyEmailResponse {
  message: string;
  id: string;
  email: string;
}

// Update Profile
export interface UpdateProfileRequest {
  email?: string;
  full_name?: string;
}

// Change Password
export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}