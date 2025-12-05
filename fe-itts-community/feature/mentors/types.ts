export type ProgramEnum = 'networking' | 'devsecops' | 'programming';

export interface Mentor {
  id: string;
  full_name: string;
  title?: string;
  bio?: string;
  avatar_url?: string;
  programs?: ProgramEnum[];
  is_active: boolean;
  priority: number;
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

export interface CreateMentorRequest {
  full_name: string;
  title?: string;
  bio?: string;
  avatar_url?: string;
  programs?: ProgramEnum[];
  is_active?: boolean;
  priority?: number;
}

export interface UpdateMentorRequest {
  full_name?: string;
  title?: string;
  bio?: string;
  avatar_url?: string;
  programs?: ProgramEnum[];
  is_active?: boolean;
  priority?: number;
}

export interface ListMentorsParams {
  page?: number;
  page_size?: number;
  program?: string;
  is_active?: boolean;
  search?: string;
}
