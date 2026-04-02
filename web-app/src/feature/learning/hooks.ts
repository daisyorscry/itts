import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@utility/response';
import {
  createAssignmentApi,
  createCourseApi,
  createLessonApi,
  createQuizApi,
  createSectionApi,
  deleteAssignmentApi,
  deleteCourseApi,
  deleteLessonApi,
  deleteQuizApi,
  deleteSectionApi,
  enrollCourseApi,
  getAdminCourseApi,
  getAssignmentApi,
  getPublicCourseBySlugApi,
  getLearningAnalyticsOverviewApi,
  getQuizApi,
  listAdminCoursesApi,
  listAssignmentSubmissionsApi,
  listCertificatesApi,
  listCourseAnalyticsApi,
  listMyAssignmentSubmissionsApi,
  listMyCertificatesApi,
  listMyEnrollmentsApi,
  listPublicCoursesApi,
  reviewAssignmentSubmissionApi,
  submitAssignmentApi,
  submitQuizAttemptApi,
  uploadLearningFileApi,
  uploadLearningVideoApi,
  updateAssignmentApi,
  updateCourseApi,
  updateLessonApi,
  updateLessonProgressApi,
  updateQuizApi,
  updateSectionApi,
  verifyCertificateApi,
} from './api';
import type {
  CreateAssignmentRequest,
  CreateCourseRequest,
  CreateLessonRequest,
  CreateQuizRequest,
  CreateSectionRequest,
  LearningListParams,
  ReviewAssignmentSubmissionRequest,
  SubmitAssignmentRequest,
  SubmitQuizAttemptRequest,
  UpdateAssignmentRequest,
  UpdateCourseRequest,
  UpdateLessonProgressRequest,
  UpdateLessonRequest,
  UpdateQuizRequest,
  UpdateSectionRequest,
} from './types';

export const learningKeys = {
  all: ['learning'] as const,
  publicCourses: (params?: LearningListParams) => [...learningKeys.all, 'public-courses', params] as const,
  publicCourse: (slug: string) => [...learningKeys.all, 'public-course', slug] as const,
  verifyCertificate: (certificateNumber: string) => [...learningKeys.all, 'verify-certificate', certificateNumber] as const,
  myEnrollments: (params?: LearningListParams) => [...learningKeys.all, 'my-enrollments', params] as const,
  myCertificates: (params?: LearningListParams) => [...learningKeys.all, 'my-certificates', params] as const,
  myAssignmentSubmissions: (params?: LearningListParams) => [...learningKeys.all, 'my-assignment-submissions', params] as const,
  adminCourses: (params?: LearningListParams) => [...learningKeys.all, 'admin-courses', params] as const,
  adminCourse: (id: string) => [...learningKeys.all, 'admin-course', id] as const,
  quiz: (id: string) => [...learningKeys.all, 'quiz', id] as const,
  assignment: (id: string) => [...learningKeys.all, 'assignment', id] as const,
  assignmentSubmissions: (assignmentId: string, params?: LearningListParams) =>
    [...learningKeys.all, 'assignment-submissions', assignmentId, params] as const,
  certificates: (params?: LearningListParams) => [...learningKeys.all, 'certificates', params] as const,
  analyticsOverview: () => [...learningKeys.all, 'analytics-overview'] as const,
  analyticsCourses: (params?: LearningListParams) => [...learningKeys.all, 'analytics-courses', params] as const,
};

export function useListPublicCourses(params?: LearningListParams) {
  return useQuery({
    queryKey: learningKeys.publicCourses(params),
    queryFn: async () => {
      const response = await listPublicCoursesApi(params);
      return response.data;
    },
    staleTime: 30 * 1000,
  });
}

export function usePublicCourse(slug: string, enabled = true) {
  return useQuery({
    queryKey: learningKeys.publicCourse(slug),
    queryFn: async () => {
      const response = await getPublicCourseBySlugApi(slug);
      return response.data;
    },
    enabled: enabled && Boolean(slug),
    staleTime: 30 * 1000,
  });
}

export function useVerifyCertificate(certificateNumber: string, enabled = true) {
  return useQuery({
    queryKey: learningKeys.verifyCertificate(certificateNumber),
    queryFn: async () => {
      const response = await verifyCertificateApi(certificateNumber);
      return response.data;
    },
    enabled: enabled && Boolean(certificateNumber),
    retry: false,
  });
}

export function useMyEnrollments(params?: LearningListParams, enabled = true) {
  return useQuery({
    queryKey: learningKeys.myEnrollments(params),
    queryFn: async () => {
      const response = await listMyEnrollmentsApi(params);
      return response.data;
    },
    enabled,
    staleTime: 15 * 1000,
  });
}

export function useMyCertificates(params?: LearningListParams, enabled = true) {
  return useQuery({
    queryKey: learningKeys.myCertificates(params),
    queryFn: async () => {
      const response = await listMyCertificatesApi(params);
      return response.data;
    },
    enabled,
    staleTime: 15 * 1000,
  });
}

export function useMyAssignmentSubmissions(params?: LearningListParams, enabled = true) {
  return useQuery({
    queryKey: learningKeys.myAssignmentSubmissions(params),
    queryFn: async () => {
      const response = await listMyAssignmentSubmissionsApi(params);
      return response.data;
    },
    enabled,
    staleTime: 15 * 1000,
  });
}

