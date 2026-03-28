import type { JSONContent } from '@tiptap/core';
import { z } from 'zod';

export type BlogCategory = 'Programming' | 'DevSecOps' | 'Networking' | 'Career' | 'Community';
export type BlogPostStatus = 'draft' | 'in_review' | 'published' | 'rejected' | 'archived';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content_json: JSONContent;
  cover_image_url: string;
  category: BlogCategory;
  author_name: string;
  author_email: string;
  author_role: string;
  status: BlogPostStatus;
  published_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface BlogPostListResponse {
  data: BlogPost[];
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
  status?: BlogPostStatus;
}

export interface CreateBlogReviewRequest {
  title: string;
  slug: string;
  excerpt: string;
  content_json: JSONContent;
  author_name: string;
  author_email: string;
  author_role: string;
  category: BlogCategory;
  cover_image_url?: string;
}

export interface CreateBlogPostRequest extends CreateBlogReviewRequest {
  status?: BlogPostStatus;
}

export interface UpdateBlogPostStatusRequest {
  status: BlogPostStatus;
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
  content_json: z.custom<JSONContent>(
    (value) => typeof value === 'object' && value !== null,
    { message: 'Content is required' },
  ),
  author_name: z.string().min(3, 'Name must be at least 3 characters'),
  author_email: z.string().email('Enter a valid email address'),
  author_role: z.string().min(2, 'Role is required'),
  category: z.enum(['Programming', 'DevSecOps', 'Networking', 'Career', 'Community'], {
    error: 'Category is required',
  }),
  cover_image_url: z.string().url('Cover image must be a valid URL').optional().or(z.literal('')),
}).superRefine((data, ctx) => {
  if (getNodeTextLength(data.content_json) < 120) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Content must be at least 120 characters',
      path: ['content_json'],
    });
  }
});

export type BlogSubmissionFormData = z.infer<typeof blogSubmissionSchema>;

export function estimateReadTime(content: JSONContent): string {
  const words = Math.max(1, Math.ceil(getNodeTextLength(content) / 5));
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min read`;
}
