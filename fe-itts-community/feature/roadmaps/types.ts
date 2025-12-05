export type ProgramEnum = 'networking' | 'devsecops' | 'programming';

export interface RoadmapItem {
  id: string;
  roadmap_id: string;
  item_text: string;
  sort_order: number;
}

export interface Roadmap {
  id: string;
  program?: string;
  month_number: number;
  title: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  items?: RoadmapItem[];
  created_at: string;
  updated_at: string;
}

export interface PageResult<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CreateRoadmapRequest {
  program?: ProgramEnum;
  month_number: number;
  title: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface UpdateRoadmapRequest {
  program?: ProgramEnum;
  month_number?: number;
  title?: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface ListRoadmapsParams {
  page?: number;
  page_size?: number;
  program?: string;
  month_number?: number;
  is_active?: boolean;
  search?: string;
}
