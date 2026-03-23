import { useState } from 'react';
import * as Icons from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '@components/ui/button';
import * as CardUI from '@components/ui/card';
import * as LayoutUI from '@components/ui/layout';
import { DataPagination } from '@components/ui/pagination';
import { SearchField } from '@components/ui/search';
import { DataTable } from '@components/ui/table';
import { Text } from '@components/ui/text';
import {
  useDeleteRoadmap,
  useListRoadmaps,
} from '@feature/roadmap/hooks';
import type { RoadmapListResponse } from '@feature/roadmap/types';
import { createRoadmapColumns } from '@pages/admin/roadmaps/Columns';
import { RoadmapsQueryState } from '@pages/admin/roadmaps/RoadmapsQueryState';

export function AdminRoadmaps() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = useListRoadmaps({
    page,
    page_size: pageSize,
    search: search || undefined,
  });
  const { mutate: deleteRoadmap, isPending: deletingRoadmap } = useDeleteRoadmap();

  const roadmapResponse: RoadmapListResponse | null = data ?? null;
  const roadmaps = roadmapResponse?.data ?? [];
  const hasRoadmaps = roadmaps.length > 0;

  const roadmapColumns = createRoadmapColumns({
    isDeleting: deletingRoadmap,
    onView: (roadmap) => navigate(`/admin/roadmaps/${roadmap.id}`),
    onEdit: (roadmap) => navigate(`/admin/roadmaps/edit/${roadmap.id}`),
    onDelete: (roadmap) => deleteRoadmap(roadmap.id),
  });

  return (
    <LayoutUI.Column gap="gap-6 md:gap-8">
      <LayoutUI.Row justify="justify-between" align="items-center" className="gap-4 max-md:flex-col max-md:items-start">
        <LayoutUI.Column gap="gap-2">
          <Text as="h1" variant="inverse" className="font-['Sora'] text-3xl font-bold md:text-4xl">
            Learning Roadmaps
          </Text>
          <Text variant="muted-inverse">
            Maintain roadmap milestones and item ordering for each program.
          </Text>
        </LayoutUI.Column>
        <Button onClick={() => navigate('/admin/roadmaps/create')} variant="accent" size="form">
          <Icons.Plus />
          Create Roadmap
        </Button>
      </LayoutUI.Row>

      <LayoutUI.Row justify="justify-between" align="items-start" className="gap-4 max-xl:flex-col max-xl:items-start">
        {typeof roadmapResponse?.total === 'number' ? (
          <Text variant="muted-inverse" className="shrink-0 text-sm md:pt-2">
            Showing {(page - 1) * (roadmapResponse?.page_size ?? pageSize) + 1} to{' '}
            {Math.min(page * (roadmapResponse?.page_size ?? pageSize), roadmapResponse.total)} of{' '}
            {roadmapResponse.total} roadmaps
          </Text>
        ) : null}

        <CardUI.Card tone="inverse" border={false} className="w-full flex-1">
          <CardUI.CardContent>
            <SearchField
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search roadmaps"
            />
          </CardUI.CardContent>
        </CardUI.Card>
      </LayoutUI.Row>

      {isLoading ? <RoadmapsQueryState type="loading" /> : null}
      {!isLoading && error ? <RoadmapsQueryState type="error" /> : null}
      {!isLoading && !error && !hasRoadmaps ? <RoadmapsQueryState type="empty" /> : null}

      {!isLoading && !error && roadmapResponse && hasRoadmaps ? (
        <LayoutUI.Column>
          <CardUI.Card tone="inverse" className="overflow-hidden">
            <DataTable
              data={roadmaps}
              columns={roadmapColumns}
              rowKey="id"
              emptyMessage="No roadmaps found."
            />
          </CardUI.Card>

          <DataPagination
            pagination={roadmapResponse}
            onPageChange={setPage}
            onPageSizeChange={(value) => {
              setPageSize(value);
              setPage(1);
            }}
          />
        </LayoutUI.Column>
      ) : null}

    </LayoutUI.Column>
  );
}
