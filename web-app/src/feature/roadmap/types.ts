import { z } from 'zod';

export type ProgramType = 'networking' | 'devsecops' | 'programming';

export interface RoadmapItem {
  id: string;
  roadmap_id: string;
  item_text: string;
  sort_order: number;
}

export interface Roadmap {
  id: string;
  program?: ProgramType | '';
  month_number: number;
  title: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  items?: RoadmapItem[];
  created_at: string;
  updated_at: string;
}

export interface RoadmapListResponse {
  data: Roadmap[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface RoadmapItemListResponse {
  data: RoadmapItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ListRoadmapsParams {
  page?: number;
  page_size?: number;
  search?: string;
  program?: ProgramType;
  is_active?: boolean;
  month_number?: number;
}

export interface ListRoadmapItemsParams {
  page?: number;
  page_size?: number;
  search?: string;
  roadmap_id?: string;
}

export interface CreateRoadmapRequest {
  program?: ProgramType;
  month_number: number;
  title: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface UpdateRoadmapRequest {
  program?: ProgramType;
  month_number?: number;
  title?: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface CreateRoadmapItemRequest {
  roadmap_id: string;
  item_text: string;
  sort_order?: number;
}

export interface UpdateRoadmapItemRequest {
  roadmap_id?: string;
  item_text?: string;
  sort_order?: number;
}

export const roadmapSchema = z.object({
  program: z.enum(['networking', 'devsecops', 'programming']).optional(),
  month_number: z.coerce.number().int().min(1).max(12),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  sort_order: z.coerce.number().int().min(0).default(0),
  is_active: z.union([z.boolean(), z.literal('true'), z.literal('false')]).transform((value) => value === true || value === 'true'),
});

export const roadmapItemSchema = z.object({
  roadmap_id: z.string().min(1, 'Roadmap is required'),
  item_text: z.string().min(1, 'Item text is required'),
  sort_order: z.coerce.number().int().min(0).default(0),
});

export type RoadmapFormData = z.infer<typeof roadmapSchema>;
export type RoadmapItemFormData = z.infer<typeof roadmapItemSchema>;
