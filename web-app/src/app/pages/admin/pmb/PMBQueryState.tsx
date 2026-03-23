import * as Icons from 'lucide-react';
import { QueryStatePanel } from '@components/query-state-panel';

interface PMBQueryStateProps {
  type: 'loading' | 'error' | 'empty';
  scope: 'applicants' | 'applications' | 'documents' | 'evaluations' | 'payments' | 'results' | 'tracks' | 'faculties' | 'programs';
}

const labels = {
  applicants: 'applicants',
  applications: 'applications',
  documents: 'documents',
  evaluations: 'evaluation queues',
  payments: 'pending payments',
  results: 'result queues',
  tracks: 'admission tracks',
  faculties: 'faculties',
  programs: 'study programs',
} as const;

export function PMBQueryState({ type, scope }: PMBQueryStateProps) {
  if (type === 'loading') {
    return (
      <section className="rounded-3xl border border-transparent bg-black/5 p-12 text-center">
        <div className="inline-block size-8 animate-spin rounded-full border-4 border-black/20 border-t-[#29E68C]" />
        <p className="mt-4 font-['Outfit'] text-sm text-black/60">
          Loading {labels[scope]}...
        </p>
      </section>
    );
  }

  if (type === 'error') {
    return (
      <QueryStatePanel
        tone="error"
        icon={Icons.AlertCircle}
        title={`Failed to load ${labels[scope]}`}
        description="Please try again later"
        className="p-8"
      />
    );
  }

  return (
    <QueryStatePanel
      icon={Icons.GraduationCap}
      title={`No ${labels[scope]} found`}
      description="Try adjusting your filters or seed PMB data first."
    />
  );
}
