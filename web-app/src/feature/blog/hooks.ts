import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../../utility/response';
import {
  createBlogSubmissionApi,
  getPublicBlogPostBySlugApi,
  listBlogSubmissionsApi,
  listPublicBlogPostsApi,
  updateBlogSubmissionStatusApi,
} from './api';
import type {
  CreateBlogSubmissionRequest,
  ListBlogPostsParams,
  ListBlogSubmissionsParams,
  UpdateBlogSubmissionStatusRequest,
} from './types';

export const blogKeys = {
  all: ['blog'] as const,
  posts: () => [...blogKeys.all, 'posts'] as const,
  postList: (params?: ListBlogPostsParams) => [...blogKeys.posts(), 'list', params] as const,
  postDetail: (slug: string) => [...blogKeys.posts(), 'detail', slug] as const,
  submissions: () => [...blogKeys.all, 'submissions'] as const,
  submissionList: (params?: ListBlogSubmissionsParams) => [...blogKeys.submissions(), 'list', params] as const,
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

export function useCreateBlogSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBlogSubmissionRequest) => createBlogSubmissionApi(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: blogKeys.submissions() });
      toast.success(`Submission "${response.data.title}" sent for review`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useListBlogSubmissions(params?: ListBlogSubmissionsParams, enabled = true) {
  return useQuery({
    queryKey: blogKeys.submissionList(params),
    queryFn: async () => {
      const response = await listBlogSubmissionsApi(params);
      return response.data;
    },
    enabled,
    staleTime: 15 * 1000,
  });
}

export function useUpdateBlogSubmissionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateBlogSubmissionStatusRequest }) =>
      updateBlogSubmissionStatusApi(id, payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: blogKeys.submissions() });
      toast.success(`Submission moved to ${response.data.status.replace('_', ' ')}`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
