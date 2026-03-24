import * as Icons from 'lucide-react';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import * as DropdownMenuUI from '@components/ui/dropdown-menu';
import * as LayoutUI from '@components/ui/layout';
import { Text } from '@components/ui/text';
import { type DataTableColumn } from '@components/ui/table';
import type { EventPaymentStatus, EventRegistration, EventRegistrationStatus } from '@feature/event/types';
import type { Registration, RegistrationStatus } from '@feature/registration/types';
import { formatDate, formatDateTime } from '@utility/date';

const registrationStatusVariant: Record<RegistrationStatus, 'secondary' | 'success' | 'destructive'> = {
  pending: 'secondary',
  approved: 'success',
  rejected: 'destructive',
};

interface CreateRegistrationColumnsOptions {
  isApproving: boolean;
  isDeleting: boolean;
  onApprove: (registration: Registration) => void;
  onReject: (registration: Registration) => void;
  onDelete: (registration: Registration) => void;
}

interface CreateEventRegistrationColumnsOptions {
  isMutating: boolean;
  isDeleting: boolean;
  getEventTitle: (eventId: string) => string;
  onView: (registration: EventRegistration) => void;
  onApprove: (registration: EventRegistration) => void;
  onReject: (registration: EventRegistration) => void;
  onWaitlist: (registration: EventRegistration) => void;
  onPromote: (registration: EventRegistration) => void;
  onDelete: (registration: EventRegistration) => void;
}

interface EventRegistrationActionsMenuProps {
  registration: EventRegistration;
  isMutating: boolean;
  isDeleting: boolean;
  onView: (registration: EventRegistration) => void;
  onApprove: (registration: EventRegistration) => void;
  onReject: (registration: EventRegistration) => void;
  onWaitlist: (registration: EventRegistration) => void;
  onPromote: (registration: EventRegistration) => void;
  onDelete: (registration: EventRegistration) => void;
}

const eventRegistrationStatusVariant: Record<EventRegistrationStatus, 'secondary' | 'success' | 'destructive'> = {
  pending_verification: 'secondary',
  pending_payment: 'secondary',
  approved: 'success',
  waitlisted: 'secondary',
  rejected: 'destructive',
  cancelled: 'destructive',
  expired: 'destructive',
};

const eventPaymentStatusLabel: Record<EventPaymentStatus, string> = {
  not_required: 'No payment',
  pending: 'Pending payment',
  paid: 'Paid',
  failed: 'Failed',
  expired: 'Expired',
};

function EventRegistrationActionsMenu({
  registration,
  isMutating,
  isDeleting,
  onView,
  onApprove,
  onReject,
  onWaitlist,
  onPromote,
  onDelete,
}: EventRegistrationActionsMenuProps) {
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
          className="w-48 rounded-xl border-black/10 bg-[#F7F4EC] p-1.5"
        >
          <DropdownMenuUI.DropdownMenuItem
            className="rounded-lg px-3 py-2.5 text-[#04090C] focus:bg-black/5 focus:text-[#04090C]"
            onClick={() => onView(registration)}
          >
            <Icons.Eye className="text-black/70" />
            View details
          </DropdownMenuUI.DropdownMenuItem>
          <DropdownMenuUI.DropdownMenuSeparator className="my-1.5 bg-black/10" />
          {registration.status !== 'approved' ? (
            <DropdownMenuUI.DropdownMenuItem
              className="rounded-lg px-3 py-2.5 text-[#04090C] focus:bg-black/5 focus:text-[#04090C]"
              disabled={isMutating}
              onClick={() => onApprove(registration)}
            >
              <Icons.CheckCircle2 className="text-black/70" />
              Approve
            </DropdownMenuUI.DropdownMenuItem>
          ) : null}
          {registration.status !== 'waitlisted' ? (
            <DropdownMenuUI.DropdownMenuItem
              className="rounded-lg px-3 py-2.5 text-[#04090C] focus:bg-black/5 focus:text-[#04090C]"
              disabled={isMutating}
              onClick={() => onWaitlist(registration)}
            >
              <Icons.Clock3 className="text-black/70" />
              Move to waitlist
            </DropdownMenuUI.DropdownMenuItem>
          ) : null}
          {registration.status === 'waitlisted' ? (
            <DropdownMenuUI.DropdownMenuItem
              className="rounded-lg px-3 py-2.5 text-[#04090C] focus:bg-black/5 focus:text-[#04090C]"
              disabled={isMutating}
              onClick={() => onPromote(registration)}
            >
              <Icons.ArrowUpCircle className="text-black/70" />
              Promote to approved
            </DropdownMenuUI.DropdownMenuItem>
          ) : null}
          {registration.status !== 'rejected' ? (
            <DropdownMenuUI.DropdownMenuItem
              className="rounded-lg px-3 py-2.5 text-[#04090C] focus:bg-black/5 focus:text-[#04090C]"
              disabled={isMutating}
              onClick={() => onReject(registration)}
            >
              <Icons.XCircle className="text-black/70" />
              Reject
            </DropdownMenuUI.DropdownMenuItem>
          ) : null}
          <DropdownMenuUI.DropdownMenuSeparator className="my-1.5 bg-black/10" />
          <DropdownMenuUI.DropdownMenuItem
            variant="destructive"
            className="rounded-lg px-3 py-2.5"
            disabled={isDeleting || isMutating}
            onClick={() => onDelete(registration)}
          >
            <Icons.Trash2 />
            Delete Registration
          </DropdownMenuUI.DropdownMenuItem>
        </DropdownMenuUI.DropdownMenuContent>
      </DropdownMenuUI.DropdownMenu>
    </LayoutUI.Row>
  );
}

