import * as Icons from 'lucide-react';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import * as DropdownMenuUI from '@components/ui/dropdown-menu';
import * as LayoutUI from '@components/ui/layout';
import { Text } from '@components/ui/text';
import { type DataTableColumn } from '@components/ui/table';
import type { Roadmap } from '@feature/roadmap/types';

interface CreateRoadmapColumnsOptions {
  isDeleting: boolean;
  onView: (roadmap: Roadmap) => void;
  onEdit: (roadmap: Roadmap) => void;
  onDelete: (roadmap: Roadmap) => void;
}

interface RoadmapActionsMenuProps {
  roadmap: Roadmap;
  isDeleting: boolean;
  onView: (roadmap: Roadmap) => void;
  onEdit: (roadmap: Roadmap) => void;
  onDelete: (roadmap: Roadmap) => void;
}

function RoadmapActionsMenu({
  roadmap,
  isDeleting,
  onView,
  onEdit,
  onDelete,
}: RoadmapActionsMenuProps) {
  return (
    <LayoutUI.Row justify="justify-end" className="w-full">
      <DropdownMenuUI.DropdownMenu>
        <DropdownMenuUI.DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-lg text-black/60 hover:bg-black/10 hover:text-[#04090C]"
          >
            <Icons.MoreVertical className="size-4" />
          </Button>
        </DropdownMenuUI.DropdownMenuTrigger>
        <DropdownMenuUI.DropdownMenuContent
          align="end"
          className="w-44 rounded-xl border-black/10 bg-[#F7F4EC] p-1.5"
        >
          <DropdownMenuUI.DropdownMenuItem
            className="rounded-lg px-3 py-2.5 text-[#04090C] focus:bg-black/5 focus:text-[#04090C]"
            onClick={() => onView(roadmap)}
          >
            <Icons.Eye className="text-black/70" />
            View Details
          </DropdownMenuUI.DropdownMenuItem>
          <DropdownMenuUI.DropdownMenuItem
            className="rounded-lg px-3 py-2.5 text-[#04090C] focus:bg-black/5 focus:text-[#04090C]"
            onClick={() => onEdit(roadmap)}
          >
            <Icons.Edit className="text-black/70" />
            Edit Roadmap
          </DropdownMenuUI.DropdownMenuItem>
          <DropdownMenuUI.DropdownMenuSeparator className="my-1.5 bg-black/10" />
          <DropdownMenuUI.DropdownMenuItem
            variant="destructive"
            className="rounded-lg px-3 py-2.5"
            disabled={isDeleting}
            onClick={() => onDelete(roadmap)}
          >
            <Icons.Trash2 />
            Delete Roadmap
          </DropdownMenuUI.DropdownMenuItem>
        </DropdownMenuUI.DropdownMenuContent>
      </DropdownMenuUI.DropdownMenu>
    </LayoutUI.Row>
  );
}

export function createRoadmapColumns({
  isDeleting,
  onView,
  onEdit,
  onDelete,
}: CreateRoadmapColumnsOptions): Array<DataTableColumn<Roadmap>> {
  return [
    {
      id: 'roadmap',
      header: 'Roadmap',
      cell: ({ row }) => (
        <LayoutUI.Column gap="gap-1">
          <Text variant="inverse">{row.title}</Text>
          <Text variant="muted-inverse" size="xs">{row.program || 'general'}</Text>
        </LayoutUI.Column>
      ),
    },
    {
      id: 'month',
      header: 'Month',
      cell: ({ row }) => <Text variant="muted-inverse">{row.month_number}</Text>,
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.is_active ? 'success' : 'destructive'} className="rounded-full px-2 py-1 [&>svg]:size-3.5">
          {row.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      cell: ({ row }) => (
        <RoadmapActionsMenu
          roadmap={row}
          isDeleting={isDeleting}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ),
    },
  ];
}
