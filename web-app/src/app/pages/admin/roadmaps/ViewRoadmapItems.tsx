import { useState } from 'react';
import * as Icons from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import * as CardUI from '@components/ui/card';
import * as LayoutUI from '@components/ui/layout';
import { DataTable, type DataTableColumn } from '@components/ui/table';
import { Text } from '@components/ui/text';
import { useDeleteRoadmapItem, useListRoadmapItems, useRoadmap } from '@feature/roadmap/hooks';
import { type RoadmapItem } from '@feature/roadmap/types';
import { RoadmapItemCreateModal } from '@pages/admin/roadmaps/ViewCreateRoadmapItem';
import { RoadmapItemEditModal } from '@pages/admin/roadmaps/ViewEditRoadmapItem';

export function AdminRoadmapItems() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isCreateItemOpen, setIsCreateItemOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<RoadmapItem | null>(null);
  const { data: roadmap, isLoading, error } = useRoadmap(id ?? '', Boolean(id));
  const { data: roadmapItemsResponse } = useListRoadmapItems({
    roadmap_id: id || undefined,
    page: 1,
    page_size: 100,
  });
  const { mutate: deleteRoadmapItem, isPending: isDeletingItem } = useDeleteRoadmapItem();
  const roadmapItems = roadmapItemsResponse?.data ?? [];

  const roadmapItemColumns: Array<DataTableColumn<RoadmapItem>> = [
    {
      id: 'item_text',
      header: 'Item',
      cell: ({ row }) => (
        <Text variant="inverse" className="break-words">
          {row.item_text}
        </Text>
      ),
    },
    {
      id: 'sort_order',
      header: 'Sort Order',
      width: '140px',
      cell: ({ row }) => <Text variant="muted-inverse">{row.sort_order}</Text>,
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      width: '190px',
      cell: ({ row }) => (
        <LayoutUI.Row justify="justify-end" gap="gap-2" className="w-full">
          <Button type="button" onClick={() => setEditingItem(row)} variant="soft-action" size="sm">
            <Icons.Pencil className="size-4" />
            Edit
          </Button>
          <Button type="button" disabled={isDeletingItem} onClick={() => deleteRoadmapItem(row.id)} variant="destructive" size="sm">
            <Icons.Trash2 className="size-4" />
            Delete
          </Button>
        </LayoutUI.Row>
      ),
    },
  ];

  if (!id) {
    return (
      <CardUI.Card tone="inverse">
        <CardUI.CardContent padding="auth">
          <LayoutUI.Column gap="gap-4" className="p-6 text-center">
            <Text variant="inverse" className="font-medium">Roadmap not found</Text>
            <Button onClick={() => navigate('/admin/roadmaps')} variant="accent" size="form">
              Back to Roadmaps
            </Button>
          </LayoutUI.Column>
        </CardUI.CardContent>
      </CardUI.Card>
    );
  }

  if (isLoading) {
    return (
      <CardUI.Card tone="inverse">
        <CardUI.CardContent padding="auth">
          <div className="p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-[#29E68C]" />
            <Text className="mt-4" variant="muted-inverse">Loading roadmap items...</Text>
          </div>
        </CardUI.CardContent>
      </CardUI.Card>
    );
  }

  if (error || !roadmap) {
    return (
      <CardUI.Card tone="inverse">
        <CardUI.CardContent padding="auth">
          <LayoutUI.Column gap="gap-4" className="p-6 text-center">
            <Text variant="inverse" className="font-medium">
              {error ? 'Error loading roadmap' : 'Roadmap not found'}
            </Text>
            <Button onClick={() => navigate('/admin/roadmaps')} variant="accent" size="form">
              Back to Roadmaps
            </Button>
          </LayoutUI.Column>
        </CardUI.CardContent>
      </CardUI.Card>
    );
  }

  return (
    <LayoutUI.Column gap="gap-6">
      <LayoutUI.Row justify="justify-between" align="items-start" className="gap-4 max-md:flex-col">
        <LayoutUI.Row gap="gap-4">
          <Button type="button" onClick={() => navigate(`/admin/roadmaps/${roadmap.id}`)} variant="ghost-inverse" size="icon" className="rounded-xl border border-black/10 bg-black/5">
            <Icons.ArrowLeft size={20} />
          </Button>
          <LayoutUI.Column gap="gap-2">
            <Text as="h1" variant="inverse" className="font-['Sora'] text-3xl font-bold">
              Roadmap Items
            </Text>
            <Text variant="muted-inverse">
              Manage milestone items for {roadmap.title}
            </Text>
          </LayoutUI.Column>
        </LayoutUI.Row>
        <Button type="button" onClick={() => setIsCreateItemOpen(true)} variant="accent" size="form">
          <Icons.Plus size={18} />
          Add Item
        </Button>
      </LayoutUI.Row>

      <CardUI.Card border={false} tone="inverse">
          <LayoutUI.Container surface="panel-soft" padding="md" radius="xl">
            <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <LayoutUI.Column gap="gap-1">
                <Text variant="muted-inverse" className="text-xs font-medium">Roadmap</Text>
                <Text variant="inverse" className="text-sm font-medium">{roadmap.title}</Text>
              </LayoutUI.Column>
              <LayoutUI.Column gap="gap-1">
                <Text variant="muted-inverse" className="text-xs font-medium">Program</Text>
                <Text variant="inverse" className="text-sm font-medium capitalize">{roadmap.program || 'General'}</Text>
              </LayoutUI.Column>
              <LayoutUI.Column gap="gap-1">
                <Text variant="muted-inverse" className="text-xs font-medium">Total Items</Text>
                <Text variant="inverse" className="text-sm font-medium">{roadmapItems.length}</Text>
              </LayoutUI.Column>
            </LayoutUI.Container>
          </LayoutUI.Container>
      </CardUI.Card>

      <CardUI.Card tone="inverse" className="overflow-hidden">
        <CardUI.CardHeader className="border-b border-black/10 pb-5">
          <LayoutUI.Row justify="justify-between" align="items-center" className="gap-3 max-sm:flex-col max-sm:items-start">
            <Text as="h3" variant="inverse" size="lg" className="font-semibold">
              Roadmap Items
            </Text>
            <Badge variant="secondary">
              {roadmapItems.length} total
            </Badge>
          </LayoutUI.Row>
        </CardUI.CardHeader>

        <CardUI.CardContent className="py-2">
          <DataTable
            data={roadmapItems}
            columns={roadmapItemColumns}
            rowKey="id"
            emptyMessage="No roadmap items yet."
          />
        </CardUI.CardContent>
      </CardUI.Card>

      <RoadmapItemCreateModal
        roadmap={roadmap}
        isOpen={isCreateItemOpen}
        onClose={() => setIsCreateItemOpen(false)}
      />
      <RoadmapItemEditModal
        roadmap={roadmap}
        item={editingItem}
        isOpen={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
      />
    </LayoutUI.Column>
  );
}
