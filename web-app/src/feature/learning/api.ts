import { apiClient } from '@utility/api';
import type { ApiResponse } from '@utility/response';
import type {
  Assignment,
  AssignmentSubmission,
  AssignmentSubmissionListResponse,
  CertificateVerificationResponse,
  CreateAssignmentRequest,
  CreateCourseRequest,
  CreateLessonRequest,
  CreateQuizRequest,
  CreateSectionRequest,
  LearningAnalyticsOverview,
  UploadedLearningAsset,
  LearningCertificate,
  LearningCertificateListResponse,
  LearningCourse,
  LearningCourseAnalyticsListResponse,
  LearningCourseListResponse,
  LearningEnrollment,
  LearningEnrollmentListResponse,
  LearningListParams,
  LessonQuiz,
  QuizAttemptResponse,
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

const ADMIN_LEARNING_BASE = '/admin/learning';

export async function listPublicCoursesApi(params?: LearningListParams): Promise<ApiResponse<LearningCourseListResponse>> {
  const response = await apiClient.get<ApiResponse<LearningCourseListResponse>>('/learning/courses', { params });
  return response.data;
}

export async function getPublicCourseBySlugApi(slug: string): Promise<ApiResponse<LearningCourse>> {
  const response = await apiClient.get<ApiResponse<LearningCourse>>(`/learning/courses/slug/${encodeURIComponent(slug)}`);
  return response.data;
}

export async function verifyCertificateApi(certificateNumber: string): Promise<ApiResponse<CertificateVerificationResponse>> {
  const response = await apiClient.get<ApiResponse<CertificateVerificationResponse>>(
    `/learning/certificates/verify/${encodeURIComponent(certificateNumber)}`,
  );
  return response.data;
}

export async function listMyEnrollmentsApi(params?: LearningListParams): Promise<ApiResponse<LearningEnrollmentListResponse>> {
  const response = await apiClient.get<ApiResponse<LearningEnrollmentListResponse>>('/learning/enrollments/me', { params });
  return response.data;
}

export async function enrollCourseApi(courseId: string): Promise<ApiResponse<LearningEnrollment>> {
  const response = await apiClient.post<ApiResponse<LearningEnrollment>>('/learning/enrollments', { course_id: courseId });
  return response.data;
}

export async function updateLessonProgressApi(
  lessonId: string,
  payload: UpdateLessonProgressRequest,
): Promise<ApiResponse<LearningEnrollment>> {
  const response = await apiClient.patch<ApiResponse<LearningEnrollment>>(`/learning/lessons/${lessonId}/progress`, payload);
  return response.data;
}

export async function submitQuizAttemptApi(payload: SubmitQuizAttemptRequest): Promise<ApiResponse<QuizAttemptResponse>> {
  const response = await apiClient.post<ApiResponse<QuizAttemptResponse>>('/learning/quiz-attempts', payload);
  return response.data;
}

export async function submitAssignmentApi(payload: SubmitAssignmentRequest): Promise<ApiResponse<AssignmentSubmission>> {
  const response = await apiClient.post<ApiResponse<AssignmentSubmission>>('/learning/assignment-submissions', payload);
  return response.data;
}

export async function listMyAssignmentSubmissionsApi(
  params?: LearningListParams,
): Promise<ApiResponse<AssignmentSubmissionListResponse>> {
  const response = await apiClient.get<ApiResponse<AssignmentSubmissionListResponse>>('/learning/assignment-submissions/me', {
    params,
  });
  return response.data;
}

export async function listMyCertificatesApi(params?: LearningListParams): Promise<ApiResponse<LearningCertificateListResponse>> {
  const response = await apiClient.get<ApiResponse<LearningCertificateListResponse>>('/learning/certificates/me', { params });
  return response.data;
}

export async function listAdminCoursesApi(params?: LearningListParams): Promise<ApiResponse<LearningCourseListResponse>> {
  const response = await apiClient.get<ApiResponse<LearningCourseListResponse>>(`${ADMIN_LEARNING_BASE}/courses`, { params });
  return response.data;
}

export async function getAdminCourseApi(id: string): Promise<ApiResponse<LearningCourse>> {
  const response = await apiClient.get<ApiResponse<LearningCourse>>(`${ADMIN_LEARNING_BASE}/courses/${id}`);
  return response.data;
}

export async function createCourseApi(payload: CreateCourseRequest): Promise<ApiResponse<LearningCourse>> {
  const response = await apiClient.post<ApiResponse<LearningCourse>>(`${ADMIN_LEARNING_BASE}/courses`, payload);
  return response.data;
}

export async function updateCourseApi(id: string, payload: UpdateCourseRequest): Promise<ApiResponse<LearningCourse>> {
  const response = await apiClient.patch<ApiResponse<LearningCourse>>(`${ADMIN_LEARNING_BASE}/courses/${id}`, payload);
  return response.data;
}

export async function deleteCourseApi(id: string): Promise<void> {
  await apiClient.delete(`${ADMIN_LEARNING_BASE}/courses/${id}`);
}

async function uploadLearningAssetApi(
  endpoint: '/admin/uploads/files' | '/admin/uploads/videos',
  file: File,
): Promise<ApiResponse<UploadedLearningAsset>> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<ApiResponse<UploadedLearningAsset>>(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
}

export async function uploadLearningFileApi(file: File): Promise<ApiResponse<UploadedLearningAsset>> {
  return uploadLearningAssetApi('/admin/uploads/files', file);
}

export async function uploadLearningVideoApi(file: File): Promise<ApiResponse<UploadedLearningAsset>> {
  return uploadLearningAssetApi('/admin/uploads/videos', file);
}

export async function createSectionApi(courseId: string, payload: CreateSectionRequest): Promise<ApiResponse<unknown>> {
  const response = await apiClient.post<ApiResponse<unknown>>(`${ADMIN_LEARNING_BASE}/courses/${courseId}/sections`, payload);
  return response.data;
}

export async function updateSectionApi(id: string, payload: UpdateSectionRequest): Promise<ApiResponse<unknown>> {
  const response = await apiClient.patch<ApiResponse<unknown>>(`${ADMIN_LEARNING_BASE}/sections/${id}`, payload);
  return response.data;
}

export async function deleteSectionApi(id: string): Promise<void> {
  await apiClient.delete(`${ADMIN_LEARNING_BASE}/sections/${id}`);
}

export async function createLessonApi(
  courseId: string,
  sectionId: string,
  payload: CreateLessonRequest,
): Promise<ApiResponse<unknown>> {
  const response = await apiClient.post<ApiResponse<unknown>>(
    `${ADMIN_LEARNING_BASE}/courses/${courseId}/sections/${sectionId}/lessons`,
    payload,
  );
  return response.data;
}

export async function updateLessonApi(id: string, payload: UpdateLessonRequest): Promise<ApiResponse<unknown>> {
  const response = await apiClient.patch<ApiResponse<unknown>>(`${ADMIN_LEARNING_BASE}/lessons/${id}`, payload);
  return response.data;
}

export async function deleteLessonApi(id: string): Promise<void> {
  await apiClient.delete(`${ADMIN_LEARNING_BASE}/lessons/${id}`);
}

export async function createQuizApi(lessonId: string, payload: CreateQuizRequest): Promise<ApiResponse<LessonQuiz>> {
  const response = await apiClient.post<ApiResponse<LessonQuiz>>(`${ADMIN_LEARNING_BASE}/lessons/${lessonId}/quiz`, payload);
  return response.data;
}

export async function getQuizApi(id: string): Promise<ApiResponse<LessonQuiz>> {
  const response = await apiClient.get<ApiResponse<LessonQuiz>>(`${ADMIN_LEARNING_BASE}/quizzes/${id}`);
  return response.data;
}

export async function updateQuizApi(id: string, payload: UpdateQuizRequest): Promise<ApiResponse<LessonQuiz>> {
  const response = await apiClient.patch<ApiResponse<LessonQuiz>>(`${ADMIN_LEARNING_BASE}/quizzes/${id}`, payload);
  return response.data;
}

export async function deleteQuizApi(id: string): Promise<void> {
  await apiClient.delete(`${ADMIN_LEARNING_BASE}/quizzes/${id}`);
}

export async function createAssignmentApi(lessonId: string, payload: CreateAssignmentRequest): Promise<ApiResponse<Assignment>> {
  const response = await apiClient.post<ApiResponse<Assignment>>(`${ADMIN_LEARNING_BASE}/lessons/${lessonId}/assignment`, payload);
  return response.data;
}

export async function getAssignmentApi(id: string): Promise<ApiResponse<Assignment>> {
  const response = await apiClient.get<ApiResponse<Assignment>>(`${ADMIN_LEARNING_BASE}/assignments/${id}`);
  return response.data;
}

export async function updateAssignmentApi(id: string, payload: UpdateAssignmentRequest): Promise<ApiResponse<Assignment>> {
  const response = await apiClient.patch<ApiResponse<Assignment>>(`${ADMIN_LEARNING_BASE}/assignments/${id}`, payload);
  return response.data;
}

export async function deleteAssignmentApi(id: string): Promise<void> {
  await apiClient.delete(`${ADMIN_LEARNING_BASE}/assignments/${id}`);
}

export async function listAssignmentSubmissionsApi(
  assignmentId: string,
  params?: LearningListParams,
): Promise<ApiResponse<AssignmentSubmissionListResponse>> {
  const response = await apiClient.get<ApiResponse<AssignmentSubmissionListResponse>>(
    `${ADMIN_LEARNING_BASE}/assignments/${assignmentId}/submissions`,
    { params },
  );
  return response.data;
}

export async function reviewAssignmentSubmissionApi(
  id: string,
  payload: ReviewAssignmentSubmissionRequest,
): Promise<ApiResponse<AssignmentSubmission>> {
  const response = await apiClient.patch<ApiResponse<AssignmentSubmission>>(
    `${ADMIN_LEARNING_BASE}/assignment-submissions/${id}/review`,
    payload,
  );
  return response.data;
}

export async function listCertificatesApi(params?: LearningListParams): Promise<ApiResponse<LearningCertificateListResponse>> {
  const response = await apiClient.get<ApiResponse<LearningCertificateListResponse>>(`${ADMIN_LEARNING_BASE}/certificates`, {
    params,
  });
  return response.data;
}

export async function getLearningAnalyticsOverviewApi(): Promise<ApiResponse<LearningAnalyticsOverview>> {
  const response = await apiClient.get<ApiResponse<LearningAnalyticsOverview>>(`${ADMIN_LEARNING_BASE}/analytics/overview`);
  return response.data;
}

export async function listCourseAnalyticsApi(
  params?: LearningListParams,
): Promise<ApiResponse<LearningCourseAnalyticsListResponse>> {
  const response = await apiClient.get<ApiResponse<LearningCourseAnalyticsListResponse>>(
    `${ADMIN_LEARNING_BASE}/analytics/courses`,
    { params },
  );
  return response.data;
}
