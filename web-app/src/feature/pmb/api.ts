import { apiClient } from '../../utility/api';
import type { ApiResponse } from '../../utility/response';
import type {
  CreatePMBAdmissionTrackRequest,
  CreatePMBApplicantRequest,
  CreatePMBApplicationRequest,
  CreatePMBEvaluationRequest,
  CreatePMBFacultyRequest,
  CreatePMBFinalResultRequest,
  CreatePMBReRegistrationRequest,
  CreatePMBStudyProgramRequest,
  ListPMBDocumentsParams,
  ListPMBApplicantsParams,
  ListPMBApplicationsParams,
  ListPMBFacultiesParams,
  ListPMBProgramsParams,
  ListPMBTracksParams,
  PMBAdmissionTrack,
  PMBApplicant,
  PMBApplicantDocument,
  PMBAverageScore,
  PMBApplicationDetails,
  PMBApplicationStats,
  PMBApplication,
  PMBEvaluation,
  PMBFaculty,
  PMBFinalResult,
  PMBListResponse,
  PMBProgramDetailStats,
  PMBReRegistration,
  PMBStudyProgram,
  UpdatePMBAdmissionTrackRequest,
  UpdatePMBApplicantRequest,
  UpdatePMBApplicationRequest,
  UpdatePMBApplicationStatusRequest,
  UpdatePMBDocumentVerificationRequest,
  UpdatePMBEvaluationRequest,
  UpdatePMBFacultyRequest,
  UpdatePMBFinalResultRequest,
  UpdatePMBPaymentStatusRequest,
  UpdatePMBStudyProgramRequest,
} from './types';

const PMB_BASE = '/admin/pmb';

export async function listPMBApplicantsApi(params?: ListPMBApplicantsParams): Promise<ApiResponse<PMBListResponse<PMBApplicant>>> {
  const response = await apiClient.get<ApiResponse<PMBListResponse<PMBApplicant>>>(`${PMB_BASE}/applicants`, { params });
  return response.data;
}

export async function listPMBApplicationsApi(params?: ListPMBApplicationsParams): Promise<ApiResponse<PMBListResponse<PMBApplication>>> {
  const response = await apiClient.get<ApiResponse<PMBListResponse<PMBApplication>>>(`${PMB_BASE}/applications`, { params });
  return response.data;
}

export async function listPMBDocumentsApi(params?: ListPMBDocumentsParams): Promise<ApiResponse<PMBListResponse<PMBApplicantDocument>>> {
  const response = await apiClient.get<ApiResponse<PMBListResponse<PMBApplicantDocument>>>(`${PMB_BASE}/documents`, { params });
  return response.data;
}

export async function createPMBApplicationApi(payload: CreatePMBApplicationRequest): Promise<ApiResponse<PMBApplication>> {
  const response = await apiClient.post<ApiResponse<PMBApplication>>(`/pmb/applications`, payload);
  return response.data;
}

export async function getPMBApplicationDetailsApi(id: string): Promise<ApiResponse<PMBApplicationDetails>> {
  const response = await apiClient.get<ApiResponse<PMBApplicationDetails>>(`${PMB_BASE}/applications/${id}/details`);
  return response.data;
}

export async function getPMBApplicationStatsApi(academicYear: string): Promise<ApiResponse<PMBApplicationStats>> {
  const response = await apiClient.get<ApiResponse<PMBApplicationStats>>(`${PMB_BASE}/stats/academic-year/${encodeURIComponent(academicYear)}`);
  return response.data;
}

export async function getPMBProgramStatsApi(programId: string, academicYear: string): Promise<ApiResponse<PMBProgramDetailStats>> {
  const response = await apiClient.get<ApiResponse<PMBProgramDetailStats>>(`${PMB_BASE}/stats/programs/${programId}`, {
    params: { academic_year: academicYear },
  });
  return response.data;
}

