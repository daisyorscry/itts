import { apiClient } from '../../utility/api';
import type { ApiResponse } from '../../utility/response';
import type {
  BlogPost,
  BlogPostListResponse,
  CreateBlogPostRequest,
  CreateBlogReviewRequest,
  ListBlogPostsParams,
  UpdateBlogPostStatusRequest,
} from './types';

const ADMIN_BLOG_BASE = '/admin/blog';

export async function listPublicBlogPostsApi(params?: ListBlogPostsParams): Promise<ApiResponse<BlogPostListResponse>> {
  const response = await apiClient.get<ApiResponse<BlogPostListResponse>>('/blog', { params });
  return response.data;
}

export async function getPublicBlogPostBySlugApi(slug: string): Promise<ApiResponse<BlogPost>> {
  const response = await apiClient.get<ApiResponse<BlogPost>>(`/blog/slug/${encodeURIComponent(slug)}`);
  return response.data;
}

export async function createBlogReviewApi(payload: CreateBlogReviewRequest): Promise<ApiResponse<BlogPost>> {
  const response = await apiClient.post<ApiResponse<BlogPost>>('/blog/submissions', payload);
  return response.data;
}

export async function listMyBlogPostsApi(params?: ListBlogPostsParams): Promise<ApiResponse<BlogPostListResponse>> {
  const response = await apiClient.get<ApiResponse<BlogPostListResponse>>('/blog/submissions/me', { params });
  return response.data;
}

export async function listAdminBlogPostsApi(params?: ListBlogPostsParams): Promise<ApiResponse<BlogPostListResponse>> {
  const response = await apiClient.get<ApiResponse<BlogPostListResponse>>(ADMIN_BLOG_BASE, { params });
  return response.data;
}

export async function createBlogPostApi(payload: CreateBlogPostRequest): Promise<ApiResponse<BlogPost>> {
  const response = await apiClient.post<ApiResponse<BlogPost>>(ADMIN_BLOG_BASE, payload);
  return response.data;
}

export async function updateBlogPostStatusApi(
  id: string,
  payload: UpdateBlogPostStatusRequest,
): Promise<ApiResponse<BlogPost>> {
  const response = await apiClient.patch<ApiResponse<BlogPost>>(`${ADMIN_BLOG_BASE}/${id}/status`, payload);
  return response.data;
}
