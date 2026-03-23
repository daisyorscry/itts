import * as Icons from 'lucide-react';
import { QueryStatePanel } from '@components/query-state-panel';

interface RolesQueryStateProps {
  type: 'loading' | 'error' | 'empty';
  search: string;
}

export function RolesQueryState({ type, search }: RolesQueryStateProps) {
  if (type === 'loading') {
    return (
      <section className="rounded-3xl border border-transparent bg-black/5 p-12 text-center">
        <div className="inline-block size-8 animate-spin rounded-full border-4 border-black/20 border-t-[#29E68C]" />
        <p className="mt-4 font-['Outfit'] text-sm text-black/60">
          Loading roles...
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
        title="Failed to load roles"
        description="Please try again later"
        className="p-8"
      />
    );
  }

  return (
    <QueryStatePanel
      icon={Icons.Shield}
      title="No roles found"
      description={search ? 'Try adjusting your search filters' : 'Create your first role to get started'}
    />
  );
}
