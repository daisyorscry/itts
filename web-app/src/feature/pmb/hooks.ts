import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../utility/response';
import {
  createPMBAdmissionTrackApi,
  createPMBApplicantApi,
  createPMBApplicationApi,
  createMyPMBApplicantApi,
  createPMBEvaluationApi,
  createPMBFacultyApi,
  createPMBFinalResultApi,
  createPMBReRegistrationApi,
  createPMBStudyProgramApi,
  deletePMBAdmissionTrackApi,
  deletePMBApplicantApi,
  deletePMBApplicationApi,
  deletePMBEvaluationApi,
  deletePMBFacultyApi,
  deletePMBStudyProgramApi,
  getPMBApplicationStatsApi,
  getPMBAverageScoreApi,
  getPMBApplicationDetailsApi,
  getPMBProgramStatsApi,
  getMyPMBApplicantApi,
  getPublicPMBProgramApi,
  getPublicPMBQuotaApi,
  listPMBAdmissionTracksApi,
  listPMBApplicantsApi,
  listPMBApplicationsApi,
  listPMBDocumentsApi,
  listPMBFacultiesApi,
  listPMBPendingPaymentsApi,
  listPMBStudyProgramsApi,
  listPublicPMBActiveTracksApi,
  listPublicPMBFacultiesApi,
  listPublicPMBPassedApplicantsApi,
  listPublicPMBProgramsByFacultyApi,
  updateMyPMBApplicantApi,
  updatePMBAdmissionTrackApi,
  updatePMBApplicantApi,
  updatePMBApplicationApi,
  updatePMBApplicationStatusApi,
  updatePMBDocumentVerificationApi,
  updatePMBEvaluationApi,
  updatePMBFacultyApi,
  updatePMBFinalResultApi,
  updatePMBPaymentStatusApi,
  updatePMBStudyProgramApi,
} from './api';
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
  ListPublicPMBPassedApplicantsParams,
  ListPMBProgramsParams,
  ListPMBTracksParams,
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
  PublicPMBApplicantFormRequest,
} from './types';

export const pmbKeys = {
  all: ['pmb'] as const,
  applicants: () => [...pmbKeys.all, 'applicants'] as const,
  myApplicant: () => [...pmbKeys.all, 'my-applicant'] as const,
  applicantList: (params?: ListPMBApplicantsParams) => [...pmbKeys.applicants(), params] as const,
  applications: () => [...pmbKeys.all, 'applications'] as const,
  applicationList: (params?: ListPMBApplicationsParams) => [...pmbKeys.applications(), params] as const,
  applicationDetails: () => [...pmbKeys.all, 'application-detail'] as const,
  applicationDetail: (id: string) => [...pmbKeys.applicationDetails(), id] as const,
  documents: () => [...pmbKeys.all, 'documents'] as const,
  documentList: (params?: ListPMBDocumentsParams) => [...pmbKeys.documents(), params] as const,
  pendingPayments: () => [...pmbKeys.all, 'pending-payments'] as const,
  pendingPaymentsByAcademicYear: (academicYear: string) => [...pmbKeys.pendingPayments(), academicYear] as const,
  applicationStats: () => [...pmbKeys.all, 'application-stats'] as const,
  applicationStatsByAcademicYear: (academicYear: string) => [...pmbKeys.applicationStats(), academicYear] as const,
  averageScores: () => [...pmbKeys.all, 'average-scores'] as const,
  averageScoreByApplication: (applicationId: string) => [...pmbKeys.averageScores(), applicationId] as const,
  publicTracks: () => [...pmbKeys.all, 'public-tracks'] as const,
  publicFaculties: () => [...pmbKeys.all, 'public-faculties'] as const,
  publicFacultyList: (params?: ListPMBFacultiesParams) => [...pmbKeys.publicFaculties(), params] as const,
  publicPrograms: () => [...pmbKeys.all, 'public-programs'] as const,
  publicProgramsByFaculty: (facultyId: string) => [...pmbKeys.publicPrograms(), facultyId] as const,
  publicQuota: () => [...pmbKeys.all, 'public-quota'] as const,
  publicProgram: () => [...pmbKeys.all, 'public-program'] as const,
  publicProgramById: (programId: string) => [...pmbKeys.publicProgram(), programId] as const,
  publicQuotaByProgram: (programId: string, academicYear: string) => [...pmbKeys.publicQuota(), programId, academicYear] as const,
  publicPassedApplicants: () => [...pmbKeys.all, 'public-passed'] as const,
  publicPassedApplicantsList: (params: ListPublicPMBPassedApplicantsParams) => [...pmbKeys.publicPassedApplicants(), params] as const,
  programStats: () => [...pmbKeys.all, 'program-stats'] as const,
  programStatsById: (programId: string, academicYear: string) => [...pmbKeys.programStats(), programId, academicYear] as const,
  tracks: () => [...pmbKeys.all, 'tracks'] as const,
  trackList: (params?: ListPMBTracksParams) => [...pmbKeys.tracks(), params] as const,
  faculties: () => [...pmbKeys.all, 'faculties'] as const,
  facultyList: (params?: ListPMBFacultiesParams) => [...pmbKeys.faculties(), params] as const,
  programs: () => [...pmbKeys.all, 'programs'] as const,
  programList: (params?: ListPMBProgramsParams) => [...pmbKeys.programs(), params] as const,
};

