import { useState } from 'react';
import * as Icons from 'lucide-react';
import { useNavigate } from 'react-router';
import * as CardUI from '@components/ui/card';
import * as LayoutUI from '@components/ui/layout';
import { Button } from '@components/ui/button';
import { DataPagination } from '@components/ui/pagination';
import { SearchField } from '@components/ui/search';
import * as SelectUI from '@components/ui/select';
import { DataTable } from '@components/ui/table';
import { Text } from '@components/ui/text';
import { useDeleteEvent, useListEvents, useSetEventStatus } from '@feature/event/hooks';
import { type Event, type EventListResponse, type EventStatus } from '@feature/event/types';
import { createEventColumns } from '@pages/admin/events/Columns';
import { EventsQueryState } from '@pages/admin/events/EventsQueryState';
import { QueryStatePanel } from '@components/query-state-panel';
import { PERMISSIONS, useHasPermission } from '@utils/permissions';

export function AdminEvents() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<EventStatus | ''>('');
  const canList = useHasPermission(PERMISSIONS.EVENTS_LIST);
  const canRead = useHasPermission(PERMISSIONS.EVENTS_READ);
  const canCreate = useHasPermission(PERMISSIONS.EVENTS_CREATE);
  const canUpdate = useHasPermission(PERMISSIONS.EVENTS_UPDATE);
  const canDelete = useHasPermission(PERMISSIONS.EVENTS_DELETE);

  const { data, isLoading, error } = useListEvents({
    page,
    page_size: pageSize,
    search: search || undefined,
    status: status || undefined,
  }, canList);
  const { mutate: deleteEvent, isPending: deleting } = useDeleteEvent();
  const { mutate: setStatusMutation, isPending: updatingStatus } = useSetEventStatus();

  const listEventsResponse: EventListResponse | null = data ?? null;
  const events = listEventsResponse?.data ?? [];
  const hasEvents = events.length > 0;

  const eventColumns = createEventColumns({
    canRead,
    canUpdate,
    canDelete,
    isUpdatingStatus: updatingStatus,
    isDeleting: deleting,
    onStatusChange: (event, nextStatus) => {
      setStatusMutation({ id: event.id, payload: { status: nextStatus } });
    },
    onView: (event) => navigate(`/admin/events/${event.id}`),
    onEdit: (event) => navigate(`/admin/events/edit/${event.id}`),
    onDelete: (event) => {
      deleteEvent(event.id);
    },
  });

  if (!canList) {
    return (
      <QueryStatePanel
        tone="error"
        icon={Icons.ShieldAlert}
        title="You do not have permission to view events"
        description="Ask an administrator for events:list access."
      />
    );
  }

  return (
    <LayoutUI.Column gap="gap-8">
      <LayoutUI.Row justify="justify-between" align="items-center" className="gap-4 max-md:flex-col max-md:items-start">
        <LayoutUI.Column gap="gap-2">
          <Text as="h1" variant="inverse" className="font-['Sora'] text-3xl font-bold md:text-4xl">
            Events Management
          </Text>
          <Text variant="muted-inverse">
            Create, update, and publish community events.
          </Text>
        </LayoutUI.Column>
        {canCreate ? (
          <Button onClick={() => navigate('/admin/events/create')} variant="accent" size="form">
            <Icons.Plus />
            Create Event
          </Button>
        ) : null}
      </LayoutUI.Row>

      <LayoutUI.Row justify="justify-between" align="items-start" className="gap-4 max-xl:flex-col max-xl:items-start">
        {typeof listEventsResponse?.total === 'number' ? (
          <Text variant="muted-inverse" className="shrink-0 md:pt-2">
            Showing {(page - 1) * (listEventsResponse?.page_size ?? pageSize) + 1} to{' '}
            {Math.min(page * (listEventsResponse?.page_size ?? pageSize), listEventsResponse.total)} of{' '}
            {listEventsResponse.total} events
          </Text>
        ) : null}

        <CardUI.Card tone="inverse" border={false} className="w-full flex-1">
          <CardUI.CardContent>
            <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px]">
              <SearchField
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search events"
              />
              <SelectUI.Select
                value={status || 'all'}
                onValueChange={(value) => {
                  setStatus(value === 'all' ? '' : (value as EventStatus));
                  setPage(1);
                }}
              >
                <SelectUI.SelectTrigger appearance="admin">
                  <SelectUI.SelectValue>{status || 'All statuses'}</SelectUI.SelectValue>
                </SelectUI.SelectTrigger>
                <SelectUI.SelectContent appearance="admin">
                  <SelectUI.SelectItem value="all">All statuses</SelectUI.SelectItem>
                  <SelectUI.SelectItem value="draft">Draft</SelectUI.SelectItem>
                  <SelectUI.SelectItem value="open">Open</SelectUI.SelectItem>
                  <SelectUI.SelectItem value="ongoing">Ongoing</SelectUI.SelectItem>
                  <SelectUI.SelectItem value="closed">Closed</SelectUI.SelectItem>
                </SelectUI.SelectContent>
              </SelectUI.Select>
            </LayoutUI.Container>
          </CardUI.CardContent>
        </CardUI.Card>
      </LayoutUI.Row>

      {isLoading ? <EventsQueryState type="loading" /> : null}
      {!isLoading && error ? <EventsQueryState type="error" /> : null}
      {!isLoading && !error && !hasEvents ? <EventsQueryState type="empty" /> : null}

      {!isLoading && !error && listEventsResponse && hasEvents ? (
        <LayoutUI.Column>
          <CardUI.Card tone="inverse" className="overflow-hidden">
            <DataTable data={events} columns={eventColumns} rowKey="id" emptyMessage="No events found." />
          </CardUI.Card>

          <DataPagination
            pagination={listEventsResponse}
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
