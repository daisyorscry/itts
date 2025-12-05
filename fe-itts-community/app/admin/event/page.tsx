"use client";

import { useEffect, useState, type FormEvent } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table-shadcn";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Pencil, Plus, Trash2, UserPlus } from "lucide-react";
import { ProtectedRoute, PERMISSIONS } from "@/feature/auth";
import {
  useListEvents,
  useCreateEvent,
  useUpdateEvent,
  useDeleteEvent,
  useSetEventStatus,
  useAddSpeaker,
  type CreateEventInput,
} from "@/feature/events/events";
import { type Event, type EventStatus, type Program } from "@/feature/events/adapter";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

const PROGRAM_OPTIONS: { value: Program; label: string }[] = [
  { value: "networking", label: "Networking" },
  { value: "devsecops", label: "DevSecOps" },
  { value: "programming", label: "Programming" },
];

const STATUS_OPTIONS: { value: EventStatus; label: string }[] = [
  { value: "draft", label: "Draft" },
  { value: "open", label: "Open" },
  { value: "ongoing", label: "Ongoing" },
  { value: "closed", label: "Closed" },
];

type ProgramFilterValue = Program | "all";
type StatusFilterValue = EventStatus | "all";

const NO_PROGRAM_VALUE = "no-program";
type ProgramSelectValue = Program | typeof NO_PROGRAM_VALUE;

type EventFormValues = {
  title: string;
  slug: string;
  summary: string;
  description: string;
  image_url: string;
  program: ProgramSelectValue;
  status: EventStatus;
  starts_at: string;
  ends_at: string;
  venue: string;
};

type SpeakerFormValues = {
  name: string;
  title: string;
  avatar_url: string;
  sort_order: string;
};

const EMPTY_EVENT_FORM: EventFormValues = {
  title: "",
  slug: "",
  summary: "",
  description: "",
  image_url: "",
  program: NO_PROGRAM_VALUE,
  status: "draft",
  starts_at: "",
  ends_at: "",
  venue: "",
};

const EMPTY_SPEAKER_FORM: SpeakerFormValues = {
  name: "",
  title: "",
  avatar_url: "",
  sort_order: "",
};

