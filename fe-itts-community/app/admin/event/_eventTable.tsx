// app/admin/events/EventsTable.tsx
"use client";

import { useCallback, useMemo, useState, startTransition } from "react";
import { format } from "date-fns";
import { HiMiniPlus, HiMiniPencilSquare, HiMiniTrash } from "react-icons/hi2";
import { useSetEventStatus, useDeleteEvent } from "@/feature/events";
import { useListEvents } from "@/feature/events/hooks";
import { Event, EventStatus } from "@/feature/events/adapter";
import { Column, Pagination } from "@/components/ui/Table";
import DataTable from "@/components/ui/Datatable";
import { toast } from "sonner";

const PAGE_SIZE = 10;
const STATUS_OPTIONS: EventStatus[] = ["draft", "open", "ongoing", "closed"];

function toneForStatus(s: EventStatus) {
  switch (s) {
    case "open":
      return "bg-green-100 text-green-700 border-green-200";
    case "ongoing":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "closed":
      return "bg-gray-200 text-gray-600 border-gray-200";
    default:
      return "bg-surface text-foreground/70 border-border";
  }
}

function StatusSegment({
  value,
  onChange,
  disabled,
}: {
  value: EventStatus;
  onChange: (v: EventStatus) => void;
  disabled?: boolean;
}) {
  return (
    <div className="inline-flex items-center gap-1 rounded-md border border-border p-1">
      {STATUS_OPTIONS.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            type="button"
            disabled={disabled}
            onClick={() => !active && onChange(opt)}
            className={`rounded-full px-2.5 py-1 text-xs capitalize transition border ${
              active
                ? toneForStatus(opt)
                : "hover:bg-surface/70 text-foreground/70 border-transparent"
            } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function ActionButtons({
  onAddSpeaker,
  onEdit,
  onDelete,
  disabled,
}: {
  onAddSpeaker: () => void;
  onEdit: () => void;
  onDelete: () => void;
  disabled?: boolean;
}) {
  const btnBase =
    "inline-flex items-center gap-1 border border-border rounded-md h-9 px-3 text-sm hover:bg-surface/70 transition disabled:opacity-60 disabled:cursor-not-allowed";

  return (
    <div className="flex justify-end gap-2">
      <button type="button" className={btnBase} onClick={onAddSpeaker} disabled={disabled}>
        <HiMiniPlus className="h-4 w-4" />
        <span className="hidden sm:inline">Add speaker</span>
      </button>
      <button type="button" className={btnBase} onClick={onEdit} disabled={disabled}>
        <HiMiniPencilSquare className="h-4 w-4" />
        <span className="hidden sm:inline">Edit</span>
      </button>
      <button
        type="button"
        className={`${btnBase} hover:bg-red-50 dark:hover:bg-red-900/20`}
        onClick={onDelete}
        disabled={disabled}
      >
        <HiMiniTrash className="h-4 w-4" />
        <span className="hidden sm:inline">Delete</span>
      </button>
    </div>
  );
}

export default function EventsTable({ onAddSpeaker, onEdit, onCreate }: {
  onAddSpeaker: (ev: Event) => void;
  onEdit: (ev: Event) => void;
  onCreate: () => void;
}) {
  const [page, setPage] = useState(1);

  const { data: evRes, isLoading } = useListEvents({
    page,
    page_size: PAGE_SIZE,
    sort: ["-created_at"],
  });

  const setStatus = useSetEventStatus();
  const del = useDeleteEvent();

  const data = evRes?.data ?? [];
  const total = evRes?.total ?? 0;
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

  const handleSetStatus = useCallback(
    (row: Event, s: EventStatus) => {
      startTransition(() => {
        setStatus.mutate(
          { id: row.id, status: s },
          {
            onSuccess: () => toast.success(`Status "${row.title}" diubah ke ${s}`),
            onError: (e: any) => toast.error(e?.message ?? "Gagal mengubah status"),
          }
        );
      });
    },
    [setStatus]
  );

  const handleDelete = useCallback(
    (row: Event) => {
      if (!window.confirm(`Hapus event "${row.title}"?`)) return;
      startTransition(() => {
        del.mutate(row.id, {
          onSuccess: () => toast.success(`"${row.title}" telah dihapus`),
          onError: (e: any) => toast.error(e?.message ?? "Gagal menghapus event"),
        });
      });
    },
    [del]
  );

  const columns: Column<Event>[] = useMemo(
    () => [
      {
        key: "title",
        header: "Title",
        render: (row) => (
          <div>
            <div className="font-medium line-clamp-1">{row.title}</div>
            <div className="opacity-70">{row.slug ? `/${row.slug}` : "—"}</div>
          </div>
        ),
        sortable: true,
        sortFn: (a, b) => a.title.localeCompare(b.title),
        minWidth: 220,
      },
      {
        key: "program",
        header: "Program",
        accessor: "program",
        render: (row) => <span className="capitalize">{row.program ?? "—"}</span>,
        width: "160px",
      },
      {
        key: "schedule",
        header: "Jadwal",
        render: (row) =>
          row.starts_at
            ? `${format(new Date(row.starts_at), "dd MMM yyyy HH:mm")}${
                row.ends_at ? ` · ${format(new Date(row.ends_at), "dd MMM yyyy HH:mm")}` : ""
              }`
            : "—",
        width: "280px",
      },
      {
        key: "status",
        header: "Status",
        render: (row) => (
          <StatusSegment
            value={row.status}
            disabled={setStatus.isPending}
            onChange={(s) => handleSetStatus(row, s)}
          />
        ),
        width: "300px",
      },
      {
        key: "actions",
        header: <span className="inline-block w-full text-right">Actions</span>,
        align: "right",
        render: (row) => (
          <ActionButtons
            disabled={del.isPending}
            onAddSpeaker={() => onAddSpeaker(row)}
            onEdit={() => onEdit(row)}
            onDelete={() => handleDelete(row)}
          />
        ),
        width: "320px",
      },
    ],
    [del.isPending, handleDelete, handleSetStatus, onAddSpeaker, onEdit, setStatus.isPending]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div />
        <button type="button" className="btn btn-primary" onClick={onCreate}>
          Buat Event
        </button>
      </div>

      <DataTable<Event>
        data={data}
        columns={columns}
        loading={isLoading}
        emptyText="Belum ada event."
        skeletonRows={5}
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
      />
    </div>
  );
}
