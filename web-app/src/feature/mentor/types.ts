import { z } from 'zod';

export type ProgramType = 'networking' | 'devsecops' | 'programming';

export interface Mentor {
  id: string;
  full_name: string;
  title?: string;
  bio?: string;
  avatar_url?: string;
  programs?: ProgramType[];
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface MentorListResponse {
  data: Mentor[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ListMentorsParams {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: boolean;
  program?: ProgramType;
}

export interface CreateMentorRequest {
  full_name: string;
  title?: string;
  bio?: string;
  avatar_url?: string;
  programs?: ProgramType[];
  is_active?: boolean;
  priority?: number;
}

export interface UpdateMentorRequest extends Partial<CreateMentorRequest> {}

export const mentorSchema = z.object({
  full_name: z.string().min(3, 'Full name must be at least 3 characters'),
  title: z.string().optional(),
  bio: z.string().optional(),
  avatar_url: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  programs: z.array(z.enum(['networking', 'devsecops', 'programming'])).default([]),
  is_active: z.union([z.boolean(), z.literal('true'), z.literal('false')]).transform((value) => value === true || value === 'true'),
  priority: z.coerce.number().int().min(0).default(0),
});

export type MentorFormData = z.infer<typeof mentorSchema>;