interface RegistrationActionsMenuProps {
  registration: Registration;
  isApproving: boolean;
  isDeleting: boolean;
  onApprove: (registration: Registration) => void;
  onReject: (registration: Registration) => void;
  onDelete: (registration: Registration) => void;
}

function RegistrationActionsMenu({
  registration,
  isApproving,
  isDeleting,
  onApprove,
  onReject,
  onDelete,
}: RegistrationActionsMenuProps) {
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
          className="w-52 rounded-xl border-black/10 bg-[#F7F4EC] p-1.5"
        >
          {registration.status === 'pending' ? (
            <>
              <DropdownMenuUI.DropdownMenuItem
                className="rounded-lg px-3 py-2.5 text-[#04090C] focus:bg-black/5 focus:text-[#04090C]"
                disabled={isApproving}
                onClick={() => onApprove(registration)}
              >
                <Icons.CheckCircle2 className="text-black/70" />
                Approve Registration
              </DropdownMenuUI.DropdownMenuItem>
              <DropdownMenuUI.DropdownMenuItem
                className="rounded-lg px-3 py-2.5 text-[#04090C] focus:bg-black/5 focus:text-[#04090C]"
                onClick={() => onReject(registration)}
              >
                <Icons.XCircle className="text-black/70" />
                Reject Registration
              </DropdownMenuUI.DropdownMenuItem>
              <DropdownMenuUI.DropdownMenuSeparator className="my-1.5 bg-black/10" />
            </>
          ) : null}
          <DropdownMenuUI.DropdownMenuItem
            variant="destructive"
            className="rounded-lg px-3 py-2.5"
            disabled={isDeleting}
            onClick={() => onDelete(registration)}
          >
            <Icons.Trash2 />
            Delete Registration
          </DropdownMenuUI.DropdownMenuItem>
        </DropdownMenuUI.DropdownMenuContent>
      </DropdownMenuUI.DropdownMenu>
    </LayoutUI.Row>
  );
}

export function createRegistrationColumns({
  isApproving,
  isDeleting,
  onApprove,
  onReject,
  onDelete,
}: CreateRegistrationColumnsOptions): Array<DataTableColumn<Registration>> {
  return [
    {
      id: 'applicant',
      header: 'Applicant',
      cell: ({ row }) => (
        <LayoutUI.Column gap="gap-1">
          <Text variant="inverse">{row.full_name}</Text>
          <Text variant="muted-inverse" size="xs">{row.email}</Text>
          {row.rejected_reason ? (
            <Text variant="muted-inverse" size="xs" className="max-w-xs text-red-700/80">
              Reason: {row.rejected_reason}
            </Text>
          ) : null}
        </LayoutUI.Column>
      ),
    },
    {
      id: 'program',
      header: 'Program',
      cell: ({ row }) => (
        <Text variant="muted-inverse" className="capitalize">
          {row.program}
        </Text>
      ),
    },
    {
      id: 'intake',
      header: 'Intake',
      cell: ({ row }) => <Text variant="muted-inverse">{row.intake_year}</Text>,
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => <Badge variant={registrationStatusVariant[row.status]}>{row.status}</Badge>,
    },
    {
      id: 'created',
      header: 'Created',
      cell: ({ row }) => <Text variant="muted-inverse">{formatDate(row.created_at)}</Text>,
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      cell: ({ row }) => (
        <RegistrationActionsMenu
          registration={row}
          isApproving={isApproving}
          isDeleting={isDeleting}
          onApprove={onApprove}
          onReject={onReject}
          onDelete={onDelete}
        />
      ),
    },
  ];
}

export function createEventRegistrationColumns({
  isMutating,
  isDeleting,
  getEventTitle,
  onView,
  onApprove,
  onReject,
  onWaitlist,
  onPromote,
  onDelete,
}: CreateEventRegistrationColumnsOptions): Array<DataTableColumn<EventRegistration>> {
  return [
    {
      id: 'attendee',
      header: 'Attendee',
      cell: ({ row }) => (
        <LayoutUI.Column gap="gap-1">
          <Text variant="inverse">{row.full_name}</Text>
          <Text variant="muted-inverse" size="xs">{row.email}</Text>
        </LayoutUI.Column>
      ),
    },
    {
      id: 'event',
      header: 'Event',
      cell: ({ row }) => <Text variant="muted-inverse">{getEventTitle(row.event_id)}</Text>,
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => <Badge variant={eventRegistrationStatusVariant[row.status]}>{row.status.replace(/_/g, ' ')}</Badge>,
    },
    {
      id: 'payment',
      header: 'Payment',
      cell: ({ row }) => <Text variant="muted-inverse">{eventPaymentStatusLabel[row.payment_status]}</Text>,
    },
    {
      id: 'registered',
      header: 'Registered',
      cell: ({ row }) => <Text variant="muted-inverse">{formatDateTime(row.created_at)}</Text>,
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      cell: ({ row }) => (
        <EventRegistrationActionsMenu
          registration={row}
          isMutating={isMutating}
          isDeleting={isDeleting}
          onView={onView}
          onApprove={onApprove}
          onReject={onReject}
          onWaitlist={onWaitlist}
          onPromote={onPromote}
          onDelete={onDelete}
        />
      ),
    },
  ];
}
