"use client";

/**
 * Registration React Query Hooks
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/feature/auth";
import * as api from "./api";
import type { ListRegistrationsParams, RejectRegistrationRequest } from "./types";

// Query Keys
export const QK = {
  registrations: (params?: ListRegistrationsParams) =>
    ["registrations", params] as const,
  registration: (id: string) => ["registration", id] as const,
} as const;

/**
 * List registrations query
 */
export function useListRegistrations(params: ListRegistrationsParams = {}) {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: QK.registrations(params),
    queryFn: () => {
      if (!accessToken) throw new Error("Not authenticated");
      return api.listRegistrations(params, accessToken);
    },
    enabled: !!accessToken,
  });
}

/**
 * Get registration query
 */
export function useGetRegistration(id: string, enabled = true) {
  const { accessToken } = useAuth();

  return useQuery({
    queryKey: QK.registration(id),
    queryFn: () => {
      if (!accessToken) throw new Error("Not authenticated");
      return api.getRegistration(id, accessToken);
    },
    enabled: !!accessToken && enabled && !!id,
  });
}

/**
 * Approve registration mutation
 */
export function useApproveRegistration() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!accessToken) throw new Error("Not authenticated");
      return api.approveRegistration(id, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      toast.success("Registration approved successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to approve registration");
    },
  });
}

/**
 * Reject registration mutation
 */
export function useRejectRegistration() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => {
      if (!accessToken) throw new Error("Not authenticated");
      return api.rejectRegistration(id, reason, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      toast.success("Registration rejected");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to reject registration");
    },
  });
}

/**
 * Delete registration mutation
 */
export function useDeleteRegistration() {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!accessToken) throw new Error("Not authenticated");
      return api.deleteRegistration(id, accessToken);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["registrations"] });
      toast.success("Registration deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to delete registration");
    },
  });
}
