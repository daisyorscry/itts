export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  program?: string;
  university?: string;
  nim?: string;
  created_at: string;
}

export interface ListEventRegistrationsParams {
  event_id?: string;
  page?: number;
  page_size?: number;
  search?: string;
}

export interface PageResult<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
