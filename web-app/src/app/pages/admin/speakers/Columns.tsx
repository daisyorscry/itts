import * as Icons from 'lucide-react';
import { Button } from '@components/ui/button';
import * as DropdownMenuUI from '@components/ui/dropdown-menu';
import * as LayoutUI from '@components/ui/layout';
import { Text } from '@components/ui/text';
import { type DataTableColumn } from '@components/ui/table';
import type { Speaker } from '@feature/event/types';

interface CreateSpeakerColumnsOptions {
  isDeleting: boolean;
  getEventTitle: (eventId: string) => string;
  onView: (speaker: Speaker) => void;
  onEdit: (speaker: Speaker) => void;
  onDelete: (speaker: Speaker) => void;
}

interface SpeakerActionsMenuProps {
  speaker: Speaker;
  isDeleting: boolean;
  onView: (speaker: Speaker) => void;
  onEdit: (speaker: Speaker) => void;
  onDelete: (speaker: Speaker) => void;
}

function SpeakerActionsMenu({
  speaker,
  isDeleting,
  onView,
  onEdit,
  onDelete,
}: SpeakerActionsMenuProps) {
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
            onClick={() => onView(speaker)}
          >
            <Icons.Eye className="text-black/70" />
            View Details
          </DropdownMenuUI.DropdownMenuItem>
          <DropdownMenuUI.DropdownMenuItem
            className="rounded-lg px-3 py-2.5 text-[#04090C] focus:bg-black/5 focus:text-[#04090C]"
            onClick={() => onEdit(speaker)}
          >
            <Icons.Edit className="text-black/70" />
            Edit Speaker
          </DropdownMenuUI.DropdownMenuItem>

          <DropdownMenuUI.DropdownMenuSeparator className="my-1.5 bg-black/10" />
          <DropdownMenuUI.DropdownMenuItem
            variant="destructive"
            className="rounded-lg px-3 py-2.5"
            disabled={isDeleting}
            onClick={() => onDelete(speaker)}
          >
            <Icons.Trash2 />
            Delete Speaker
          </DropdownMenuUI.DropdownMenuItem>
        </DropdownMenuUI.DropdownMenuContent>
      </DropdownMenuUI.DropdownMenu>
    </LayoutUI.Row>
  );
}

export function createSpeakerColumns({
  isDeleting,
  getEventTitle,
  onView,
  onEdit,
  onDelete,
}: CreateSpeakerColumnsOptions): Array<DataTableColumn<Speaker>> {
  return [
    {
      id: 'speaker',
      header: 'Speaker',
      cell: ({ row }) => (
        <LayoutUI.Column gap="gap-1">
          <Text variant="inverse">{row.name}</Text>
          <Text variant="muted-inverse" size="xs">{row.title || '-'}</Text>
        </LayoutUI.Column>
      ),
    },
    {
      id: 'event',
      header: 'Event',
      cell: ({ row }) => <Text variant="muted-inverse">{getEventTitle(row.event_id)}</Text>,
    },
    {
      id: 'order',
      header: 'Order',
      cell: ({ row }) => <Text variant="muted-inverse">{row.sort_order}</Text>,
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      cell: ({ row }) => (
        <SpeakerActionsMenu
          speaker={row}
          isDeleting={isDeleting}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ),
    },
  ];
}
