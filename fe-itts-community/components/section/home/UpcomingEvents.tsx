// components/UpcomingEvents.tsx
"use client";

import { motion, type Variants } from "framer-motion";
import Image from "next/image";
import { HiMiniCalendarDays, HiMiniUser } from "react-icons/hi2";
import { useEffect, useMemo } from "react";
import { useListEvents } from "@/feature/events/events";
import { toast } from "sonner";

import { Event, EventStatus } from "@/feature/events/adapter";

type Status = Extract<EventStatus, "open" | "ongoing" | "closed">;

const containerVar: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, staggerChildren: 0.08 },
  },
};

const cardVar: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 12 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.25 } },
};

function StatusBadge({ status }: { status: Status }) {
  const label =
    status === "open"
      ? "Dibuka"
      : status === "ongoing"
      ? "Berlangsung"
      : "Tutup";
  const cls =
    status === "open"
      ? "bg-green-100 text-green-700"
      : status === "ongoing"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-gray-200 text-gray-500";

  return (
    <span className={`rounded-full px-2 py-0.5 text-sm font-medium ${cls}`}>
      {label}
    </span>
  );
}

function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
      <div className="h-40 w-full bg-surface animate-pulse" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-3/4 rounded bg-surface animate-pulse" />
        <div className="h-4 w-1/2 rounded bg-surface animate-pulse" />
        <div className="h-14 w-full rounded bg-surface animate-pulse" />
        <div className="h-10 w-full rounded bg-surface animate-pulse" />
      </div>
    </div>
  );
}

type UpcomingEventsProps = {
  onRegister: (event: Event) => void;
  limit?: number;
};

export default function UpcomingEvents({ onRegister, limit = 6 }: UpcomingEventsProps) {
  // Ambil event (admin endpoint via hook). Kita ambil banyak lalu filter lokal.
  const { data, isLoading, isError, error } = useListEvents({
    // kalau backend publik sediakan filter status, bisa pakai: status: "open"
    status: undefined,
    sort: ["starts_at"], // ascending
    page: 1,
    page_size: limit * 3, // ambil sedikit lebih banyak utk menutupi filter lokal
  });

  // Tampilkan toast error sekali saat error terjadi
  useEffect(() => {
    if (isError) {
      toast.error((error as any)?.message || "Gagal memuat event");
    }
  }, [isError, error]);

  const list = useMemo<Event[]>(() => {
    const rows: Event[] = data?.data ?? [];
    // filter status yang tampil
    const filtered = rows.filter(
      (ev) => ev.status === "open" || ev.status === "ongoing"
    );
    // sort ulang dengan aman kalau starts_at null
    const sorted = filtered.sort((a, b) => {
      const da = a.starts_at
        ? Date.parse(a.starts_at)
        : Number.POSITIVE_INFINITY;
      const db = b.starts_at
        ? Date.parse(b.starts_at)
        : Number.POSITIVE_INFINITY;
      return da - db;
    });
    return sorted.slice(0, limit);
  }, [data, limit]);

  return (
    <section id="events" className="section">
      <motion.div
        className="container space-y-6"
        variants={containerVar}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="flex items-center gap-2">
          <HiMiniCalendarDays className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-semibold md:text-3xl">Event Terdekat</h2>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: limit }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error (fallback UI; toast sudah di-useEffect) */}
        {!isLoading && isError && (
          <div className="card">
            <p className="text-sm opacity-80">
              Gagal memuat event. Silakan muat ulang halaman.
            </p>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && list.length === 0 && (
          <div className="card">
            <p className="text-sm opacity-80">
              Belum ada event terbuka saat ini.
            </p>
          </div>
        )}

        {/* List */}
        {!isLoading && !isError && list.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((event) => {
              const status = (
                event.status === "open" ||
                event.status === "ongoing" ||
                event.status === "closed"
                  ? event.status
                  : "closed"
              ) as Status;

              const hasDate = Boolean(event.starts_at);
              const disabled = status !== "open" || !hasDate; // tutup/ongoing atau tanpa tanggal → nonaktif
              const firstTwoSpeakers = (event.speakers ?? []).slice(0, 2);
              const speakerText =
                firstTwoSpeakers.length > 0
                  ? firstTwoSpeakers.map((s) => s.name).join(", ")
                  : "—";

              return (
                <motion.div
                  key={event.id}
                  variants={cardVar}
                  whileHover={{
                    scale: disabled ? 1.0 : 1.02,
                    y: disabled ? 0 : -4,
                    boxShadow: disabled
                      ? "0 0 0 rgba(0,0,0,0)"
                      : "0 8px 24px rgba(0,0,0,0.12)",
                  }}
                  className="overflow-hidden rounded-xl border border-border bg-background shadow-sm transition"
                >
                  {/* Gambar */}
                  <div className="relative h-40 w-full">
                    <Image
                      src={event.image_url || "/events/placeholder.jpg"}
                      alt={event.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      // kalau image_url dari domain eksternal, pastikan ada di next.config images.domains
                    />
                  </div>

                  {/* Konten */}
                  <div className="p-5 space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <strong className="block text-lg">{event.title}</strong>
                      <StatusBadge status={status} />
                    </div>

                    <div className="text-sm opacity-80">
                      {hasDate
                        ? new Date(event.starts_at as string).toLocaleString(
                            "id-ID",
                            {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : "TBA"}
                    </div>

                    <div className="flex items-center gap-2 text-xs opacity-70">
                      <HiMiniUser className="h-4 w-4" /> {speakerText}
                    </div>

                    {event.summary && (
                      <p className="text-sm opacity-80 line-clamp-3">
                        {event.summary}
                      </p>
                    )}

                    <button
                      onClick={() => onRegister(event)}
                      className="btn btn-primary mt-3 w-full disabled:opacity-60 disabled:cursor-not-allowed"
                      disabled={disabled}
                    >
                      {disabled
                        ? status === "closed"
                          ? "Tutup"
                          : hasDate
                          ? "Sedang Berlangsung"
                          : "Jadwal Menyusul"
                        : "Daftar"}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </section>
  );
}
