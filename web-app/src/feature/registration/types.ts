import { z } from 'zod';

export type ProgramType = 'networking' | 'devsecops' | 'programming';
export type RegistrationStatus = 'pending' | 'approved' | 'rejected';

export interface Registration {
  id: string;
  full_name: string;
  email: string;
  program: ProgramType;
  student_id: string;
  intake_year: number;
  motivation: string;
  status: RegistrationStatus;
  approved_by?: string | null;
  approved_at?: string | null;
  rejected_reason?: string | null;
  email_verified_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface RegistrationListResponse {
  data: Registration[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ListRegistrationsParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: RegistrationStatus;
  program?: ProgramType;
  intake_year?: number;
  email?: string;
}

export interface RejectRegistrationRequest {
  reason: string;
}

export const rejectRegistrationSchema = z.object({
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
});

export type RejectRegistrationFormData = z.infer<typeof rejectRegistrationSchema>;
