export type ProgramEnum = 'networking' | 'devsecops' | 'programming';
export type EventStatus = 'draft' | 'open' | 'ongoing' | 'closed';

export interface Speaker {
  id: string;
  event_id: string;
  name: string;
  title?: string;
  avatar_url?: string;
  sort_order: number;
}

export interface Event {
  id: string;
  slug?: string;
  title: string;
  summary?: string;
  description?: string;
  image_url?: string;
  program?: string;
  status: EventStatus;
  starts_at: string;
  ends_at?: string;
  venue?: string;
  speakers?: Speaker[];
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

export interface CreateEventRequest {
  slug?: string;
  title: string;
  summary?: string;
  description?: string;
  image_url?: string;
  program?: ProgramEnum;
  status?: EventStatus;
  starts_at: string;
  ends_at?: string;
  venue?: string;
}

export interface UpdateEventRequest {
  slug?: string;
  title?: string;
  summary?: string;
  description?: string;
  image_url?: string;
  program?: ProgramEnum;
  status?: EventStatus;
  starts_at?: string;
  ends_at?: string;
  venue?: string;
}

export interface ListEventsParams {
  page?: number;
  page_size?: number;
  status?: string;
  program?: string;
  search?: string;
}
