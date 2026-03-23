import * as Icons from 'lucide-react';
import { QueryStatePanel } from '@components/query-state-panel';

interface UsersQueryStateProps {
  type: 'loading' | 'error' | 'empty';
  search: string;
}

export function UsersQueryState({ type, search }: UsersQueryStateProps) {
  if (type === 'loading') {
    return (
      <section className="rounded-3xl border border-transparent bg-black/5 p-12 text-center">
        <div className="inline-block size-8 animate-spin rounded-full border-4 border-black/20 border-t-[#29E68C]" />
        <p className="mt-4 font-['Outfit'] text-sm text-black/60">
          Loading users...
        </p>
      </section>
    );
  }

  if (type === 'error') {
    return (
      <QueryStatePanel
        tone="error"
        icon={Icons.AlertCircle}
        iconClassName="size-12 text-red-400"
        title="Failed to load users"
        description="Please try again later"
        className="p-8"
      />
    );
  }

  return (
    <QueryStatePanel
      icon={Icons.Users}
      title="No users found"
      description={search ? 'Try adjusting your search filters' : 'Add your first user to get started'}
    />
  );
}