export function useListPMBApplications(params?: ListPMBApplicationsParams) {
  return useQuery({
    queryKey: pmbKeys.applicationList(params),
    queryFn: async () => {
      const response = await listPMBApplicationsApi(params);
      return response.data;
    },
    staleTime: 30 * 1000,
  });
}

export function useListPMBApplicants(params?: ListPMBApplicantsParams) {
  return useQuery({
    queryKey: pmbKeys.applicantList(params),
    queryFn: async () => {
      const response = await listPMBApplicantsApi(params);
      return response.data;
    },
    staleTime: 30 * 1000,
  });
}

export function useMyPMBApplicant(enabled = true) {
  return useQuery({
    queryKey: pmbKeys.myApplicant(),
    queryFn: async () => {
      const response = await getMyPMBApplicantApi();
      return response.data;
    },
    enabled,
    retry: false,
    staleTime: 30 * 1000,
  });
}

export function useListPMBDocuments(params?: ListPMBDocumentsParams) {
  return useQuery({
    queryKey: pmbKeys.documentList(params),
    queryFn: async () => {
      const response = await listPMBDocumentsApi(params);
      return response.data;
    },
    staleTime: 30 * 1000,
  });
}

export function usePMBApplicationDetails(id: string, enabled = true) {
  return useQuery({
    queryKey: pmbKeys.applicationDetail(id),
    queryFn: async () => {
      const response = await getPMBApplicationDetailsApi(id);
      return response.data;
    },
    enabled: enabled && !!id,
    staleTime: 30 * 1000,
  });
}

export function usePMBApplicationStats(academicYear: string, enabled = true) {
  return useQuery({
    queryKey: pmbKeys.applicationStatsByAcademicYear(academicYear),
    queryFn: async () => {
      const response = await getPMBApplicationStatsApi(academicYear);
      return response.data;
    },
    enabled: enabled && !!academicYear,
    staleTime: 30 * 1000,
  });
}

export function usePMBAverageScore(applicationId: string, enabled = true) {
  return useQuery({
    queryKey: pmbKeys.averageScoreByApplication(applicationId),
    queryFn: async () => {
      const response = await getPMBAverageScoreApi(applicationId);
      return response.data;
    },
    enabled: enabled && !!applicationId,
    staleTime: 30 * 1000,
  });
}

export function usePMBProgramStats(programId: string, academicYear: string, enabled = true) {
  return useQuery({
    queryKey: pmbKeys.programStatsById(programId, academicYear),
    queryFn: async () => {
      const response = await getPMBProgramStatsApi(programId, academicYear);
      return response.data;
    },
    enabled: enabled && !!programId && !!academicYear,
    staleTime: 30 * 1000,
  });
}

export function useListPMBPendingPayments(academicYear: string, enabled = true) {
  return useQuery({
    queryKey: pmbKeys.pendingPaymentsByAcademicYear(academicYear),
    queryFn: async () => {
      const response = await listPMBPendingPaymentsApi(academicYear);
      return response.data;
    },
    enabled: enabled && !!academicYear,
    staleTime: 30 * 1000,
  });
}

export function useListPMBAdmissionTracks(params?: ListPMBTracksParams) {
  return useQuery({
    queryKey: pmbKeys.trackList(params),
    queryFn: async () => {
      const response = await listPMBAdmissionTracksApi(params);
      return response.data;
    },
    staleTime: 30 * 1000,
  });
}

