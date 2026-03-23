import { z } from 'zod';
import type { Role } from '../role/types';

export interface UserSummary {
  id: string;
  email: string;
  full_name: string;
}

export interface UserRoleAssignment {
  id: string;
  user_id: string;
  role_id: string;
  granted_by: string | null;
  granted_by_user?: UserSummary;
  granted_at: string;
  expires_at?: string | null;
  is_expired: boolean;
  role: Role;
}

// ============================================================================
// User Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  is_super_admin: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  roles?: Role[];
  permissions?: string[];
  role_assignments?: UserRoleAssignment[];
}

// ============================================================================
// API Request Types
// ============================================================================

export interface CreateUserRequest {
  email: string;
  password: string;
  full_name: string;
  is_active?: boolean;
  is_super_admin?: boolean;
  role_ids?: string[];
}

export interface UpdateUserRequest {
  email?: string;
  full_name?: string;
  is_active?: boolean;
  is_super_admin?: boolean;
  role_ids?: string[];
}

export interface ResetPasswordRequest {
  new_password: string;
}

export interface AssignRolesRequest {
  role_ids: string[];
  expires_at?: string | null;
}

export interface ListUsersParams {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: boolean;
  is_super_admin?: boolean;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ListUsersResponse {
  data: User[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ============================================================================
// Form Validation Schemas
// ============================================================================

export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  full_name: z.string().min(1, 'Full name is required'),
  is_active: z.boolean().optional(),
  is_super_admin: z.boolean().optional(),
  role_ids: z.array(z.string()).optional(),
});

export const updateUserSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  full_name: z.string().min(1, 'Full name is required').optional(),
  is_active: z.boolean().optional(),
  is_super_admin: z.boolean().optional(),
  role_ids: z.array(z.string()).optional(),
});

export const resetPasswordSchema = z.object({
  new_password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const assignRolesSchema = z.object({
  role_ids: z.array(z.string()).min(1, 'At least one role is required'),
  expires_at: z.string().nullable().optional(),
});

// ============================================================================
// Form Data Types
// ============================================================================

export type CreateUserFormData = z.infer<typeof createUserSchema>;
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type AssignRolesFormData = z.infer<typeof assignRolesSchema>;
