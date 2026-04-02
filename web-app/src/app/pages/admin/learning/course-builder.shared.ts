import type {
  AssignmentFormData,
  CourseSection,
  LessonFormData,
  LessonSummary,
  ProgramType,
  QuizFormData,
} from '@feature/learning/types';
import { emptyRichTextDocument } from '@feature/learning/types';

export const levelOptions = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
] as const;

export const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
] as const;

export const programOptions: Array<{ value: ProgramType; label: string }> = [
  { value: 'programming', label: 'Programming' },
  { value: 'networking', label: 'Networking' },
  { value: 'devsecops', label: 'DevSecOps' },
];

export const lessonTypeOptions = [
  { value: 'video', label: 'Video lesson' },
  { value: 'article', label: 'Article lesson' },
  { value: 'embed', label: 'Embed lesson' },
  { value: 'file', label: 'Attachment lesson' },
  { value: 'quiz', label: 'Quiz lesson' },
  { value: 'assignment', label: 'Assignment lesson' },
] as const;

export const questionTypeOptions = [
  { value: 'single_choice', label: 'Single choice' },
  { value: 'multiple_choice', label: 'Multiple choice' },
  { value: 'short_answer', label: 'Short answer' },
] as const;

export type WorkspaceTab = 'content' | 'assessment' | 'access';

export function buildDefaultSectionDraft(nextSortOrder = 0) {
  return {
    title: '',
    description: '',
    sort_order: nextSortOrder,
  };
}

export function buildDefaultLessonDraft(nextSortOrder = 0): LessonFormData {
  return {
    slug: '',
    title: '',
    summary: '',
    content_json: emptyRichTextDocument,
    video_url: '',
    attachment_url: '',
    lesson_type: 'article',
    duration_minutes: 0,
    sort_order: nextSortOrder,
    is_preview: false,
    is_published: false,
    prerequisite_lesson_ids_text: '',
  };
}

export function buildDefaultQuizDraft(): QuizFormData {
  return {
    title: '',
    description: '',
    pass_score: 70,
    time_limit_minutes: undefined,
    max_attempts: undefined,
    is_active: true,
    questions: [
      {
        question_text: '',
        question_type: 'single_choice',
        explanation: '',
        points: 1,
        sort_order: 0,
        options: [
          { option_text: '', is_correct: true, sort_order: 0 },
          { option_text: '', is_correct: false, sort_order: 1 },
        ],
      },
    ],
  };
}

export function buildDefaultAssignmentDraft(): AssignmentFormData {
  return {
    title: '',
    instructions: '',
    due_at: '',
    max_score: undefined,
    allow_text_submission: true,
    allow_link_submission: false,
    allow_file_submission: false,
    is_active: true,
    is_auto_approve: false,
  };
}

export function sortSections(sections: CourseSection[]) {
  return [...sections].sort((left, right) => left.sort_order - right.sort_order || left.title.localeCompare(right.title));
}

export function sortLessons(lessons: LessonSummary[]) {
  return [...lessons].sort((left, right) => left.sort_order - right.sort_order || left.title.localeCompare(right.title));
}
