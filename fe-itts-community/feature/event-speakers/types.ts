export interface Speaker {
  id: string;
  event_id: string;
  name: string;
  title?: string;
  avatar_url?: string;
  sort_order: number;
}

export interface CreateSpeakerRequest {
  event_id: string;
  name: string;
  title?: string;
  avatar_url?: string;
  sort_order?: number;
}

export interface UpdateSpeakerRequest {
  name?: string;
  title?: string;
  avatar_url?: string;
  sort_order?: number;
}

export interface ListSpeakersParams {
  event_id?: string;
  page?: number;
  page_size?: number;
}

export interface PageResult<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
