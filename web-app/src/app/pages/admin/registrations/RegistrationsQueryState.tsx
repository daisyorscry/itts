import * as Icons from 'lucide-react';
import { QueryStatePanel } from '@components/query-state-panel';

interface RegistrationsQueryStateProps {
  type: 'loading' | 'error' | 'empty';
  scope: 'members' | 'events';
}

const labels = {
  members: {
    loading: 'Loading registrations...',
    errorTitle: 'Failed to load registrations',
    emptyTitle: 'No registrations found',
    emptyDescription: 'Member registrations will appear here once users sign up.',
    icon: Icons.Users,
  },
  events: {
    loading: 'Loading event registrations...',
    errorTitle: 'Failed to load event registrations',
    emptyTitle: 'No event registrations found',
    emptyDescription: 'Event attendee data will appear here once people register.',
    icon: Icons.CalendarRange,
  },
} as const;

export function RegistrationsQueryState({ type, scope }: RegistrationsQueryStateProps) {
  const content = labels[scope];

  if (type === 'loading') {
    return (
      <section className="rounded-3xl border border-transparent bg-black/5 p-12 text-center">
        <div className="inline-block size-8 animate-spin rounded-full border-4 border-black/20 border-t-[#29E68C]" />
        <p className="mt-4 font-['Outfit'] text-sm text-black/60">
          {content.loading}
        </p>
      </section>
    );
  }

  if (type === 'error') {
    return (
      <QueryStatePanel
        tone="error"
        icon={Icons.AlertCircle}
        title={content.errorTitle}
        description="Please try again later."
        className="p-8"
      />
    );
  }

  return (
    <QueryStatePanel
      icon={content.icon}
      title={content.emptyTitle}
      description={content.emptyDescription}
    />
  );
}
