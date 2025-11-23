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
  ID: string;
  Slug?: string | null;
  Title: string;
  Summary?: string | null;
  Description?: string | null;
  ImageURL?: string | null;
  Program?: string | null;
  Status: string; // biarkan string, kita konversi di mapper
  StartsAt?: string | null;
  EndsAt?: string | null;
  Venue?: string | null;
  CreatedAt: string;
  UpdatedAt: string;
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
    id: e.ID,
    slug: e.Slug ?? null,
    title: e.Title,
    summary: e.Summary ?? null,
    description: e.Description ?? null,
    image_url: e.ImageURL ?? null,
    program: mapProgram(e.Program),
    status: mapStatus(e.Status),
    starts_at: e.StartsAt ?? null,
    ends_at: e.EndsAt ?? null,
    venue: e.Venue ?? null,
    created_at: e.CreatedAt,
    updated_at: e.UpdatedAt,
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
