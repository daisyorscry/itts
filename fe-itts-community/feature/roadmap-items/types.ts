export interface RoadmapItem {
  id: string;
  roadmap_id: string;
  item_text: string;
  sort_order: number;
}

export interface PageResult<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
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

export interface ListRoadmapItemsParams {
  page?: number;
  page_size?: number;
  roadmap_id?: string;
  search?: string;
}