export function useListPMBFaculties(params?: ListPMBFacultiesParams) {
  return useQuery({
    queryKey: pmbKeys.facultyList(params),
    queryFn: async () => {
      const response = await listPMBFacultiesApi(params);
      return response.data;
    },
    staleTime: 30 * 1000,
  });
}

export function useListPMBStudyPrograms(params?: ListPMBProgramsParams) {
  return useQuery({
    queryKey: pmbKeys.programList(params),
    queryFn: async () => {
      const response = await listPMBStudyProgramsApi(params);
      return response.data;
    },
    staleTime: 30 * 1000,
  });
}

export function useListPublicPMBActiveTracks() {
  return useQuery({
    queryKey: pmbKeys.publicTracks(),
    queryFn: async () => {
      const response = await listPublicPMBActiveTracksApi();
      return response.data;
    },
    staleTime: 30 * 1000,
  });
}

export function useListPublicPMBFaculties(params?: ListPMBFacultiesParams) {
  return useQuery({
    queryKey: pmbKeys.publicFacultyList(params),
    queryFn: async () => {
      const response = await listPublicPMBFacultiesApi(params);
      return response.data;
    },
    staleTime: 30 * 1000,
  });
}

export function useListPublicPMBProgramsByFaculty(facultyId: string, enabled = true) {
  return useQuery({
    queryKey: pmbKeys.publicProgramsByFaculty(facultyId),
    queryFn: async () => {
      const response = await listPublicPMBProgramsByFacultyApi(facultyId);
      return response.data;
    },
    enabled: enabled && !!facultyId,
    staleTime: 30 * 1000,
  });
}

export function usePublicPMBProgram(programId: string, enabled = true) {
  return useQuery({
    queryKey: pmbKeys.publicProgramById(programId),
    queryFn: async () => {
      const response = await getPublicPMBProgramApi(programId);
      return response.data;
    },
    enabled: enabled && !!programId,
    staleTime: 30 * 1000,
  });
}

export function usePublicPMBQuota(programId: string, academicYear: string, enabled = true) {
  return useQuery({
    queryKey: pmbKeys.publicQuotaByProgram(programId, academicYear),
    queryFn: async () => {
      const response = await getPublicPMBQuotaApi(programId, academicYear);
      return response.data;
    },
    enabled: enabled && !!programId && !!academicYear,
    staleTime: 30 * 1000,
  });
}

export function useListPublicPMBPassedApplicants(params: ListPublicPMBPassedApplicantsParams, enabled = true) {
  return useQuery({
    queryKey: pmbKeys.publicPassedApplicantsList(params),
    queryFn: async () => {
      const response = await listPublicPMBPassedApplicantsApi(params);
      return response.data;
    },
    enabled: enabled && !!params.academic_year,
    staleTime: 30 * 1000,
  });
}

