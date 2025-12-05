// feature/events/hooks.ts
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/feature/auth";
import {
  mapEvent,
  mapPageResult,
  type RawEvent,
  type PageResultRaw,
  type Event,
} from "./adapter";
import { parseApi, QK, toQueryString } from "./events";

export type ListEventsParams = {
  search?: string;
  sort?: string[];
  page?: number;
  page_size?: number;
  program?: string;
  status?: "draft" | "open" | "ongoing" | "closed";
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

function apiUrl(path: string) {
  return `${API_BASE}${path}`;
}

function getAuthHeaders(token?: string | null): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export function useListEvents(params: ListEventsParams = {}) {
  const { accessToken } = useAuth();

  const qs = toQueryString({
    search: params.search,
    sort: params.sort?.length ? params.sort.join(",") : undefined,
    page: params.page ?? 1,
    page_size: params.page_size ?? 20,
    program: params.program,
    status: params.status,
  });

  return useQuery({
    queryKey: QK.events({
      ...params,
      // hindari referensi fungsi/objek tak-stabil di key
      sort: params.sort?.slice() ?? [],
    }),
    queryFn: async () => {
      const raw = await fetch(apiUrl(`/api/v1/admin/events?${qs}`), {
        headers: getAuthHeaders(accessToken),
        credentials: 'include',
      });
      const response = await parseApi<{ data: PageResultRaw<RawEvent> }>(raw);
      return mapPageResult(response.data, mapEvent) as {
        data: Event[];
        total: number;
        page: number;
        page_size: number;
        total_pages: number;
      };
    },
    enabled: !!accessToken,
  });
}
