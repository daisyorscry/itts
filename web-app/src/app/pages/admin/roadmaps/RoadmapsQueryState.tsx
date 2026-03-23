import * as Icons from 'lucide-react';
import { QueryStatePanel } from '@components/query-state-panel';

interface RoadmapsQueryStateProps {
  type: 'loading' | 'error' | 'empty';
}

export function RoadmapsQueryState({ type }: RoadmapsQueryStateProps) {
  if (type === 'loading') {
    return (
      <section className="rounded-3xl border border-transparent bg-black/5 p-12 text-center">
        <div className="inline-block size-8 animate-spin rounded-full border-4 border-black/20 border-t-[#29E68C]" />
        <p className="mt-4 font-['Outfit'] text-sm text-black/60">
          Loading roadmaps...
        </p>
      </section>
    );
  }

  if (type === 'error') {
    return (
      <QueryStatePanel
        tone="error"
        icon={Icons.AlertCircle}
        title="Failed to load roadmaps"
        description="Please try again later."
        className="p-8"
      />
    );
  }

  return (
    <QueryStatePanel
      icon={Icons.Map}
      title="No roadmaps found"
      description="Create your first roadmap to start organizing milestones."
    />
  );
}