export async function getPMBAverageScoreApi(applicationId: string): Promise<ApiResponse<PMBAverageScore>> {
  const response = await apiClient.get<ApiResponse<PMBAverageScore>>(`${PMB_BASE}/applications/${applicationId}/average-score`);
  return response.data;
}

export async function listPMBAdmissionTracksApi(params?: ListPMBTracksParams): Promise<ApiResponse<PMBListResponse<PMBAdmissionTrack>>> {
  const response = await apiClient.get<ApiResponse<PMBListResponse<PMBAdmissionTrack>>>(`${PMB_BASE}/tracks`, { params });
  return response.data;
}

export async function listPMBFacultiesApi(params?: ListPMBFacultiesParams): Promise<ApiResponse<PMBListResponse<PMBFaculty>>> {
  const response = await apiClient.get<ApiResponse<PMBListResponse<PMBFaculty>>>(`${PMB_BASE}/faculties`, { params });
  return response.data;
}

export async function listPMBStudyProgramsApi(params?: ListPMBProgramsParams): Promise<ApiResponse<PMBListResponse<PMBStudyProgram>>> {
  const response = await apiClient.get<ApiResponse<PMBListResponse<PMBStudyProgram>>>(`${PMB_BASE}/programs`, { params });
  return response.data;
}

export async function createPMBAdmissionTrackApi(payload: CreatePMBAdmissionTrackRequest): Promise<ApiResponse<PMBAdmissionTrack>> {
  const response = await apiClient.post<ApiResponse<PMBAdmissionTrack>>(`${PMB_BASE}/tracks`, payload);
  return response.data;
}

export async function updatePMBAdmissionTrackApi(id: string, payload: UpdatePMBAdmissionTrackRequest): Promise<ApiResponse<PMBAdmissionTrack>> {
  const response = await apiClient.patch<ApiResponse<PMBAdmissionTrack>>(`${PMB_BASE}/tracks/${id}`, payload);
  return response.data;
}

export async function deletePMBAdmissionTrackApi(id: string): Promise<void> {
  await apiClient.delete(`${PMB_BASE}/tracks/${id}`);
}

export async function createPMBFacultyApi(payload: CreatePMBFacultyRequest): Promise<ApiResponse<PMBFaculty>> {
  const response = await apiClient.post<ApiResponse<PMBFaculty>>(`${PMB_BASE}/faculties`, payload);
  return response.data;
}

export async function updatePMBFacultyApi(id: string, payload: UpdatePMBFacultyRequest): Promise<ApiResponse<PMBFaculty>> {
  const response = await apiClient.patch<ApiResponse<PMBFaculty>>(`${PMB_BASE}/faculties/${id}`, payload);
  return response.data;
}

export async function deletePMBFacultyApi(id: string): Promise<void> {
  await apiClient.delete(`${PMB_BASE}/faculties/${id}`);
}

export async function createPMBStudyProgramApi(payload: CreatePMBStudyProgramRequest): Promise<ApiResponse<PMBStudyProgram>> {
  const response = await apiClient.post<ApiResponse<PMBStudyProgram>>(`${PMB_BASE}/programs`, payload);
  return response.data;
}

export async function updatePMBStudyProgramApi(id: string, payload: UpdatePMBStudyProgramRequest): Promise<ApiResponse<PMBStudyProgram>> {
  const response = await apiClient.patch<ApiResponse<PMBStudyProgram>>(`${PMB_BASE}/programs/${id}`, payload);
  return response.data;
}

export async function deletePMBStudyProgramApi(id: string): Promise<void> {
  await apiClient.delete(`${PMB_BASE}/programs/${id}`);
}

export async function updatePMBApplicationStatusApi(id: string, payload: UpdatePMBApplicationStatusRequest): Promise<ApiResponse<PMBApplication>> {
  const response = await apiClient.patch<ApiResponse<PMBApplication>>(`${PMB_BASE}/applications/${id}/status`, payload);
  return response.data;
}

