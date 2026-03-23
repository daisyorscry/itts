import { z } from 'zod';

export type PMBApplicationStatus = 'draft' | 'verified' | 'passed' | 'failed' | 're_registered';
export type PMBDegreeLevel = 'D3' | 'S1' | 'S2' | 'S3';
export type PMBDocumentVerificationStatus = 'pending' | 'valid' | 'invalid';
export type PMBEvaluationType = 'written_test' | 'interview' | 'academic_score' | 'other';
export type PMBFinalResultStatus = 'passed' | 'failed' | 'waiting_list';
export type PMBPaymentStatus = 'unpaid' | 'paid';

export interface PMBApplicant {
  id: string;
  user_id: string;
  full_name: string;
  national_id: string;
  place_of_birth: string;
  date_of_birth?: string | null;
  gender: string;
  address: string;
  phone_number: string;
  school_origin: string;
  graduation_year: string;
  created_at: string;
  updated_at: string;
}

export interface PMBAdmissionTrack {
  id: string;
  track_code: string;
  track_name: string;
  requires_test: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PMBFaculty {
  id: string;
  code: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface PMBStudyProgram {
  id: string;
  faculty_id: string;
  code: string;
  name: string;
  degree_level: PMBDegreeLevel;
  quota: number;
  faculty?: PMBFaculty | null;
  created_at: string;
  updated_at: string;
}

export interface PMBApplication {
  id: string;
  applicant_id: string;
  track_id: string;
  program_id: string;
  academic_year: string;
  application_number: string;
  status: PMBApplicationStatus;
  applicant?: PMBApplicant | null;
  track?: PMBAdmissionTrack | null;
  program?: PMBStudyProgram | null;
  created_at: string;
  updated_at: string;
}

export interface PMBApplicantDocument {
  id: string;
  applicant_id: string;
  document_type: string;
  file_path: string;
  verification_status: string;
  applicant?: PMBApplicant | null;
  verified_by?: string | null;
  verified_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PMBEvaluation {
  id: string;
  application_id: string;
  evaluation_type: string;
  score?: number | null;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PMBFinalResult {
  id: string;
  application_id: string;
  result_status: string;
  final_score?: number | null;
  decided_by?: string | null;
  decision_date: string;
  updated_at: string;
}

export interface PMBReRegistration {
  id: string;
  application_id: string;
  re_registration_date: string;
  payment_status: string;
  payment_proof?: string;
  application?: PMBApplication | null;
  created_at: string;
  updated_at: string;
}

export interface PMBApplicationDetails extends PMBApplication {
  applicant?: (PMBApplicant & { documents?: PMBApplicantDocument[] }) | null;
  evaluations?: PMBEvaluation[];
  final_result?: PMBFinalResult | null;
  re_registration?: PMBReRegistration | null;
}

export interface PMBListResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface PMBTrackStatistic {
  track_id: string;
  track_name: string;
  count: number;
}

export interface PMBProgramStatistic {
  program_id: string;
  program_name: string;
  count: number;
}

export interface PMBApplicationStats {
  academic_year: string;
  total: number;
  by_status: Record<string, number>;
  by_track: PMBTrackStatistic[];
  by_program: PMBProgramStatistic[];
}

export interface PMBProgramDetailStats {
  program: PMBStudyProgram;
  total: number;
  by_status: Record<string, number>;
  quota: number;
  available_quota: number;
  filled_quota: number;
}

export interface PMBAverageScore {
  application_id: string;
  average_score: number;
}

export interface ListPMBApplicationsParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: PMBApplicationStatus;
  academic_year?: string;
  track_id?: string;
  program_id?: string;
}

export interface ListPMBTracksParams {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: boolean;
}

export interface ListPMBFacultiesParams {
  page?: number;
  page_size?: number;
  search?: string;
}

export interface ListPMBProgramsParams {
  page?: number;
  page_size?: number;
  search?: string;
  faculty_id?: string;
  degree_level?: PMBDegreeLevel;
}

export interface ListPMBApplicantsParams {
  page?: number;
  page_size?: number;
  search?: string;
  gender?: string;
  graduation_year?: string;
}

export interface ListPMBDocumentsParams {
  page?: number;
  page_size?: number;
  search?: string;
  applicant_id?: string;
  document_type?: string;
  verification_status?: PMBDocumentVerificationStatus;
}

export interface CreatePMBApplicantRequest {
  user_id: string;
  full_name: string;
  national_id: string;
  place_of_birth: string;
  date_of_birth: string;
  gender: 'male' | 'female';
  address: string;
  phone_number: string;
  school_origin: string;
  graduation_year: string;
}

export interface UpdatePMBApplicantRequest {
  full_name?: string;
  place_of_birth?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female';
  address?: string;
  phone_number?: string;
  school_origin?: string;
  graduation_year?: string;
}

export interface CreatePMBApplicationRequest {
  applicant_id: string;
  track_id: string;
  program_id: string;
  academic_year: string;
  status?: PMBApplicationStatus;
}

export interface UpdatePMBApplicationRequest extends Partial<CreatePMBApplicationRequest> {}

export interface UpdatePMBDocumentVerificationRequest {
  status: PMBDocumentVerificationStatus;
  verified_by: string;
}

export interface CreatePMBAdmissionTrackRequest {
  track_code: string;
  track_name: string;
  requires_test: boolean;
  is_active: boolean;
}

export interface UpdatePMBAdmissionTrackRequest extends Partial<CreatePMBAdmissionTrackRequest> {}

export interface CreatePMBFacultyRequest {
  code: string;
  name: string;
}

export interface UpdatePMBFacultyRequest extends Partial<CreatePMBFacultyRequest> {}

export interface CreatePMBStudyProgramRequest {
  faculty_id: string;
  code: string;
  name: string;
  degree_level: PMBDegreeLevel;
  quota: number;
}

export interface UpdatePMBStudyProgramRequest extends Partial<CreatePMBStudyProgramRequest> {}

export interface UpdatePMBApplicationStatusRequest {
  status: PMBApplicationStatus;
}

export interface CreatePMBEvaluationRequest {
  application_id: string;
  evaluation_type: PMBEvaluationType;
  score?: number;
  notes?: string;
}

export interface UpdatePMBEvaluationRequest extends Partial<Omit<CreatePMBEvaluationRequest, 'application_id'>> {}

export interface CreatePMBFinalResultRequest {
  application_id: string;
  result_status: PMBFinalResultStatus;
  final_score?: number;
}

export interface UpdatePMBFinalResultRequest extends Partial<Omit<CreatePMBFinalResultRequest, 'application_id'>> {}

export interface CreatePMBReRegistrationRequest {
  application_id: string;
  re_registration_date: string;
  payment_status: PMBPaymentStatus;
  payment_proof?: string;
}

export interface UpdatePMBPaymentStatusRequest {
  payment_status: PMBPaymentStatus;
  payment_proof?: string;
}

const optionalNumber = z.preprocess(
  (value) => (value === '' || value === null || value === undefined ? undefined : value),
  z.coerce.number().min(0).max(100).optional(),
);

export const pmbApplicationSchema = z.object({
  applicant_id: z.string().min(1, 'Applicant is required'),
  track_id: z.string().min(1, 'Admission track is required'),
  program_id: z.string().min(1, 'Study program is required'),
  academic_year: z.string().regex(/^\d{4}\/\d{4}$/, 'Academic year must use format YYYY/YYYY'),
  status: z.enum(['draft', 'verified', 'passed', 'failed', 're_registered']).default('draft'),
});

export const pmbEvaluationSchema = z.object({
  evaluation_type: z.enum(['written_test', 'interview', 'academic_score', 'other']),
  score: optionalNumber,
  notes: z.string().max(500, 'Notes must be at most 500 characters').optional().or(z.literal('')),
});

export const pmbFinalResultSchema = z.object({
  result_status: z.enum(['passed', 'failed', 'waiting_list']),
  final_score: optionalNumber,
});

export const pmbReRegistrationSchema = z.object({
  re_registration_date: z.string().min(1, 'Re-registration date is required'),
  payment_status: z.enum(['unpaid', 'paid']),
  payment_proof: z.string().max(255, 'Payment proof must be at most 255 characters').optional().or(z.literal('')),
});

export const pmbTrackSchema = z.object({
  track_code: z.string().min(1, 'Track code is required').max(20, 'Track code must be at most 20 characters'),
  track_name: z.string().min(1, 'Track name is required').max(100, 'Track name must be at most 100 characters'),
  requires_test: z.boolean().default(false),
  is_active: z.boolean().default(true),
});

export const pmbFacultySchema = z.object({
  code: z.string().min(1, 'Faculty code is required').max(20, 'Faculty code must be at most 20 characters'),
  name: z.string().min(1, 'Faculty name is required').max(100, 'Faculty name must be at most 100 characters'),
});

export const pmbStudyProgramSchema = z.object({
  faculty_id: z.string().min(1, 'Faculty is required'),
  code: z.string().min(1, 'Program code is required').max(20, 'Program code must be at most 20 characters'),
  name: z.string().min(1, 'Program name is required').max(100, 'Program name must be at most 100 characters'),
  degree_level: z.enum(['D3', 'S1', 'S2', 'S3']),
  quota: z.coerce.number().int().min(1, 'Quota must be at least 1'),
});

export const pmbApplicantSchema = z.object({
  user_id: z.string().min(1, 'User ID is required'),
  full_name: z.string().min(3, 'Full name must be at least 3 characters'),
  national_id: z.string().length(16, 'National ID must be 16 digits'),
  place_of_birth: z.string().min(1, 'Place of birth is required').max(100, 'Place of birth must be at most 100 characters'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female']),
  address: z.string().min(1, 'Address is required').max(255, 'Address must be at most 255 characters'),
  phone_number: z.string().min(1, 'Phone number is required').max(20, 'Phone number must be at most 20 characters'),
  school_origin: z.string().min(1, 'School origin is required').max(150, 'School origin must be at most 150 characters'),
  graduation_year: z.string().length(4, 'Graduation year must be 4 digits'),
});

export type PMBTrackFormData = z.infer<typeof pmbTrackSchema>;
export type PMBFacultyFormData = z.infer<typeof pmbFacultySchema>;
export type PMBStudyProgramFormData = z.infer<typeof pmbStudyProgramSchema>;
export type PMBApplicantFormData = z.infer<typeof pmbApplicantSchema>;
export type PMBApplicationFormData = z.infer<typeof pmbApplicationSchema>;
export type PMBEvaluationFormData = z.infer<typeof pmbEvaluationSchema>;
export type PMBFinalResultFormData = z.infer<typeof pmbFinalResultSchema>;
export type PMBReRegistrationFormData = z.infer<typeof pmbReRegistrationSchema>;
