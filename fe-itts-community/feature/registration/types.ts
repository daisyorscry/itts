/**
 * Registration Types
 */

export type ProgramEnum = "networking" | "devsecops" | "programming";

export type RegistrationStatus = "pending" | "approved" | "rejected";

export type Registration = {
  id: string;
  full_name: string;
  email: string;
  program: ProgramEnum;
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
};

export type PageResult<T> = {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export type ListRegistrationsParams = {
  page?: number;
  page_size?: number;
  status?: RegistrationStatus;
  program?: ProgramEnum;
  search?: string;
};

export type ApproveRegistrationRequest = {
  id: string;
  admin_id: string;
};

export type RejectRegistrationRequest = {
  id: string;
  admin_id: string;
  reason: string;
};
