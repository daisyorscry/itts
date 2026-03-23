import { z } from 'zod';

export type PartnerKind = 'lab' | 'partner_academic' | 'partner_industry';

export interface Partner {
  id: string;
  name: string;
  kind: PartnerKind;
  subtitle?: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface PartnerListResponse {
  data: Partner[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ListPartnersParams {
  page?: number;
  page_size?: number;
  search?: string;
  kind?: PartnerKind;
  is_active?: boolean;
}

export interface CreatePartnerRequest {
  name: string;
  kind: PartnerKind;
  subtitle?: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
  is_active?: boolean;
  priority?: number;
}

export interface UpdatePartnerRequest extends Partial<CreatePartnerRequest> {}

export interface SetPartnerActiveRequest {
  active: boolean;
}

export interface SetPartnerPriorityRequest {
  priority: number;
}

export const partnerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  kind: z.enum(['lab', 'partner_academic', 'partner_industry']),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  logo_url: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  website_url: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  is_active: z.union([z.boolean(), z.literal('true'), z.literal('false')]).transform((value) => value === true || value === 'true'),
  priority: z.coerce.number().int().min(0).default(0),
});

export type PartnerFormData = z.infer<typeof partnerSchema>;
