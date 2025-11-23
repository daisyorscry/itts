'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

type Values = {
  name: string;
  title?: string;
  avatar_url?: string;
  sort_order?: number;
};

export default function SpeakerFormModal({
  open,
  onClose,
  eventId,
  initial,
  onSubmit,
  submitting,
}: {
  open: boolean;
  onClose: () => void;
  eventId: string;
  initial?: {
    id: string;
    name: string;
    title?: string;
    avatar_url?: string;
    sort_order?: number;
  };
  onSubmit: (v: { event_id: string } & Values) => Promise<void> | void;
  submitting?: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<Values>({
    defaultValues: initial
      ? {
          name: initial.name,
          title: initial.title ?? '',
          avatar_url: initial.avatar_url ?? '',
          sort_order: initial.sort_order ?? 0,
        }
      : { name: '', title: '', avatar_url: '', sort_order: 0 },
  });

  useEffect(() => {
    if (open) document.body.classList.add('modal-open');
    return () => document.body.classList.remove('modal-open');
  }, [open]);

  if (!open) return null;

  const submit = (v: Values) =>
    onSubmit({
      event_id: eventId,
      ...v,
      sort_order: Number.isFinite(v.sort_order as any) ? Number(v.sort_order) : undefined,
    });

  return (
    <>
      <div className="modal-overlay" onClick={onClose} aria-hidden />
      <div role="dialog" aria-modal="true" className="modal-shell">
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
          <form className="m-0" onSubmit={(e) => e.preventDefault()}>
            <header className="border-b border-border p-5">
              <h3 className="text-lg font-semibold">
                {initial ? 'Edit Speaker' : 'Tambah Speaker'}
              </h3>
            </header>

            <div className="flex-1 overflow-y-auto p-5 grid gap-3">
              <label className="grid gap-1">
                <span className="text-sm font-medium">Nama</span>
                <input className="input" placeholder="Nama speaker" {...register('name', { required: true })} />
              </label>

              <label className="grid gap-1">
                <span className="text-sm font-medium">Title</span>
                <input className="input" placeholder="Jabatan / Role" {...register('title')} />
              </label>

              <label className="grid gap-1">
                <span className="text-sm font-medium">Avatar URL</span>
                <input className="input" placeholder="https://..." {...register('avatar_url')} />
              </label>

              <label className="grid gap-1">
                <span className="text-sm font-medium">Sort Order</span>
                <input type="number" className="input" {...register('sort_order')} />
              </label>
            </div>

            <footer className="flex justify-end gap-2 border-t border-border p-5">
              <button type="button" onClick={onClose} className="btn btn-outline">Batal</button>
              <button
                type="button"
                className="btn btn-primary disabled:opacity-60"
                disabled={isSubmitting || submitting}
                onClick={() => handleSubmit(submit)()}
              >
                {submitting ? 'Menyimpan...' : 'Simpan'}
              </button>
            </footer>
          </form>
        </div>
      </div>
    </>
  );
}
