// components/ui/EventFormModal.tsx
"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  HiMiniTag,
  HiMiniLink,
  HiMiniPhoto,
  HiMiniMapPin,
  HiMiniCalendarDays,
  HiMiniClock,
  HiMiniDocumentText,
  HiMiniPresentationChartLine,
} from "react-icons/hi2";

type Program = "networking" | "devsecops" | "programming";
type Status = "draft" | "open" | "ongoing" | "closed";

type Values = {
  title: string;
  slug?: string;
  summary?: string;
  description?: string;
  image_url?: string;
  program?: Program | "";
  status?: Status;
  starts_at: string; // datetime-local
  ends_at?: string;
  venue?: string;
};

export default function EventFormModal({
  open,
  onClose,
  initial,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onClose: () => void;
  initial?: {
    id: string;
    title: string;
    slug?: string;
    summary?: string;
    description?: string;
    image_url?: string;
    program?: Program;
    status: Status;
    starts_at: string; // ISO
    ends_at?: string; // ISO
    venue?: string;
  };
  onSubmit: (v: {
    title: string;
    slug?: string;
    summary?: string;
    description?: string;
    image_url?: string;
    program?: Program;
    status?: Status;
    starts_at: string; // ISO
    ends_at?: string; // ISO
    venue?: string;
  }) => Promise<void> | void;
  submitting?: boolean;
}) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<Values>({
    defaultValues: initial
      ? {
          title: initial.title,
          slug: initial.slug ?? "",
          summary: initial.summary ?? "",
          description: initial.description ?? "",
          image_url: initial.image_url ?? "",
          program: initial.program ?? "",
          status: initial.status,
          starts_at: initial.starts_at ? toLocal(initial.starts_at) : "",
          ends_at: initial.ends_at ? toLocal(initial.ends_at) : "",
          venue: initial.venue ?? "",
        }
      : {
          title: "",
          slug: "",
          summary: "",
          description: "",
          image_url: "",
          program: "",
          status: "draft",
          starts_at: "",
          ends_at: "",
          venue: "",
        },
  });

  useEffect(() => {
    if (open) document.body.classList.add("modal-open");
    return () => document.body.classList.remove("modal-open");
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      reset({
        title: initial.title,
        slug: initial.slug ?? "",
        summary: initial.summary ?? "",
        description: initial.description ?? "",
        image_url: initial.image_url ?? "",
        program: initial.program ?? "",
        status: initial.status,
        starts_at: initial.starts_at ? toLocal(initial.starts_at) : "",
        ends_at: initial.ends_at ? toLocal(initial.ends_at) : "",
        venue: initial.venue ?? "",
      });
    } else {
      reset({
        title: "",
        slug: "",
        summary: "",
        description: "",
        image_url: "",
        program: "",
        status: "draft",
        starts_at: "",
        ends_at: "",
        venue: "",
      });
    }
  }, [initial, open, reset]);

  const titleVal = useWatch({ control, name: "title" });
  const slugVal = useWatch({ control, name: "slug" });
  useEffect(() => {
    if (!initial && (!slugVal || slugVal === slugify(""))) {
      setValue("slug", slugify(titleVal || ""));
    }
  }, [titleVal]); // eslint-disable-line

  if (!open) return null;

  const submit = (v: Values) =>
    onSubmit({
      title: v.title.trim(),
      slug: v.slug?.trim() || undefined,
      summary: v.summary?.trim() || undefined,
      description: v.description?.trim() || undefined,
      image_url: v.image_url?.trim() || undefined,
      program: (v.program as Program) || undefined,
      status: v.status || "draft",
      starts_at: v.starts_at ? new Date(v.starts_at).toISOString() : "",
      ends_at: v.ends_at ? new Date(v.ends_at).toISOString() : undefined,
      venue: v.venue?.trim() || undefined,
    });

  return (
    <>
      <div className="modal-overlay" onClick={onClose} aria-hidden />
      <div role="dialog" aria-modal="true" className="modal-shell">
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <header className="border-b border-border p-5 sticky top-0 bg-surface">
            <h3 className="text-lg font-semibold">
              {initial ? "Edit Event" : "Buat Event"}
            </h3>
          </header>

          {/* Body */}
          <form
            className="flex-1 overflow-y-auto p-5 grid gap-4"
            onSubmit={(e) => e.preventDefault()}
          >
            <Field
              label="Judul"
              error={errors.title?.message}
              icon={<HiMiniDocumentText className="h-4 w-4" />}
            >
              <input
                className="input"
                style={{ ["--inset-left" as any]: "2.25rem" }}
                placeholder="Judul acara"
                {...register("title", {
                  required: "Wajib diisi",
                  minLength: { value: 3, message: "Min. 3 karakter" },
                })}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Slug"
                hint="huruf kecil dan tanda hubung"
                icon={<HiMiniLink className="h-4 w-4" />}
              >
                <input
                  className="input"
                  style={{ ["--inset-left" as any]: "2.25rem" }}
                  placeholder="slug-unik"
                  {...register("slug")}
                />
              </Field>

              <Field label="Program" icon={<HiMiniTag className="h-4 w-4" />}>
                <select
                  className="select"
                  style={{ ["--inset-left" as any]: "2.25rem" }}
                  {...register("program")}
                >
                  <option value="">—</option>
                  <option value="networking">Networking</option>
                  <option value="devsecops">DevSecOps</option>
                  <option value="programming">Programming</option>
                </select>
              </Field>
            </div>

            <Field
              label="Ringkasan"
              icon={<HiMiniPresentationChartLine className="h-4 w-4" />}
            >
              <input
                className="input"
                style={{ ["--inset-left" as any]: "2.25rem" }}
                placeholder="Ringkasan singkat"
                {...register("summary")}
              />
            </Field>

            <Field label="Deskripsi">
              <textarea
                className="textarea"
                rows={5}
                placeholder="Detail deskripsi acara"
                {...register("description")}
              />
            </Field>

            <Field label="Image URL" icon={<HiMiniPhoto className="h-4 w-4" />}>
              <input
                className="input"
                style={{ ["--inset-left" as any]: "2.25rem" }}
                placeholder="https://..."
                {...register("image_url")}
              />
            </Field>

            <Field label="Venue" icon={<HiMiniMapPin className="h-4 w-4" />}>
              <input
                className="input"
                style={{ ["--inset-left" as any]: "2.25rem" }}
                placeholder="Lokasi"
                {...register("venue")}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field
                label="Waktu Mulai"
                error={errors.starts_at?.message}
                icon={<HiMiniCalendarDays className="h-4 w-4" />}
                className="sm:col-span-2"
              >
                <input
                  type="datetime-local"
                  className="input"
                  style={{ ["--inset-left" as any]: "2.25rem" }}
                  {...register("starts_at", { required: "Wajib diisi" })}
                />
              </Field>

              <Field
                label="Waktu Selesai"
                icon={<HiMiniClock className="h-4 w-4" />}
              >
                <input
                  type="datetime-local"
                  className="input"
                  style={{ ["--inset-left" as any]: "2.25rem" }}
                  {...register("ends_at")}
                />
              </Field>
            </div>

            <Field label="Status">
              <select className="select" {...register("status")}>
                <option value="draft">draft</option>
                <option value="open">open</option>
                <option value="ongoing">ongoing</option>
                <option value="closed">closed</option>
              </select>
            </Field>
          </form>

          {/* Footer */}
          <footer className="flex justify-end gap-2 border-t border-border p-5 sticky bottom-0 bg-surface">
            <button type="button" onClick={onClose} className="btn btn-outline">
              Batal
            </button>
            <button
              type="button"
              className="btn btn-primary disabled:opacity-60"
              disabled={isSubmitting || submitting}
              onClick={() => handleSubmit(submit)()}
            >
              {submitting ? "Menyimpan..." : initial ? "Simpan" : "Buat"}
            </button>
          </footer>
        </div>
      </div>
    </>
  );
}

function Field({
  label,
  hint,
  error,
  icon,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  error?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`grid gap-1 ${className}`}>
      <span className="text-sm font-medium">{label}</span>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-foreground/60">
            {icon}
          </span>
        )}
        {children}
      </div>
      {hint && !error && <p className="text-xs opacity-60">{hint}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function toLocal(iso: string) {
  try {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
      d.getDate()
    )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
}
