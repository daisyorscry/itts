import * as Icons from 'lucide-react';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import * as DropdownMenuUI from '@components/ui/dropdown-menu';
import * as LayoutUI from '@components/ui/layout';
import { Text } from '@components/ui/text';
import { type DataTableColumn } from '@components/ui/table';
import type { Mentor } from '@feature/mentor/types';
import { formatDate } from '@utility/date';

interface CreateMentorColumnsOptions {
  isSettingActive: boolean;
  isSettingPriority: boolean;
  isDeleting: boolean;
  onPriorityChange: (mentor: Mentor, priority: number) => void;
  onToggleActive: (mentor: Mentor) => void;
  onView: (mentor: Mentor) => void;
  onEdit: (mentor: Mentor) => void;
  onDelete: (mentor: Mentor) => void;
}

interface MentorActionsMenuProps {
  mentor: Mentor;
  isDeleting: boolean;
  onView: (mentor: Mentor) => void;
  onEdit: (mentor: Mentor) => void;
  onDelete: (mentor: Mentor) => void;
}

function MentorActionsMenu({ mentor, isDeleting, onView, onEdit, onDelete }: MentorActionsMenuProps) {
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
            onClick={() => onView(mentor)}
          >
            <Icons.Eye className="text-black/70" />
            View Details
          </DropdownMenuUI.DropdownMenuItem>
          <DropdownMenuUI.DropdownMenuItem
            className="rounded-lg px-3 py-2.5 text-[#04090C] focus:bg-black/5 focus:text-[#04090C]"
            onClick={() => onEdit(mentor)}
          >
            <Icons.Edit className="text-black/70" />
            Edit Mentor
          </DropdownMenuUI.DropdownMenuItem>
          <DropdownMenuUI.DropdownMenuSeparator className="my-1.5 bg-black/10" />
          <DropdownMenuUI.DropdownMenuItem
            variant="destructive"
            className="rounded-lg px-3 py-2.5"
            disabled={isDeleting}
            onClick={() => onDelete(mentor)}
          >
            <Icons.Trash2 />
            Delete Mentor
          </DropdownMenuUI.DropdownMenuItem>
        </DropdownMenuUI.DropdownMenuContent>
      </DropdownMenuUI.DropdownMenu>
    </LayoutUI.Row>
  );
}

export function createMentorColumns({
  isSettingActive,
  isSettingPriority,
  isDeleting,
  onPriorityChange,
  onToggleActive,
  onView,
  onEdit,
  onDelete,
}: CreateMentorColumnsOptions): Array<DataTableColumn<Mentor>> {
  return [
    {
      id: 'mentor',
      header: 'Mentor',
      cell: ({ row }) => (
        <LayoutUI.Column gap="gap-1">
          <Text variant="inverse">{row.full_name}</Text>
          <Text variant="muted-inverse" size="xs">{row.title || '-'}</Text>
        </LayoutUI.Column>
      ),
    },
    {
      id: 'programs',
      header: 'Programs',
      cell: ({ row }) => (
        <Text variant="muted-inverse">
          {row.programs?.join(', ') || '-'}
        </Text>
      ),
    },
    {
      id: 'priority',
      header: 'Priority',
      cell: ({ row }) => (
        <input
          type="number"
          defaultValue={row.priority}
          onBlur={(event) => {
            const priority = Number(event.target.value);
            if (!Number.isNaN(priority) && priority !== row.priority) {
              onPriorityChange(row, priority);
            }
          }}
          disabled={isSettingPriority}
          className="h-6 w-20 rounded-lg border border-black/10 bg-black/5 px-2 text-[#04090C]"
        />
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <button type="button" disabled={isSettingActive} onClick={() => onToggleActive(row)}>
          <Badge variant={row.is_active ? 'success' : 'destructive'}>
            {row.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </button>
      ),
    },
    {
      id: 'updated',
      header: 'Updated',
      cell: ({ row }) => <Text variant="muted-inverse">{formatDate(row.updated_at)}</Text>,
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      cell: ({ row }) => (
        <MentorActionsMenu
          mentor={row}
          isDeleting={isDeleting}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ),
    },
  ];
}