export function useEnrollCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (courseId: string) => enrollCourseApi(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learningKeys.all });
      toast.success('You are enrolled in this course');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateLessonProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId, payload }: { lessonId: string; payload: UpdateLessonProgressRequest }) =>
      updateLessonProgressApi(lessonId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learningKeys.all });
      toast.success('Lesson progress updated');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useSubmitQuizAttempt() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubmitQuizAttemptRequest) => submitQuizAttemptApi(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: learningKeys.all });
      toast.success(response.data.passed ? 'Quiz passed' : 'Quiz submitted');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useSubmitAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SubmitAssignmentRequest) => submitAssignmentApi(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: learningKeys.all });
      toast.success(
        response.data.status === 'approved'
          ? 'Assignment approved automatically'
          : 'Assignment submitted for review',
      );
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useListAdminCourses(params?: LearningListParams, enabled = true) {
  return useQuery({
    queryKey: learningKeys.adminCourses(params),
    queryFn: async () => {
      const response = await listAdminCoursesApi(params);
      return response.data;
    },
    enabled,
    staleTime: 15 * 1000,
  });
}

export function useAdminCourse(id: string, enabled = true) {
  return useQuery({
    queryKey: learningKeys.adminCourse(id),
    queryFn: async () => {
      const response = await getAdminCourseApi(id);
      return response.data;
    },
    enabled: enabled && Boolean(id),
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCourseRequest) => createCourseApi(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: learningKeys.all });
      toast.success(`Course "${response.data.title}" created`);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUploadLearningFile() {
  return useMutation({
    mutationFn: (file: File) => uploadLearningFileApi(file),
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUploadLearningVideo() {
  return useMutation({
    mutationFn: (file: File) => uploadLearningVideoApi(file),
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCourseRequest }) => updateCourseApi(id, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: learningKeys.all });
      toast.success(`Course "${response.data.title}" updated`);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCourseApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learningKeys.all });
      toast.success('Course deleted');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCreateSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ courseId, payload }: { courseId: string; payload: CreateSectionRequest }) => createSectionApi(courseId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learningKeys.all });
      toast.success('Section created');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateSectionRequest; silent?: boolean }) => updateSectionApi(id, payload),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: learningKeys.all });
      if (!variables.silent) {
        toast.success('Section updated');
      }
    },
    onError: (error, variables) => {
      if (!variables.silent) {
        toast.error(getErrorMessage(error));
      }
    },
  });
}

export function useDeleteSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSectionApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learningKeys.all });
      toast.success('Section deleted');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCreateLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      courseId,
      sectionId,
      payload,
    }: {
      courseId: string;
      sectionId: string;
      payload: CreateLessonRequest;
    }) => createLessonApi(courseId, sectionId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learningKeys.all });
      toast.success('Lesson created');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateLessonRequest; silent?: boolean }) => updateLessonApi(id, payload),
    onSuccess: (_response, variables) => {
      queryClient.invalidateQueries({ queryKey: learningKeys.all });
      if (!variables.silent) {
        toast.success('Lesson updated');
      }
    },
    onError: (error, variables) => {
      if (!variables.silent) {
        toast.error(getErrorMessage(error));
      }
    },
  });
}

export function useDeleteLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteLessonApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learningKeys.all });
      toast.success('Lesson deleted');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useQuiz(id: string, enabled = true) {
  return useQuery({
    queryKey: learningKeys.quiz(id),
    queryFn: async () => {
      const response = await getQuizApi(id);
      return response.data;
    },
    enabled: enabled && Boolean(id),
  });
}

export function useCreateQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId, payload }: { lessonId: string; payload: CreateQuizRequest }) => createQuizApi(lessonId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learningKeys.all });
      toast.success('Quiz saved');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateQuizRequest }) => updateQuizApi(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learningKeys.all });
      toast.success('Quiz updated');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteQuiz() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteQuizApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learningKeys.all });
      toast.success('Quiz deleted');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useAssignment(id: string, enabled = true) {
  return useQuery({
    queryKey: learningKeys.assignment(id),
    queryFn: async () => {
      const response = await getAssignmentApi(id);
      return response.data;
    },
    enabled: enabled && Boolean(id),
  });
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ lessonId, payload }: { lessonId: string; payload: CreateAssignmentRequest }) =>
      createAssignmentApi(lessonId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learningKeys.all });
      toast.success('Assignment saved');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useUpdateAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAssignmentRequest }) => updateAssignmentApi(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learningKeys.all });
      toast.success('Assignment updated');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAssignmentApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learningKeys.all });
      toast.success('Assignment deleted');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useAssignmentSubmissions(assignmentId: string, params?: LearningListParams, enabled = true) {
  return useQuery({
    queryKey: learningKeys.assignmentSubmissions(assignmentId, params),
    queryFn: async () => {
      const response = await listAssignmentSubmissionsApi(assignmentId, params);
      return response.data;
    },
    enabled: enabled && Boolean(assignmentId),
  });
}

export function useReviewAssignmentSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ReviewAssignmentSubmissionRequest }) =>
      reviewAssignmentSubmissionApi(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: learningKeys.all });
      toast.success('Assignment submission reviewed');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCertificates(params?: LearningListParams, enabled = true) {
  return useQuery({
    queryKey: learningKeys.certificates(params),
    queryFn: async () => {
      const response = await listCertificatesApi(params);
      return response.data;
    },
    enabled,
  });
}

export function useLearningAnalyticsOverview(enabled = true) {
  return useQuery({
    queryKey: learningKeys.analyticsOverview(),
    queryFn: async () => {
      const response = await getLearningAnalyticsOverviewApi();
      return response.data;
    },
    enabled,
  });
}

export function useCourseAnalytics(params?: LearningListParams, enabled = true) {
  return useQuery({
    queryKey: learningKeys.analyticsCourses(params),
    queryFn: async () => {
      const response = await listCourseAnalyticsApi(params);
      return response.data;
    },
    enabled,
  });
}