export function useCreatePMBAdmissionTrack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePMBAdmissionTrackRequest) => createPMBAdmissionTrackApi(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: pmbKeys.tracks() });
      toast.success(`Track "${response.data.track_name}" created`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useCreateMyPMBApplicant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PublicPMBApplicantFormRequest) => createMyPMBApplicantApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pmbKeys.myApplicant() });
      toast.success('Applicant profile created');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateMyPMBApplicant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<PublicPMBApplicantFormRequest>) => updateMyPMBApplicantApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pmbKeys.myApplicant() });
      toast.success('Applicant profile updated');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useCreatePMBApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePMBApplicationRequest) => createPMBApplicationApi(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: pmbKeys.applications() });
      queryClient.invalidateQueries({ queryKey: pmbKeys.myApplicant() });
      toast.success(`Application "${response.data.application_number}" created`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdatePMBApplication(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdatePMBApplicationRequest) => updatePMBApplicationApi(id, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: pmbKeys.applications() });
      queryClient.invalidateQueries({ queryKey: pmbKeys.applicationDetail(id) });
      toast.success(`Application "${response.data.application_number}" updated`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdatePMBDocumentVerification(applicationId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePMBDocumentVerificationRequest }) =>
      updatePMBDocumentVerificationApi(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pmbKeys.documents() });
      if (applicationId) {
        queryClient.invalidateQueries({ queryKey: pmbKeys.applicationDetail(applicationId) });
      }
      toast.success('Document verification updated');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useCreatePMBEvaluation(applicationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePMBEvaluationRequest) => createPMBEvaluationApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pmbKeys.applicationDetail(applicationId) });
      toast.success('Evaluation created');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdatePMBEvaluation(id: string, applicationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdatePMBEvaluationRequest) => updatePMBEvaluationApi(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pmbKeys.applicationDetail(applicationId) });
      toast.success('Evaluation updated');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeletePMBEvaluation(applicationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePMBEvaluationApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pmbKeys.applicationDetail(applicationId) });
      toast.success('Evaluation deleted');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useCreatePMBFinalResult(applicationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePMBFinalResultRequest) => createPMBFinalResultApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pmbKeys.applicationDetail(applicationId) });
      toast.success('Final result created');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdatePMBFinalResult(id: string, applicationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdatePMBFinalResultRequest) => updatePMBFinalResultApi(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pmbKeys.applicationDetail(applicationId) });
      toast.success('Final result updated');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useCreatePMBReRegistration(applicationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePMBReRegistrationRequest) => createPMBReRegistrationApi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pmbKeys.applicationDetail(applicationId) });
      queryClient.invalidateQueries({ queryKey: pmbKeys.pendingPayments() });
      toast.success('Re-registration created');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdatePMBPaymentStatus(id: string, applicationId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdatePMBPaymentStatusRequest) => updatePMBPaymentStatusApi(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pmbKeys.applicationDetail(applicationId) });
      queryClient.invalidateQueries({ queryKey: pmbKeys.pendingPayments() });
      toast.success('Payment status updated');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdatePMBAdmissionTrack(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdatePMBAdmissionTrackRequest) => updatePMBAdmissionTrackApi(id, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: pmbKeys.tracks() });
      toast.success(`Track "${response.data.track_name}" updated`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeletePMBAdmissionTrack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePMBAdmissionTrackApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pmbKeys.tracks() });
      toast.success('Track deleted');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useCreatePMBFaculty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePMBFacultyRequest) => createPMBFacultyApi(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: pmbKeys.faculties() });
      queryClient.invalidateQueries({ queryKey: pmbKeys.programs() });
      toast.success(`Faculty "${response.data.name}" created`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdatePMBFaculty(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdatePMBFacultyRequest) => updatePMBFacultyApi(id, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: pmbKeys.faculties() });
      queryClient.invalidateQueries({ queryKey: pmbKeys.programs() });
      toast.success(`Faculty "${response.data.name}" updated`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeletePMBFaculty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePMBFacultyApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pmbKeys.faculties() });
      queryClient.invalidateQueries({ queryKey: pmbKeys.programs() });
      toast.success('Faculty deleted');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useCreatePMBStudyProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePMBStudyProgramRequest) => createPMBStudyProgramApi(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: pmbKeys.programs() });
      toast.success(`Program "${response.data.name}" created`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdatePMBStudyProgram(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdatePMBStudyProgramRequest) => updatePMBStudyProgramApi(id, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: pmbKeys.programs() });
      toast.success(`Program "${response.data.name}" updated`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeletePMBStudyProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePMBStudyProgramApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pmbKeys.programs() });
      toast.success('Program deleted');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdatePMBApplicationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePMBApplicationStatusRequest }) => updatePMBApplicationStatusApi(id, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: pmbKeys.applications() });
      queryClient.invalidateQueries({ queryKey: pmbKeys.applicationDetail(response.data.id) });
      toast.success(`Application "${response.data.application_number}" updated`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeletePMBApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePMBApplicationApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pmbKeys.applications() });
      toast.success('Application deleted');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useCreatePMBApplicant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePMBApplicantRequest) => createPMBApplicantApi(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: pmbKeys.applicants() });
      toast.success(`Applicant "${response.data.full_name}" created`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdatePMBApplicant(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdatePMBApplicantRequest) => updatePMBApplicantApi(id, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: pmbKeys.applicants() });
      queryClient.invalidateQueries({ queryKey: pmbKeys.applications() });
      queryClient.invalidateQueries({ queryKey: pmbKeys.applicationDetails() });
      toast.success(`Applicant "${response.data.full_name}" updated`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeletePMBApplicant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePMBApplicantApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pmbKeys.applicants() });
      queryClient.invalidateQueries({ queryKey: pmbKeys.applications() });
      toast.success('Applicant deleted');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
