import { type JSONContent } from '@tiptap/core';
import { z } from 'zod';

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type CourseStatus = 'draft' | 'published' | 'archived';
export type LessonType = 'video' | 'article' | 'embed' | 'file' | 'quiz' | 'assignment';
export type EnrollmentStatus = 'active' | 'completed' | 'dropped';
export type QuizQuestionType = 'single_choice' | 'multiple_choice' | 'short_answer';
export type QuizAttemptStatus = 'in_progress' | 'submitted' | 'graded';
export type CertificateStatus = 'issued' | 'revoked';
export type AssignmentSubmissionStatus = 'submitted' | 'approved' | 'rejected';
export type ProgramType = 'networking' | 'devsecops' | 'programming';

export interface LessonSummary {
  id: string;
  course_id: string;
  section_id: string;
  slug: string;
  title: string;
  summary: string;
  content_json: JSONContent;
  video_url: string;
  attachment_url: string;
  lesson_type: LessonType;
  duration_minutes: number;
  sort_order: number;
  is_preview: boolean;
  is_published: boolean;
  prerequisite_lesson_ids: string[];
  quiz_id: string;
  assignment_id: string;
  created_at: string;
  updated_at: string;
}

export interface CourseSection {
  id: string;
  course_id: string;
  title: string;
  description: string;
  sort_order: number;
  lessons: LessonSummary[];
  created_at: string;
  updated_at: string;
}

export interface LearningCourse {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  thumbnail_url: string;
  program: string;
  level: CourseLevel;
  status: CourseStatus;
  estimated_minutes: number;
  is_featured: boolean;
  published_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  sections: CourseSection[];
  created_at: string;
  updated_at: string;
}