export default function AdminEventsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [programFilter, setProgramFilter] = useState<ProgramFilterValue>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<Event | null>(null);
  const [speakerEvent, setSpeakerEvent] = useState<Event | null>(null);
  const [deleteEvent, setDeleteEvent] = useState<Event | null>(null);

  const { data, isLoading, error } = useListEvents({
    page,
    page_size: 10,
    search: search || undefined,
    program: programFilter !== "all" ? programFilter : undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const createMutation = useCreateEvent({
    onSuccess: () => setCreateOpen(false),
  });
  const updateMutation = useUpdateEvent({
    onSuccess: () => setEditEvent(null),
  });
  const deleteMutation = useDeleteEvent();
  const statusMutation = useSetEventStatus();
  const addSpeakerMutation = useAddSpeaker();

  const events = data?.data ?? [];
  const totalPages = data?.total_pages ?? 1;

  const handleCreateSubmit = async (values: EventFormValues) => {
    const payload = formValuesToPayload(values);
    await createMutation.mutateAsync(payload);
  };

  const handleEditSubmit = async (values: EventFormValues) => {
    if (!editEvent) return;
    const payload = formValuesToPayload(values);
    await updateMutation.mutateAsync({ id: editEvent.id, data: payload });
  };

  const handleSpeakerSubmit = async (values: SpeakerFormValues) => {
    if (!speakerEvent) return;
    await addSpeakerMutation.mutateAsync({
      event_id: speakerEvent.id,
      name: values.name.trim(),
      title: values.title.trim() || undefined,
      avatar_url: values.avatar_url.trim() || undefined,
      sort_order: values.sort_order ? Number(values.sort_order) : undefined,
    });
    setSpeakerEvent(null);
  };

  const handleDelete = async () => {
    if (!deleteEvent) return;
    await deleteMutation.mutateAsync(deleteEvent.id);
    setDeleteEvent(null);
  };

  const handleStatusChange = (event: Event, status: EventStatus) => {
    if (event.status === status) return;
    statusMutation.mutate({ id: event.id, status });
  };

  const resetFilters = () => {
    setSearch("");
    setProgramFilter("all");
    setStatusFilter("all");
    setPage(1);
  };

  return (
    <ProtectedRoute anyPermissions={[PERMISSIONS.EVENTS_LIST, PERMISSIONS.EVENTS_READ]}>
      <div className="space-y-6 p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Events Management</h1>
            <p className="mt-1 text-foreground/60">Kelola event, jadwal, dan speaker komunitas.</p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        </div>

        <div className="rounded-lg border border-border bg-background p-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Input
              placeholder="Search events..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <Select
              value={programFilter}
              onValueChange={(value) => {
                setProgramFilter(value as ProgramFilterValue);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All programs" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All programs</SelectItem>
                {PROGRAM_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value as StatusFilterValue);
                setPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="All status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="w-full md:w-auto" onClick={resetFilters}>
              Clear Filters
            </Button>
          </div>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error instanceof Error ? error.message : "Failed to load events"}
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-foreground/60" />
          </div>
        ) : (
          <>
            <div className="rounded-lg border border-border bg-background">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Program</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="font-medium">{event.title}</div>
                        <div className="text-sm text-foreground/60">
                          {event.slug ? `/${event.slug}` : "—"}
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">
                        {event.program ? getProgramLabel(event.program) : "—"}
                      </TableCell>
                      <TableCell className="text-sm">{formatSchedule(event)}</TableCell>
                      <TableCell>
                        <StatusSelect
                          value={event.status}
                          disabled={statusMutation.isPending}
                          onChange={(status) => handleStatusChange(event, status)}
                        />
                      </TableCell>
                      <TableCell>{event.venue || "—"}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSpeakerEvent(event)}
                          >
                            <UserPlus className="h-4 w-4" />
                            <span className="hidden sm:inline">Speaker</span>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditEvent(event)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="hidden sm:inline">Edit</span>
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => setDeleteEvent(event)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="hidden sm:inline">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {events.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-foreground/60">
                        No events found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {data && data.total_pages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-foreground/60">
                  Showing {events.length} of {data.total} events
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={page >= totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <EventFormDialog
        mode="create"
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={handleCreateSubmit}
        submitting={createMutation.isPending}
      />

      <EventFormDialog
        mode="edit"
        open={!!editEvent}
        initial={editEvent ?? undefined}
        onOpenChange={(open) => {
          if (!open) {
            setEditEvent(null);
          }
        }}
        onSubmit={handleEditSubmit}
        submitting={updateMutation.isPending}
      />

      <SpeakerFormDialog
        open={!!speakerEvent}
        eventName={speakerEvent?.title}
        onOpenChange={(open) => {
          if (!open) {
            setSpeakerEvent(null);
          }
        }}
        onSubmit={handleSpeakerSubmit}
        submitting={addSpeakerMutation.isPending}
      />

      <ConfirmDialog
        isOpen={!!deleteEvent}
        onClose={() => setDeleteEvent(null)}
        onConfirm={handleDelete}
        title="Delete Event"
        message={
          deleteEvent
            ? `Are you sure you want to delete "${deleteEvent.title}"? This action cannot be undone.`
            : "Are you sure you want to delete this event?"
        }
        confirmText="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </ProtectedRoute>
  );
}

type EventFormDialogProps = {
  mode: "create" | "edit";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: EventFormValues) => Promise<void> | void;
  submitting?: boolean;
  initial?: Event;
};

function EventFormDialog({
  mode,
  open,
  onOpenChange,
  onSubmit,
  submitting,
  initial,
}: EventFormDialogProps) {
  const [values, setValues] = useState<EventFormValues>(EMPTY_EVENT_FORM);
  const [slugEdited, setSlugEdited] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setValues(mapEventToFormValues(initial));
      setSlugEdited(Boolean(initial.slug));
    } else {
      setValues(EMPTY_EVENT_FORM);
      setSlugEdited(false);
    }
  }, [open, initial]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(values);
  };

  const updateValue = (field: keyof EventFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{mode === "create" ? "Create Event" : "Edit Event"}</DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Lengkapi detail event baru untuk komunitas."
                : "Perbarui informasi event yang sudah ada."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="event_title">Title *</Label>
              <Input
                id="event_title"
                value={values.title}
                onChange={(e) => {
                  const nextTitle = e.target.value;
                  setValues((prev) => ({
                    ...prev,
                    title: nextTitle,
                    slug: slugEdited ? prev.slug : slugify(nextTitle),
                  }));
                }}
                required
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="event_slug">Slug</Label>
                <Input
                  id="event_slug"
                  value={values.slug}
                  onChange={(e) => {
                    setSlugEdited(Boolean(e.target.value.trim()));
                    updateValue("slug", e.target.value);
                  }}
                  placeholder="unique-slug"
                />
              </div>
              <div className="grid gap-2">
                <Label>Program</Label>
                <Select
                  value={values.program}
                  onValueChange={(val) => updateValue("program", val as ProgramSelectValue)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select program" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NO_PROGRAM_VALUE}>No program</SelectItem>
                    {PROGRAM_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="event_summary">Summary</Label>
              <Input
                id="event_summary"
                value={values.summary}
                onChange={(e) => updateValue("summary", e.target.value)}
                placeholder="Short overview"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="event_description">Description</Label>
              <Textarea
                id="event_description"
                rows={4}
                value={values.description}
                onChange={(e) => updateValue("description", e.target.value)}
                placeholder="Detail agenda, speaker, dll"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="event_image">Image URL</Label>
                <Input
                  id="event_image"
                  value={values.image_url}
                  onChange={(e) => updateValue("image_url", e.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="event_venue">Venue</Label>
                <Input
                  id="event_venue"
                  value={values.venue}
                  onChange={(e) => updateValue("venue", e.target.value)}
                  placeholder="Lokasi event"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="event_start">Starts At *</Label>
                <Input
                  id="event_start"
                  type="datetime-local"
                  value={values.starts_at}
                  onChange={(e) => updateValue("starts_at", e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="event_end">Ends At</Label>
                <Input
                  id="event_end"
                  type="datetime-local"
                  value={values.ends_at}
                  onChange={(e) => updateValue("ends_at", e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={values.status}
                onValueChange={(val) => updateValue("status", val as EventStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === "create" ? "Create" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type SpeakerFormDialogProps = {
  open: boolean;
  eventName?: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: SpeakerFormValues) => Promise<void> | void;
  submitting?: boolean;
};

function SpeakerFormDialog({
  open,
  eventName,
  onOpenChange,
  onSubmit,
  submitting,
}: SpeakerFormDialogProps) {
  const [values, setValues] = useState<SpeakerFormValues>(EMPTY_SPEAKER_FORM);

  useEffect(() => {
    if (open) {
      setValues(EMPTY_SPEAKER_FORM);
    }
  }, [open]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(values);
  };

  const updateValue = (field: keyof SpeakerFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Add Speaker</DialogTitle>
            <DialogDescription>
              {eventName ? `Tambahkan speaker untuk ${eventName}.` : "Tambahkan speaker baru."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="speaker_name">Name *</Label>
              <Input
                id="speaker_name"
                value={values.name}
                onChange={(e) => updateValue("name", e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="speaker_title">Title</Label>
              <Input
                id="speaker_title"
                value={values.title}
                onChange={(e) => updateValue("title", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="speaker_avatar">Avatar URL</Label>
              <Input
                id="speaker_avatar"
                value={values.avatar_url}
                onChange={(e) => updateValue("avatar_url", e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="speaker_sort">Sort Order</Label>
              <Input
                id="speaker_sort"
                type="number"
                value={values.sort_order}
                onChange={(e) => updateValue("sort_order", e.target.value)}
                placeholder="0"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Speaker
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function StatusSelect({
  value,
  onChange,
  disabled,
}: {
  value: EventStatus;
  onChange: (value: EventStatus) => void;
  disabled?: boolean;
}) {
  return (
    <Select value={value} onValueChange={(val) => onChange(val as EventStatus)} disabled={disabled}>
      <SelectTrigger className={`capitalize ${statusToneClasses(value)}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function formValuesToPayload(values: EventFormValues): CreateEventInput {
  return {
    title: values.title.trim(),
    slug: values.slug.trim() || undefined,
    summary: values.summary.trim() || undefined,
    description: values.description.trim() || undefined,
    image_url: values.image_url.trim() || undefined,
    program: values.program === NO_PROGRAM_VALUE ? undefined : values.program,
    status: values.status,
    starts_at: values.starts_at ? new Date(values.starts_at).toISOString() : undefined,
    ends_at: values.ends_at ? new Date(values.ends_at).toISOString() : undefined,
    venue: values.venue.trim() || undefined,
  };
}

function mapEventToFormValues(event: Event): EventFormValues {
  return {
    title: event.title,
    slug: event.slug ?? "",
    summary: event.summary ?? "",
    description: event.description ?? "",
    image_url: event.image_url ?? "",
    program: event.program ?? NO_PROGRAM_VALUE,
    status: event.status,
    starts_at: toDatetimeInputValue(event.starts_at),
    ends_at: toDatetimeInputValue(event.ends_at),
    venue: event.venue ?? "",
  };
}

function formatSchedule(event: Event) {
  if (!event.starts_at) return "—";
  try {
    const start = format(new Date(event.starts_at), "dd MMM yyyy HH:mm");
    if (!event.ends_at) return start;
    const end = format(new Date(event.ends_at), "dd MMM yyyy HH:mm");
    return `${start} - ${end}`;
  } catch {
    return "—";
  }
}

function getProgramLabel(program: Program) {
  return PROGRAM_OPTIONS.find((opt) => opt.value === program)?.label ?? program;
}

function statusToneClasses(status: EventStatus) {
  switch (status) {
    case "open":
      return "border-green-200 bg-green-50 text-green-700";
    case "ongoing":
      return "border-yellow-200 bg-yellow-50 text-yellow-700";
    case "closed":
      return "border-gray-300 bg-gray-100 text-gray-700";
    default:
      return "border-border bg-surface text-foreground";
  }
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function toDatetimeInputValue(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}
