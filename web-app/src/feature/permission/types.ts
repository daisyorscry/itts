// Permission feature types

import { z } from 'zod';

// ===== ENTITY TYPES =====

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

// ===== API RESPONSE TYPES =====

export interface PermissionListResponse {
  data: Permission[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface PermissionDetailResponse {
  id: string;
  name: string;
  description: string;
  resource: Resource;
  action: Action;
  created_at: string;
  updated_at: string;
}

export interface ResourceListResponse {
  data: Resource[];
}

export interface ActionListResponse {
  data: Action[];
}

// ===== QUERY PARAMS =====

export interface ListPermissionsParams {
  page?: number;
  page_size?: number;
  search?: string;
  resource_id?: string;
  action_id?: string;
}
