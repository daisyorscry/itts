import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../utility/response';
import {
  createBlogPostApi,
  createBlogReviewApi,
  getPublicBlogPostBySlugApi,
  listAdminBlogPostsApi,
  listMyBlogPostsApi,
  listPublicBlogPostsApi,
  updateBlogPostStatusApi,
} from './api';
import type {
  CreateBlogPostRequest,
  CreateBlogReviewRequest,
  ListBlogPostsParams,
  UpdateBlogPostStatusRequest,
} from './types';

export const blogKeys = {
  all: ['blog'] as const,
  posts: () => [...blogKeys.all, 'posts'] as const,
  postList: (params?: ListBlogPostsParams) => [...blogKeys.posts(), 'list', params] as const,
  postDetail: (slug: string) => [...blogKeys.posts(), 'detail', slug] as const,
  myPosts: (params?: ListBlogPostsParams) => [...blogKeys.posts(), 'me', params] as const,
};

export function useListPublicBlogPosts(params?: ListBlogPostsParams) {
  return useQuery({
    queryKey: blogKeys.postList(params),
    queryFn: async () => {
      const response = await listPublicBlogPostsApi(params);
      return response.data;
    },
    staleTime: 30 * 1000,
  });
}

export function usePublicBlogPost(slug: string, enabled = true) {
  return useQuery({
    queryKey: blogKeys.postDetail(slug),
    queryFn: async () => {
      const response = await getPublicBlogPostBySlugApi(slug);
      return response.data;
    },
    enabled: enabled && Boolean(slug),
    staleTime: 30 * 1000,
  });
}

export function useCreateBlogReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBlogReviewRequest) => createBlogReviewApi(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: blogKeys.posts() });
      toast.success(`"${response.data.title}" sent for admin review`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useCreateBlogPost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBlogPostRequest) => createBlogPostApi(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: blogKeys.posts() });
      toast.success(`Blog "${response.data.title}" created`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useListMyBlogPosts(params?: ListBlogPostsParams, enabled = true) {
  return useQuery({
    queryKey: blogKeys.myPosts(params),
    queryFn: async () => {
      const response = await listMyBlogPostsApi(params);
      return response.data;
    },
    enabled,
    staleTime: 15 * 1000,
  });
}

export function useListAdminBlogPosts(params?: ListBlogPostsParams, enabled = true) {
  return useQuery({
    queryKey: [...blogKeys.posts(), 'admin', params] as const,
    queryFn: async () => {
      const response = await listAdminBlogPostsApi(params);
      return response.data;
    },
    enabled,
    staleTime: 15 * 1000,
  });
}

export function useUpdateBlogPostStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateBlogPostStatusRequest }) =>
      updateBlogPostStatusApi(id, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: blogKeys.posts() });
      toast.success(`Blog moved to ${response.data.status.replace('_', ' ')}`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
