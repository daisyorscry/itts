import * as Icons from 'lucide-react';
import { QueryStatePanel } from '@components/query-state-panel';

interface MentorsQueryStateProps {
  type: 'loading' | 'error' | 'empty';
}

export function MentorsQueryState({ type }: MentorsQueryStateProps) {
  if (type === 'loading') {
    return (
      <section className="rounded-3xl border border-transparent bg-black/5 p-12 text-center">
        <div className="inline-block size-8 animate-spin rounded-full border-4 border-black/20 border-t-[#29E68C]" />
        <p className="mt-4 font-['Outfit'] text-sm text-black/60">
          Loading mentors...
        </p>
      </section>
    );
  }

  if (type === 'error') {
    return (
      <QueryStatePanel
        tone="error"
        icon={Icons.AlertCircle}
        title="Failed to load mentors"
        description="Please try again later"
        className="p-8"
      />
    );
  }

  return (
    <QueryStatePanel
      icon={Icons.Users}
      title="No mentors found"
      description="Create your first mentor to get started."
    />
  );
}