export async function updatePMBApplicationApi(id: string, payload: UpdatePMBApplicationRequest): Promise<ApiResponse<PMBApplication>> {
  const response = await apiClient.patch<ApiResponse<PMBApplication>>(`${PMB_BASE}/applications/${id}`, payload);
  return response.data;
}

export async function deletePMBApplicationApi(id: string): Promise<void> {
  await apiClient.delete(`${PMB_BASE}/applications/${id}`);
}

export async function updatePMBDocumentVerificationApi(id: string, payload: UpdatePMBDocumentVerificationRequest): Promise<ApiResponse<PMBApplicantDocument>> {
  const response = await apiClient.patch<ApiResponse<PMBApplicantDocument>>(`${PMB_BASE}/documents/${id}/verify`, payload);
  return response.data;
}

export async function createPMBEvaluationApi(payload: CreatePMBEvaluationRequest): Promise<ApiResponse<PMBEvaluation>> {
  const response = await apiClient.post<ApiResponse<PMBEvaluation>>(`${PMB_BASE}/evaluations`, payload);
  return response.data;
}

export async function updatePMBEvaluationApi(id: string, payload: UpdatePMBEvaluationRequest): Promise<ApiResponse<PMBEvaluation>> {
  const response = await apiClient.patch<ApiResponse<PMBEvaluation>>(`${PMB_BASE}/evaluations/${id}`, payload);
  return response.data;
}

export async function deletePMBEvaluationApi(id: string): Promise<void> {
  await apiClient.delete(`${PMB_BASE}/evaluations/${id}`);
}

export async function createPMBFinalResultApi(payload: CreatePMBFinalResultRequest): Promise<ApiResponse<PMBFinalResult>> {
  const response = await apiClient.post<ApiResponse<PMBFinalResult>>(`${PMB_BASE}/final-results`, payload);
  return response.data;
}

export async function updatePMBFinalResultApi(id: string, payload: UpdatePMBFinalResultRequest): Promise<ApiResponse<PMBFinalResult>> {
  const response = await apiClient.patch<ApiResponse<PMBFinalResult>>(`${PMB_BASE}/final-results/${id}`, payload);
  return response.data;
}

export async function createPMBReRegistrationApi(payload: CreatePMBReRegistrationRequest): Promise<ApiResponse<PMBReRegistration>> {
  const response = await apiClient.post<ApiResponse<PMBReRegistration>>(`/pmb/re-registration`, payload);
  return response.data;
}

export async function updatePMBPaymentStatusApi(id: string, payload: UpdatePMBPaymentStatusRequest): Promise<ApiResponse<PMBReRegistration>> {
  const response = await apiClient.patch<ApiResponse<PMBReRegistration>>(`${PMB_BASE}/re-registration/${id}/payment`, payload);
  return response.data;
}

export async function listPMBPendingPaymentsApi(academicYear: string): Promise<ApiResponse<PMBReRegistration[]>> {
  const response = await apiClient.get<ApiResponse<PMBReRegistration[]>>(`${PMB_BASE}/re-registration/pending`, {
    params: { academic_year: academicYear },
  });
  return response.data;
}

export async function createPMBApplicantApi(payload: CreatePMBApplicantRequest): Promise<ApiResponse<PMBApplicant>> {
  const response = await apiClient.post<ApiResponse<PMBApplicant>>(`${PMB_BASE}/applicants`, payload);
  return response.data;
}

export async function updatePMBApplicantApi(id: string, payload: UpdatePMBApplicantRequest): Promise<ApiResponse<PMBApplicant>> {
  const response = await apiClient.patch<ApiResponse<PMBApplicant>>(`${PMB_BASE}/applicants/${id}`, payload);
  return response.data;
}

export async function deletePMBApplicantApi(id: string): Promise<void> {
  await apiClient.delete(`${PMB_BASE}/applicants/${id}`);
}
