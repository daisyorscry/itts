// src/feature/events.ts
"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/feature/auth";
import {
  mapEvent,
  mapPageResult,
  type Event,
  type EventRegistration,
  type EventSpeaker,
  type EventStatus,
  type PageResult,
  type PageResultRaw,
  type Program,
  type RawEvent,
} from "./events/adapter";

/* =========================
   Helpers
   ========================= */

const RAW_API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
export const API_BASE = RAW_API_BASE.replace(/\/+$/, "");

export function apiUrl(path: string) {
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE}${p}`;
}

function getAuthHeaders(token?: string | null): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export async function parseApi<T>(res: Response): Promise<T> {
  if (res.ok) {
    try {
      return (await res.json()) as T;
    } catch {
      return {} as T; // 204/empty
    }
  }

  // Handle errors - standardized backend format
  let msg = "Failed to perform action.";
  try {
    const json = await res.json();
    // New standardized format: { error: { code, message }, meta }
    if (json.error && json.error.message) {
      msg = json.error.message;
    } else if (json.message) {
      msg = json.message;
    } else if (json.error && typeof json.error === 'string') {
      msg = json.error;
    }
  } catch {
    const text = await res.text().catch(() => "");
    msg = text || msg;
  }
  throw new Error(msg);
}

export function toQueryString(params: Record<string, any | undefined>) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    if (Array.isArray(v)) {
      v.forEach((item) => q.append(k, String(item)));
    } else {
      q.set(k, String(v));
    }
  });
  return q.toString();
}

/* =========================
   Query Keys
   ========================= */

export const QK = {
  events: (params?: Record<string, any>) => ["events", params] as const,
  eventById: (id: string) => ["events", "byId", id] as const,
  eventBySlug: (slug: string) => ["events", "bySlug", slug] as const,
  speakers: (params?: Record<string, any>) =>
    ["eventSpeakers", params] as const,
  registrations: (params?: Record<string, any>) =>
    ["eventRegistrations", params] as const,
};

/* =========================
   READ (Queries)
   ========================= */

export type ListEventsParams = {
  search?: string;
  sort?: string[]; // e.g. ["-starts_at", "title"]
  page?: number;
  page_size?: number;
  program?: Program;
  status?: EventStatus;
};

export function useListEvents(params: ListEventsParams = {}) {
  const { accessToken } = useAuth();
  // stabilkan nilai sort untuk queryKey
  const stableSort = params.sort ? [...params.sort] : [];

  const qs = toQueryString({
    search: params.search,
    sort: stableSort.length ? stableSort.join(",") : undefined,
    page: params.page ?? 1,
    page_size: params.page_size ?? 20,
    program: params.program,
    status: params.status,
  });

  return useQuery({
    queryKey: QK.events({ ...params, sort: stableSort }),
    queryFn: async ({ signal }) => {
      const res = await fetch(apiUrl(`/api/v1/admin/events?${qs}`), {
        headers: getAuthHeaders(accessToken),
        credentials: "include",
        signal,
      });
      const response = await parseApi<{ data: PageResultRaw<RawEvent> }>(res);
      return mapPageResult(response.data, mapEvent) as PageResult<Event>;
    },
    enabled: !!accessToken,
    staleTime: 15_000,
    gcTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
}

export function useGetEvent(id?: string) {
  return useQuery({
    queryKey: id ? QK.eventById(id) : ["events", "byId", "none"],
    enabled: !!id,
    queryFn: async ({ signal }) => {
      const res = await fetch(apiUrl(`/api/v1/admin/events/${id}`), {
        headers: { Accept: "application/json" },
        credentials: "include",
        signal,
      });
      const response = await parseApi<{ data: RawEvent }>(res);
      return mapEvent(response.data);
    },
  });
}

export function useGetEventBySlug(slug?: string) {
  return useQuery({
    queryKey: slug ? QK.eventBySlug(slug) : ["events", "bySlug", "none"],
    enabled: !!slug,
    queryFn: async ({ signal }) => {
      const res = await fetch(apiUrl(`/api/v1/events/slug/${slug}`), {
        headers: { Accept: "application/json" },
        credentials: "include",
        signal,
      });
      const response = await parseApi<{ data: RawEvent }>(res);
      return mapEvent(response.data);
    },
  });
}

/* Speakers */

export type ListSpeakersParams = {
  search?: string;
  event_id?: string;
  sort?: string[];
  page?: number;
  page_size?: number;
};

export function useListSpeakers(params: ListSpeakersParams = {}) {
  const qs = toQueryString({
    search: params.search,
    sort: params.sort?.length ? params.sort.join(",") : undefined,
    page: params.page ?? 1,
    page_size: params.page_size ?? 20,
    event_id: params.event_id,
  });

  return useQuery({
    queryKey: QK.speakers({
      ...params,
      sort: params.sort ? [...params.sort] : [],
    }),
    queryFn: async ({ signal }) =>
      parseApi<PageResult<EventSpeaker>>(
        await fetch(apiUrl(`/api/v1/admin/event-speakers?${qs}`), {
          headers: { Accept: "application/json" },
          credentials: "include",
          signal,
        })
      ),
  });
}

/* Registrations */

export type ListEventRegsParams = {
  search?: string;
  event_id?: string;
  sort?: string[];
  page?: number;
  page_size?: number;
};

export function useListEventRegistrations(params: ListEventRegsParams = {}) {
  const qs = toQueryString({
    search: params.search,
    sort: params.sort?.length ? params.sort.join(",") : undefined,
    page: params.page ?? 1,
    page_size: params.page_size ?? 20,
    event_id: params.event_id,
  });

  return useQuery({
    queryKey: QK.registrations({
      ...params,
      sort: params.sort ? [...params.sort] : [],
    }),
    queryFn: async ({ signal }) =>
      parseApi<PageResult<EventRegistration>>(
        await fetch(apiUrl(`/api/v1/admin/event-registrations?${qs}`), {
          headers: { Accept: "application/json" },
          credentials: "include",
          signal,
        })
      ),
  });
}

/* =========================
   WRITE (Mutations) - Admin
   ========================= */

export type CreateEventInput = {
  slug?: string | null;
  title: string;
  summary?: string | null;
  description?: string | null;
  image_url?: string | null;
  program?: Program | null;
  status?: EventStatus | null;
  starts_at?: string | null; // ISO
  ends_at?: string | null; // ISO
  venue?: string | null;
};

export type UpdateEventInput = Partial<CreateEventInput>;

export function useCreateEvent(opts?: { onSuccess?: (ev: Event) => void }) {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateEventInput) => {
      if (!accessToken) throw new Error('Not authenticated');
      const res = await fetch(apiUrl(`/api/v1/admin/events`), {
        method: "POST",
        headers: getAuthHeaders(accessToken),
        credentials: "include",
        body: JSON.stringify(input),
      });
      const response = await parseApi<{ data: RawEvent }>(res);
      return mapEvent(response.data);
    },
    onSuccess: (ev) => {
      toast.success("Event berhasil dibuat");
      qc.invalidateQueries({ queryKey: ["events"] });
      opts?.onSuccess?.(ev);
    },
    onError: (e: any) => toast.error(e?.message || "Gagal membuat event"),
  });
}

export function useUpdateEvent(opts?: { onSuccess?: (ev: Event) => void }) {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateEventInput;
    }) => {
      if (!accessToken) throw new Error('Not authenticated');
      const res = await fetch(apiUrl(`/api/v1/admin/events/${id}`), {
        method: "PATCH",
        headers: getAuthHeaders(accessToken),
        credentials: "include",
        body: JSON.stringify(data),
      });
      const response = await parseApi<{ data: RawEvent }>(res);
      return mapEvent(response.data);
    },
    onSuccess: (ev) => {
      toast.success("Event berhasil diperbarui");
      qc.invalidateQueries({ queryKey: ["events"] });
      qc.invalidateQueries({ queryKey: QK.eventById(ev.id) });
      if (ev.slug) qc.invalidateQueries({ queryKey: QK.eventBySlug(ev.slug) });
      opts?.onSuccess?.(ev);
    },
    onError: (e: any) => toast.error(e?.message || "Gagal memperbarui event"),
  });
}

export function useDeleteEvent() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!accessToken) throw new Error('Not authenticated');
      return parseApi<void>(
        await fetch(apiUrl(`/api/v1/admin/events/${id}`), {
          method: "DELETE",
          headers: getAuthHeaders(accessToken),
          credentials: "include",
        })
      );
    },
    onSuccess: () => {
      toast.success("Event dihapus");
      qc.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (e: any) => toast.error(e?.message || "Gagal menghapus event"),
  });
}

export function useSetEventStatus() {
  const { accessToken } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: EventStatus }) => {
      if (!accessToken) throw new Error('Not authenticated');
      const res = await fetch(apiUrl(`/api/v1/admin/events/${id}/status`), {
        method: "PATCH",
        headers: getAuthHeaders(accessToken),
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      const response = await parseApi<{ data: RawEvent }>(res);
      return mapEvent(response.data);
    },
    onSuccess: (ev) => {
      toast.success("Status event diperbarui");
      qc.invalidateQueries({ queryKey: ["events"] });
      qc.invalidateQueries({ queryKey: QK.eventById(ev.id) });
      if (ev.slug) qc.invalidateQueries({ queryKey: QK.eventBySlug(ev.slug) });
    },
    onError: (e: any) => toast.error(e?.message || "Gagal mengubah status"),
  });
}

/* =========================
   WRITE (Mutations) - Speakers (Admin)
   ========================= */

export type CreateSpeakerInput = {
  event_id: string;
  name: string;
  title?: string | null;
  avatar_url?: string | null;
  sort_order?: number | null;
};

export type UpdateSpeakerInput = Partial<CreateSpeakerInput>;

export function useAddSpeaker() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateSpeakerInput) =>
      parseApi<EventSpeaker>(
        await fetch(apiUrl(`/api/v1/admin/events/${input.event_id}/speakers`), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
          body: JSON.stringify(input),
        })
      ),
    onSuccess: (sp) => {
      toast.success("Speaker ditambahkan");
      qc.invalidateQueries({ queryKey: ["events"] });
      qc.invalidateQueries({
        queryKey: QK.speakers({ event_id: sp.event_id }),
      });
    },
    onError: (e: any) => toast.error(e?.message || "Gagal menambah speaker"),
  });
}

export function useUpdateSpeaker() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateSpeakerInput;
    }) =>
      parseApi<EventSpeaker>(
        await fetch(apiUrl(`/api/v1/admin/event-speakers/${id}`), {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
          body: JSON.stringify(data),
        })
      ),
    onSuccess: (sp) => {
      toast.success("Speaker diperbarui");
      qc.invalidateQueries({ queryKey: ["events"] });
      qc.invalidateQueries({
        queryKey: QK.speakers({ event_id: sp.event_id }),
      });
    },
    onError: (e: any) => toast.error(e?.message || "Gagal memperbarui speaker"),
  });
}

export function useDeleteSpeaker() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, event_id }: { id: string; event_id: string }) =>
      parseApi<void>(
        await fetch(apiUrl(`/api/v1/admin/event-speakers/${id}`), {
          method: "DELETE",
          headers: { Accept: "application/json" },
          credentials: "include",
        })
      ),
    onSuccess: (_v, vars) => {
      toast.success("Speaker dihapus");
      qc.invalidateQueries({ queryKey: ["events"] });
      qc.invalidateQueries({
        queryKey: QK.speakers({ event_id: vars.event_id }),
      });
    },
    onError: (e: any) => toast.error(e?.message || "Gagal menghapus speaker"),
  });
}

/* =========================
   WRITE (Mutations) - Registrations
   ========================= */

export type PublicRegisterToEventInput = {
  event_id: string;
  full_name: string;
  email: string;
};

export function useRegisterToEvent(opts?: { onSuccess?: () => void }) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: PublicRegisterToEventInput) =>
      parseApi<EventRegistration>(
        await fetch(apiUrl(`/api/v1/events/${input.event_id}/register`), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          credentials: "include",
          body: JSON.stringify(input),
        })
      ),
    onSuccess: () => {
      toast.success("Pendaftaran ke event berhasil");
      // invalidate semua list registrations
      qc.invalidateQueries({ queryKey: ["eventRegistrations"], exact: false });
      opts?.onSuccess?.();
    },
    onError: (e: any) => toast.error(e?.message || "Gagal mendaftar ke event"),
  });
}

export function useUnregisterFromEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      parseApi<void>(
        await fetch(apiUrl(`/api/v1/admin/event-registrations/${id}`), {
          method: "DELETE",
          headers: { Accept: "application/json" },
          credentials: "include",
        })
      ),
    onSuccess: () => {
      toast.success("Registrasi event dihapus");
      qc.invalidateQueries({ queryKey: ["eventRegistrations"], exact: false });
    },
    onError: (e: any) =>
      toast.error(e?.message || "Gagal menghapus registrasi"),
  });
}
