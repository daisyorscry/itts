import * as Icons from 'lucide-react';
import { Button } from '@components/ui/button';
import * as DropdownMenuUI from '@components/ui/dropdown-menu';
import * as LayoutUI from '@components/ui/layout';
import * as SelectUI from '@components/ui/select';
import { Text } from '@components/ui/text';
import { type DataTableColumn } from '@components/ui/table';
import type { Event, EventStatus } from '@feature/event/types';
import { formatDateTime } from '@utility/date';

interface CreateEventColumnsOptions {
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  isUpdatingStatus: boolean;
  isDeleting: boolean;
  onStatusChange: (event: Event, status: EventStatus) => void;
  onView: (event: Event) => void;
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
}

interface EventActionsMenuProps {
  event: Event;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  isDeleting: boolean;
  onView: (event: Event) => void;
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
}

function EventActionsMenu({ event, canRead, canUpdate, canDelete, isDeleting, onView, onEdit, onDelete }: EventActionsMenuProps) {
  const hasActions = canRead || canUpdate || canDelete;

  if (!hasActions) {
    return (
      <LayoutUI.Row justify="justify-end" className="w-full">
        <Text variant="muted-inverse" size="sm">No actions</Text>
      </LayoutUI.Row>
    );
  }

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
          {canRead ? (
            <DropdownMenuUI.DropdownMenuItem
              className="rounded-lg px-3 py-2.5 text-[#04090C] focus:bg-black/5 focus:text-[#04090C]"
              onClick={() => onView(event)}
            >
              <Icons.Eye className="text-black/70" />
              View Details
            </DropdownMenuUI.DropdownMenuItem>
          ) : null}
          {canUpdate ? (
            <DropdownMenuUI.DropdownMenuItem
              className="rounded-lg px-3 py-2.5 text-[#04090C] focus:bg-black/5 focus:text-[#04090C]"
              onClick={() => onEdit(event)}
            >
              <Icons.Edit className="text-black/70" />
              Edit Event
            </DropdownMenuUI.DropdownMenuItem>
          ) : null}
          {canDelete ? (
            <>
              {(canRead || canUpdate) ? <DropdownMenuUI.DropdownMenuSeparator className="my-1.5 bg-black/10" /> : null}
              <DropdownMenuUI.DropdownMenuItem
                variant="destructive"
                className="rounded-lg px-3 py-2.5"
                disabled={isDeleting}
                onClick={() => onDelete(event)}
              >
                <Icons.Trash2 />
                Delete Event
              </DropdownMenuUI.DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuUI.DropdownMenuContent>
      </DropdownMenuUI.DropdownMenu>
    </LayoutUI.Row>
  );
}

export function createEventColumns({
  canRead,
  canUpdate,
  canDelete,
  isUpdatingStatus,
  isDeleting,
  onStatusChange,
  onView,
  onEdit,
  onDelete,
}: CreateEventColumnsOptions): Array<DataTableColumn<Event>> {
  return [
    {
      id: 'event',
      header: 'Event',
      cell: ({ row }) => (
        <LayoutUI.Column gap="gap-1">
          <Text variant="inverse">{row.title}</Text>
          <Text variant="muted-inverse" size="xs">{row.venue || 'Venue TBD'}</Text>
        </LayoutUI.Column>
      ),
    },
    {
      id: 'schedule',
      header: 'Schedule',
      cell: ({ row }) => <Text variant="muted-inverse">{formatDateTime(row.starts_at)}</Text>,
    },
    {
      id: 'program',
      header: 'Program',
      cell: ({ row }) => (
        <Text variant="muted-inverse" className="capitalize">
          {row.program || 'general'}
        </Text>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <SelectUI.Select
          value={row.status}
          onValueChange={(value) => onStatusChange(row, value as EventStatus)}
          disabled={isUpdatingStatus || !canUpdate}
        >
          <SelectUI.SelectTrigger appearance="admin" className="h-auto min-w-28 rounded-lg px-2 py-1.5">
            <SelectUI.SelectValue>{row.status}</SelectUI.SelectValue>
          </SelectUI.SelectTrigger>
          <SelectUI.SelectContent appearance="admin">
            <SelectUI.SelectItem value="draft">Draft</SelectUI.SelectItem>
            <SelectUI.SelectItem value="open">Open</SelectUI.SelectItem>
            <SelectUI.SelectItem value="ongoing">Ongoing</SelectUI.SelectItem>
            <SelectUI.SelectItem value="closed">Closed</SelectUI.SelectItem>
          </SelectUI.SelectContent>
        </SelectUI.Select>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      cell: ({ row }) => (
        <EventActionsMenu
          event={row}
          canRead={canRead}
          canUpdate={canUpdate}
          canDelete={canDelete}
          isDeleting={isDeleting}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ),
    },
  ];
}