export interface LearningCourseListResponse {
  data: LearningCourse[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface LearningEnrollment {
  id: string;
  course_id: string;
  course_title: string;
  course_slug: string;
  user_id: string;
  user_full_name: string;
  user_email: string;
  status: EnrollmentStatus;
  enrolled_at: string;
  completed_at?: string | null;
  last_accessed_at?: string | null;
  progress_percent: number;
  created_at: string;
  updated_at: string;
}

export interface LearningEnrollmentListResponse {
  data: LearningEnrollment[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface QuizOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  sort_order: number;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: QuizQuestionType;
  explanation: string;
  points: number;
  sort_order: number;
  options: QuizOption[];
}

export interface LessonQuiz {
  id: string;
  lesson_id: string;
  title: string;
  description: string;
  pass_score: number;
  time_limit_minutes?: number | null;
  max_attempts?: number | null;
  is_active: boolean;
  questions: QuizQuestion[];
  created_at: string;
  updated_at: string;
}

export interface QuizAttemptAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  selected_option_ids: string[];
  answer_text: string;
  is_correct?: boolean | null;
  awarded_points?: number | null;
}

export interface QuizAttemptResponse {
  id: string;
  quiz_id: string;
  user_id: string;
  status: QuizAttemptStatus;
  score?: number | null;
  passed?: boolean | null;
  started_at: string;
  submitted_at?: string | null;
  graded_at?: string | null;
  answers: QuizAttemptAnswer[];
}

export interface LearningCertificate {
  id: string;
  course_id: string;
  course_title: string;
  course_slug: string;
  user_id: string;
  user_full_name: string;
  user_email: string;
  certificate_number: string;
  status: CertificateStatus;
  issued_at: string;
  revoked_at?: string | null;
  template_name: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface LearningCertificateListResponse {
  data: LearningCertificate[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface CertificateVerificationResponse {
  verified: boolean;
  certificate: LearningCertificate;
}

export interface Assignment {
  id: string;
  lesson_id: string;
  title: string;
  instructions: string;
  due_at?: string | null;
  max_score?: number | null;
  allow_text_submission: boolean;
  allow_link_submission: boolean;
  allow_file_submission: boolean;
  is_active: boolean;
  is_auto_approve: boolean;
  created_at: string;
  updated_at: string;
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  user_id: string;
  user_full_name: string;
  user_email: string;
  submission_text: string;
  submission_url: string;
  attachment_url: string;
  status: AssignmentSubmissionStatus;
  submitted_at: string;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  reviewed_by_name: string;
  score?: number | null;
  feedback: string;
  created_at: string;
  updated_at: string;
}

export interface AssignmentSubmissionListResponse {
  data: AssignmentSubmission[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface LearningAnalyticsOverview {
  total_courses: number;
  published_courses: number;
  total_enrollments: number;
  completed_enrollments: number;
  completion_rate: number;
  total_certificates_issued: number;
  total_quiz_attempts: number;
  total_assignment_submissions: number;
}

export interface LearningCourseAnalytics {
  course_id: string;
  course_title: string;
  course_slug: string;
  status: CourseStatus;
  enrollments: number;
  completed_enrollments: number;
  completion_rate: number;
  certificates_issued: number;
  quiz_attempts: number;
  average_quiz_score: number;
  assignment_submissions: number;
}

export interface LearningCourseAnalyticsListResponse {
  data: LearningCourseAnalytics[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface LearningListParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  level?: CourseLevel;
  program?: ProgramType;
  sort?: string;
}

export interface UploadedLearningAsset {
  file_path: string;
  file_url: string;
}

export interface CreateCourseRequest {
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  thumbnail_url?: string;
  program?: ProgramType;
  level: CourseLevel;
  status?: CourseStatus;
  estimated_minutes: number;
  is_featured: boolean;
}

export type UpdateCourseRequest = Partial<CreateCourseRequest>;

export interface CreateSectionRequest {
  title: string;
  description?: string;
  sort_order: number;
}

export type UpdateSectionRequest = Partial<CreateSectionRequest>;

export interface CreateLessonRequest {
  slug: string;
  title: string;
  summary?: string;
  content_json?: JSONContent;
  video_url?: string;
  attachment_url?: string;
  lesson_type: LessonType;
  duration_minutes: number;
  sort_order: number;
  is_preview: boolean;
  is_published: boolean;
  prerequisite_lesson_ids?: string[];
}

export type UpdateLessonRequest = Partial<CreateLessonRequest>;

export interface CreateQuizOptionRequest {
  option_text: string;
  is_correct: boolean;
  sort_order: number;
}

export interface CreateQuizQuestionRequest {
  question_text: string;
  question_type: QuizQuestionType;
  explanation?: string;
  points: number;
  sort_order: number;
  options: CreateQuizOptionRequest[];
}

export interface CreateQuizRequest {
  title: string;
  description?: string;
  pass_score: number;
  time_limit_minutes?: number;
  max_attempts?: number;
  is_active: boolean;
  questions: CreateQuizQuestionRequest[];
}

export type UpdateQuizRequest = Partial<CreateQuizRequest>;

export interface SubmitQuizAttemptRequest {
  quiz_id: string;
  answers: Array<{
    question_id: string;
    selected_option_ids?: string[];
    answer_text?: string;
  }>;
}

export interface UpdateLessonProgressRequest {
  last_position_seconds: number;
  time_spent_seconds: number;
  is_completed: boolean;
}

export interface CreateAssignmentRequest {
  title: string;
  instructions?: string;
  due_at?: string;
  max_score?: number;
  allow_text_submission: boolean;
  allow_link_submission: boolean;
  allow_file_submission: boolean;
  is_active: boolean;
  is_auto_approve: boolean;
}

export type UpdateAssignmentRequest = Partial<CreateAssignmentRequest>;

export interface SubmitAssignmentRequest {
  assignment_id: string;
  submission_text?: string;
  submission_url?: string;
  attachment_url?: string;
}

export interface ReviewAssignmentSubmissionRequest {
  status: Extract<AssignmentSubmissionStatus, 'approved' | 'rejected'>;
  score?: number;
  feedback?: string;
}

export const courseFormSchema = z.object({
  slug: z.string().min(3, 'Slug must be at least 3 characters'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  thumbnail_url: z.string().url('Thumbnail must be a valid URL').optional().or(z.literal('')),
  program: z.enum(['networking', 'devsecops', 'programming']).optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  estimated_minutes: z.coerce.number().min(0),
  is_featured: z.boolean().default(false),
});

export type CourseFormData = z.infer<typeof courseFormSchema>;

export const sectionFormSchema = z.object({
  title: z.string().min(2, 'Section title is required'),
  description: z.string().optional(),
  sort_order: z.coerce.number().min(0),
});

export type SectionFormData = z.infer<typeof sectionFormSchema>;

export const lessonFormSchema = z.object({
  slug: z.string().min(3, 'Lesson slug is required'),
  title: z.string().min(2, 'Lesson title is required'),
  summary: z.string().optional(),
  content_json: z.custom<JSONContent>((value) => typeof value === 'object' && value !== null, {
    message: 'Lesson content is required',
  }),
  video_url: z.string().optional().or(z.literal('')),
  attachment_url: z.string().optional().or(z.literal('')),
  lesson_type: z.enum(['video', 'article', 'embed', 'file', 'quiz', 'assignment']),
  duration_minutes: z.coerce.number().min(0),
  sort_order: z.coerce.number().min(0),
  is_preview: z.boolean().default(false),
  is_published: z.boolean().default(false),
  prerequisite_lesson_ids_text: z.string().default(''),
});

export type LessonFormData = z.infer<typeof lessonFormSchema>;

export const quizOptionSchema = z.object({
  option_text: z.string().min(1, 'Option text is required'),
  is_correct: z.boolean().default(false),
  sort_order: z.coerce.number().min(0),
});

export const quizQuestionSchema = z.object({
  question_text: z.string().min(1, 'Question is required'),
  question_type: z.enum(['single_choice', 'multiple_choice', 'short_answer']),
  explanation: z.string().optional(),
  points: z.coerce.number().min(1),
  sort_order: z.coerce.number().min(0),
  options: z.array(quizOptionSchema),
});

export const quizFormSchema = z.object({
  title: z.string().min(2, 'Quiz title is required'),
  description: z.string().optional(),
  pass_score: z.coerce.number().min(0).max(100),
  time_limit_minutes: z.coerce.number().min(1).optional(),
  max_attempts: z.coerce.number().min(1).optional(),
  is_active: z.boolean().default(true),
  questions: z.array(quizQuestionSchema).min(1, 'At least one question is required'),
});

export type QuizFormData = z.infer<typeof quizFormSchema>;

export const assignmentFormSchema = z.object({
  title: z.string().min(2, 'Assignment title is required'),
  instructions: z.string().optional(),
  due_at: z.string().optional(),
  max_score: z.coerce.number().min(0).optional(),
  allow_text_submission: z.boolean().default(true),
  allow_link_submission: z.boolean().default(false),
  allow_file_submission: z.boolean().default(false),
  is_active: z.boolean().default(true),
  is_auto_approve: z.boolean().default(false),
});

export type AssignmentFormData = z.infer<typeof assignmentFormSchema>;

export const assignmentSubmissionSchema = z.object({
  submission_text: z.string().optional(),
  submission_url: z.string().url('Submission link must be valid').optional().or(z.literal('')),
  attachment_url: z.string().optional().or(z.literal('')),
});

export type AssignmentSubmissionFormData = z.infer<typeof assignmentSubmissionSchema>;

export const emptyRichTextDocument: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text: '' }],
    },
  ],
};

export function normalizeRichTextContent(value?: JSONContent | Record<string, unknown> | null) {
  if (!value || typeof value !== 'object') {
    return emptyRichTextDocument;
  }

  if ('type' in value && value.type === 'doc') {
    return value as JSONContent;
  }

  return emptyRichTextDocument;
}

export function parsePrerequisiteIds(value?: string) {
  return value
    ?.split(',')
    .map((item) => item.trim())
    .filter(Boolean) ?? [];
}
