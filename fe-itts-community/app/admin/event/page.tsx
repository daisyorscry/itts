// app/admin/events/page.tsx
"use client";

import { useState } from "react";
import EventFormModal from "@/components/ui/EventFormModal";
import SpeakerFormModal from "@/components/ui/SpeakerFormModal";
import { useCreateEvent, useUpdateEvent } from "@/feature/events";
import EventsTable from "./_eventTable";
import { type Event } from "@/feature/events/adapter";

export default function AdminEventsPage() {
  const [openEvent, setOpenEvent] = useState(false);
  const [editEvent, setEditEvent] = useState<Event | null>(null);

  const [openSpeaker, setOpenSpeaker] = useState(false);
  const [eventForSpeaker, setEventForSpeaker] = useState<Event | null>(null);

  const createEv = useCreateEvent({ onSuccess: () => setOpenEvent(false) });
  const updateEv = useUpdateEvent({ onSuccess: () => setOpenEvent(false) });

  const handleCreateEvent = () => {
    setEditEvent(null); // pastikan form kosong
    setOpenEvent(true);
  };

  const handleEditEvent = (ev: Event) => {
    setEditEvent(ev);
    setOpenEvent(true);
  };

  const handleAddSpeaker = (ev: Event) => {
    setEventForSpeaker(ev);
    setOpenSpeaker(true);
  };

  return (
    <section className="section">
      <div className="container space-y-6">
        <header>
          <h1 className="text-2xl font-semibold">Admin · Events</h1>
          <p className="text-sm opacity-80">
            Kelola event, speaker, dan registrasi peserta.
          </p>
        </header>

        <EventsTable
          onCreate={handleCreateEvent}
          onEdit={handleEditEvent}
          onAddSpeaker={handleAddSpeaker}
        />
      </div>

      {/* Modal Event */}
      {/* Modal Event */}
      {openEvent && (
        <EventFormModal
          open
          onClose={() => setOpenEvent(false)}
          initial={
            editEvent
              ? {
                  id: editEvent.id,
                  title: editEvent.title,
                  slug: editEvent.slug ?? undefined,
                  summary: editEvent.summary ?? undefined,
                  description: editEvent.description ?? undefined,
                  image_url: editEvent.image_url ?? undefined,
                  program: editEvent.program ?? undefined,
                  status: editEvent.status,
                  starts_at: editEvent.starts_at ?? "", // fallback jadi string kosong
                  ends_at: editEvent.ends_at ?? undefined,
                  venue: editEvent.venue ?? undefined,
                }
              : undefined
          }
          onSubmit={async (input) => {
            if (editEvent) {
              await updateEv.mutateAsync({ id: editEvent.id, data: input });
            } else {
              await createEv.mutateAsync(input);
            }
          }}
          submitting={createEv.isPending || updateEv.isPending}
        />
      )}

      {/* Modal Speaker */}
      {openSpeaker && eventForSpeaker && (
        <SpeakerFormModal
          open
          onClose={() => setOpenSpeaker(false)}
          eventId={eventForSpeaker.id}
          onSubmit={() => setOpenSpeaker(false)}
          submitting={false} // kamu bisa pakai useAddSpeaker disini kalau mau handle loading
        />
      )}
    </section>
  );
}
