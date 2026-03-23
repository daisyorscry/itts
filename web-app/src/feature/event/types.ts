import { z } from 'zod';

export type ProgramType = 'networking' | 'devsecops' | 'programming';
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
  program?: ProgramType | '';
  status: EventStatus;
  starts_at: string;
  ends_at?: string | null;
  venue?: string;
  speakers?: Speaker[];
  created_at: string;
  updated_at: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  full_name: string;
  email: string;
  created_at: string;
}

export interface EventListResponse {
  data: Event[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface SpeakerListResponse {
  data: Speaker[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface EventRegistrationListResponse {
  data: EventRegistration[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ListEventsParams {
  page?: number;
  page_size?: number;
  search?: string;
  program?: ProgramType;
  status?: EventStatus;
  from?: string;
  to?: string;
}

export interface ListSpeakersParams {
  page?: number;
  page_size?: number;
  search?: string;
  event_id?: string;
}

export interface ListEventRegistrationsParams {
  page?: number;
  page_size?: number;
  search?: string;
  event_id?: string;
  email?: string;
}

export interface CreateEventRequest {
  slug?: string;
  title: string;
  summary?: string;
  description?: string;
  image_url?: string;
  program?: ProgramType;
  status?: EventStatus;
  starts_at: string;
  ends_at?: string;
  venue?: string;
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {}

export interface SetEventStatusRequest {
  status: EventStatus;
}

export interface CreateSpeakerRequest {
  event_id: string;
  name: string;
  title?: string;
  avatar_url?: string;
  sort_order?: number;
}

export interface UpdateSpeakerRequest extends Partial<CreateSpeakerRequest> {}

export const eventSchema = z.object({
  slug: z.string().optional(),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  summary: z.string().optional(),
  description: z.string().optional(),
  image_url: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  program: z.enum(['networking', 'devsecops', 'programming']).optional(),
  status: z.enum(['draft', 'open', 'ongoing', 'closed']).default('draft'),
  starts_at: z.string().min(1, 'Start date is required'),
  ends_at: z.string().optional(),
  venue: z.string().optional(),
}).refine((data) => {
  if (!data.ends_at) {
    return true;
  }
  return new Date(data.ends_at).getTime() >= new Date(data.starts_at).getTime();
}, {
  message: 'End date must be after start date',
  path: ['ends_at'],
});

export const speakerSchema = z.object({
  event_id: z.string().min(1, 'Event is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  title: z.string().optional(),
  avatar_url: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  sort_order: z.coerce.number().int().min(0).default(0),
});

export type EventFormData = z.infer<typeof eventSchema>;
export type SpeakerFormData = z.infer<typeof speakerSchema>;
