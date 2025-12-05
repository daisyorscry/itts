export type PartnerType = 'lab' | 'partner_academic' | 'partner_industry';

export interface Partner {
  id: string;
  name: string;
  kind: PartnerType;
  subtitle?: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
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

export interface CreatePartnerRequest {
  name: string;
  kind: PartnerType;
  subtitle?: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  is_active?: boolean;
  priority?: number;
}

export interface UpdatePartnerRequest {
  name?: string;
  kind?: PartnerType;
  subtitle?: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  is_active?: boolean;
  priority?: number;
}

export interface ListPartnersParams {
  page?: number;
  page_size?: number;
  kind?: string;
  is_active?: boolean;
  search?: string;
}
