import * as Icons from 'lucide-react';
import { QueryStatePanel } from '@components/query-state-panel';

interface SpeakersQueryStateProps {
  type: 'loading' | 'error' | 'empty';
}

export function SpeakersQueryState({ type }: SpeakersQueryStateProps) {
  if (type === 'loading') {
    return (
      <section className="rounded-3xl border border-transparent bg-black/5 p-12 text-center">
        <div className="inline-block size-8 animate-spin rounded-full border-4 border-black/20 border-t-[#29E68C]" />
        <p className="mt-4 font-['Outfit'] text-sm text-black/60">
          Loading speakers...
        </p>
      </section>
    );
  }

  if (type === 'error') {
    return (
      <QueryStatePanel
        tone="error"
        icon={Icons.AlertCircle}
        title="Failed to load speakers"
        description="Please try again later."
        className="p-8"
      />
    );
  }

  return (
    <QueryStatePanel
      icon={Icons.Mic2}
      title="No speakers found"
      description="Add your first speaker to get started."
    />
  );
}
