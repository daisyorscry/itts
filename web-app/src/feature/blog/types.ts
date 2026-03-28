import type { JSONContent } from '@tiptap/core';
import { z } from 'zod';

export type BlogCategory = 'Programming' | 'DevSecOps' | 'Networking' | 'Career' | 'Community';
export type BlogSubmissionStatus = 'submitted' | 'in_review' | 'approved' | 'rejected';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: JSONContent;
  author: string;
  role: string;
  date: string;
  readTime: string;
  category: BlogCategory;
  image: string;
  featured?: boolean;
}

export interface BlogSubmission {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: JSONContent;
  authorName: string;
  authorEmail: string;
  role: string;
  category: BlogCategory;
  status: BlogSubmissionStatus;
  notes?: string;
  createdAt: string;
}

export interface BlogPostListResponse {
  data: BlogPost[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface BlogSubmissionListResponse {
  data: BlogSubmission[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ListBlogPostsParams {
  page?: number;
  page_size?: number;
  search?: string;
  category?: BlogCategory;
}

export interface ListBlogSubmissionsParams {
  page?: number;
  page_size?: number;
  search?: string;
  status?: BlogSubmissionStatus;
}

export interface CreateBlogSubmissionRequest {
  title: string;
  slug: string;
  excerpt: string;
  content: JSONContent;
  authorName: string;
  authorEmail: string;
  role: string;
  category: BlogCategory;
}

export interface UpdateBlogSubmissionStatusRequest {
  status: BlogSubmissionStatus;
  notes?: string;
}

function getNodeTextLength(node: unknown): number {
  if (!node || typeof node !== 'object') {
    return 0;
  }

  const typedNode = node as { text?: unknown; content?: unknown[] };
  const currentLength = typeof typedNode.text === 'string' ? typedNode.text.trim().length : 0;
  const nestedLength = Array.isArray(typedNode.content)
    ? typedNode.content.reduce((sum, child) => sum + getNodeTextLength(child), 0)
    : 0;

  return currentLength + nestedLength;
}

export const blogSubmissionSchema = z.object({
  title: z.string().min(8, 'Title must be at least 8 characters'),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must use lowercase letters, numbers, and hyphens only'),
  excerpt: z.string().min(24, 'Excerpt must be at least 24 characters').max(220, 'Excerpt must be 220 characters or less'),
  content: z.custom<JSONContent>(
    (value) => typeof value === 'object' && value !== null,
    { message: 'Content is required' },
  ),
  authorName: z.string().min(3, 'Name must be at least 3 characters'),
  authorEmail: z.string().email('Enter a valid email address'),
  role: z.string().min(2, 'Role is required'),
  category: z.enum(['Programming', 'DevSecOps', 'Networking', 'Career', 'Community'], {
    error: 'Category is required',
  }),
}).superRefine((data, ctx) => {
  if (getNodeTextLength(data.content) < 120) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Content must be at least 120 characters',
      path: ['content'],
    });
  }
});

export type BlogSubmissionFormData = z.infer<typeof blogSubmissionSchema>;
