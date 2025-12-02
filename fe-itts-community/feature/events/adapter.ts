// feature/events/adapters.ts

export type Program = "networking" | "devsecops" | "programming";
export type EventStatus = "draft" | "open" | "ongoing" | "closed";

export type EventSpeaker = {
  id: string;
  event_id: string;
  name: string;
  title?: string | null;
  avatar_url?: string | null;
  sort_order: number;
};

export type RawEvent = {
  id: string;
  slug?: string | null;
  title: string;
  summary?: string | null;
  description?: string | null;
  image_url?: string | null;
  program?: string | null;
  status: string; // biarkan string, kita konversi di mapper
  starts_at?: string | null;
  ends_at?: string | null;
  venue?: string | null;
  created_at: string;
  updated_at: string;
};

export type PageResultRaw<T> = {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

export type Event = {
  id: string;
  slug?: string | null;
  title: string;
  summary?: string | null;
  description?: string | null;
  image_url?: string | null;
  program?: Program | null;
  status: EventStatus;
  starts_at?: string | null;
  ends_at?: string | null;
  venue?: string | null;
  created_at: string;
  updated_at: string;
  speakers?: EventSpeaker[];
};

export type EventRegistration = {
  id: string;
  event_id: string;
  full_name: string;
  email: string;
  created_at: string;
};

export type PageResult<T> = {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
};

function mapProgram(p?: string | null): Program | null {
  if (!p) return null;
  if (["networking", "devsecops", "programming"].includes(p)) {
    return p as Program;
  }
  return null; // jika backend kirim value diluar enum, abaikan
}

function mapStatus(s: string): EventStatus {
  if (["draft", "open", "ongoing", "closed"].includes(s)) {
    return s as EventStatus;
  }
  return "draft";
}

export function mapEvent(e: RawEvent): Event {
  return {
    id: e.id,
    slug: e.slug ?? null,
    title: e.title,
    summary: e.summary ?? null,
    description: e.description ?? null,
    image_url: e.image_url ?? null,
    program: mapProgram(e.program),
    status: mapStatus(e.status),
    starts_at: e.starts_at ?? null,
    ends_at: e.ends_at ?? null,
    venue: e.venue ?? null,
    created_at: e.created_at,
    updated_at: e.updated_at,
  };
}

export function mapPageResult<TIn, TOut>(
  res: PageResultRaw<TIn>,
  map: (x: TIn) => TOut
): PageResult<TOut> {
  return {
    data: res.data.map(map),
    total: res.total,
    page: res.page,
    page_size: res.page_size,
    total_pages: res.total_pages,
  };
}
