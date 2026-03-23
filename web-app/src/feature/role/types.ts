import { z } from 'zod';

// ===== CORE TYPES =====

export interface Resource {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Action {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: Resource;
  action: Action;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  is_system: boolean;
  parent_role_id: string | null;
  created_at: string;
  updated_at: string;
  permissions?: Permission[];
}

export interface PaginatedRoles {
  data: Role[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

// ===== ZOD SCHEMAS =====

// Create Role Schema
export const createRoleSchema = z.object({
  name: z.string()
    .min(3, 'Role name must be at least 3 characters')
    .regex(/^[a-z0-9-]+$/, 'Role name must be lowercase letters, numbers, and hyphens only'),
  description: z.string()
    .min(10, 'Description must be at least 10 characters'),
  parent_role_id: z.string().nullable().optional(),
  permission_ids: z.array(z.string()).optional(),
});

export type CreateRoleFormData = z.infer<typeof createRoleSchema>;

// Update Role Schema
export const updateRoleSchema = z.object({
  name: z.string()
    .min(3, 'Role name must be at least 3 characters')
    .regex(/^[a-z0-9-]+$/, 'Role name must be lowercase letters, numbers, and hyphens only')
    .optional(),
  description: z.string()
    .min(10, 'Description must be at least 10 characters')
    .optional(),
  parent_role_id: z.string().nullable().optional(),
  permission_ids: z.array(z.string()).optional(),
});

export type UpdateRoleFormData = z.infer<typeof updateRoleSchema>;

// Assign Permissions Schema
export const assignPermissionsSchema = z.object({
  permission_ids: z.array(z.string())
    .min(1, 'Select at least one permission'),
});

export type AssignPermissionsFormData = z.infer<typeof assignPermissionsSchema>;

// ===== API REQUEST/RESPONSE TYPES =====

// Create Role
export interface CreateRoleRequest {
  name: string;
  description: string;
  parent_role_id?: string | null;
  permission_ids?: string[];
}

// Update Role
export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  parent_role_id?: string | null;
  permission_ids?: string[];
}

// Assign Permissions
export interface AssignPermissionsRequest {
  permission_ids: string[];
}

// List Roles Query Params
export interface ListRolesParams {
  page?: number;
  page_size?: number;
  search?: string;
  is_system?: boolean;
}
