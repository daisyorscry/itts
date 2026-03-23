import { z } from 'zod';

export type ProgramType = 'networking' | 'devsecops' | 'programming';
export type EventStatus = 'draft' | 'open' | 'ongoing' | 'closed';
export type EventRegistrationStatus =
  | 'pending_verification'
  | 'pending_payment'
  | 'approved'
  | 'waitlisted'
  | 'rejected'
  | 'cancelled'
  | 'expired';
export type EventPaymentStatus = 'not_required' | 'pending' | 'paid' | 'failed' | 'expired';

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
  file_path?: string;
  benefits?: string[];
  program?: ProgramType | '';
  status: EventStatus;
  capacity: number;
  remaining_slots: number;
  registration_deadline?: string | null;
  is_paid: boolean;
  price: number;
  currency?: string;
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
  phone_number?: string;
  institution?: string;
  status: EventRegistrationStatus;
  payment_status: EventPaymentStatus;
  payment_url?: string;
  verified_at?: string | null;
  approved_at?: string | null;
  waitlisted_at?: string | null;
  rejected_at?: string | null;
  created_at: string;
}

export interface CreatePublicEventRegistrationRequest {
  full_name: string;
  email: string;
  phone_number?: string;
  institution?: string;
}

export interface VerifyEventRegistrationRequest {
  token: string;
}

export interface CreateEventRegistrationPaymentRequest {
  provider: string;
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
  status?: EventRegistrationStatus;
}

export interface CreateEventRequest {
  slug?: string;
  title: string;
  summary?: string;
  description?: string;
  image_url?: string;
  file_path?: string;
  benefits?: string[];
  program?: ProgramType;
  status?: EventStatus;
  capacity?: number;
  registration_deadline?: string;
  is_paid?: boolean;
  price?: number;
  currency?: string;
  starts_at: string;
  ends_at?: string;
  venue?: string;
}

export interface UpdateEventRequest extends Partial<CreateEventRequest> {}

export interface UploadedEventImage {
  file_path: string;
  image_url?: string;
}

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

function isEventImageValue(value?: string) {
  if (!value) {
    return true;
  }

  if (value.startsWith('data:image/')) {
    return true;
  }

  if (value.startsWith('/uploads/')) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export const eventSchema = z.object({
  slug: z.string().optional(),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  summary: z.string().optional(),
  description: z.string().optional(),
  image_url: z.string().optional().refine(isEventImageValue, {
    message: 'Image must be an uploaded file or a valid URL',
  }),
  benefits: z.array(z.string().min(1)).optional(),
  program: z.enum(['networking', 'devsecops', 'programming']).optional(),
  status: z.enum(['draft', 'open', 'ongoing', 'closed']).default('draft'),
  capacity: z.coerce.number().int().min(0).optional(),
  registration_deadline: z.string().optional(),
  is_paid: z.boolean().optional(),
  price: z.coerce.number().min(0).optional(),
  currency: z.string().optional(),
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

export const publicEventRegistrationSchema = z.object({
  full_name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Must be a valid email address'),
  phone_number: z.string().optional(),
  institution: z.string().optional(),
});

export type EventFormData = z.infer<typeof eventSchema>;
export type SpeakerFormData = z.infer<typeof speakerSchema>;
export type PublicEventRegistrationFormData = z.infer<typeof publicEventRegistrationSchema>;
