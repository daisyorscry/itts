import { useMemo, useState } from 'react';
import * as CardUI from '@components/ui/card';
import * as LayoutUI from '@components/ui/layout';
import { DataPagination } from '@components/ui/pagination';
import { SearchField } from '@components/ui/search';
import * as SelectUI from '@components/ui/select';
import { DataTable } from '@components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@components/ui/tabs';
import { Text } from '@components/ui/text';
import { useDeleteEventRegistration, useListEventRegistrations, useListEvents } from '@feature/event/hooks';
import type { EventRegistrationListResponse } from '@feature/event/types';
import { useApproveRegistration, useDeleteRegistration, useListRegistrations } from '@feature/registration/hooks';
import type { Registration, RegistrationListResponse, RegistrationStatus } from '@feature/registration/types';
import { createEventRegistrationColumns, createRegistrationColumns } from '@pages/admin/registrations/Columns';
import { RegistrationsQueryState } from '@pages/admin/registrations/RegistrationsQueryState';
import { RejectRegistrationModal } from '@pages/admin/registrations/RejectRegistrationModal';

export function AdminRegistrations() {
  const [tab, setTab] = useState('members');
  const [memberPage, setMemberPage] = useState(1);
  const [memberPageSize, setMemberPageSize] = useState(10);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberStatus, setMemberStatus] = useState<RegistrationStatus | ''>('');
  const [eventPage, setEventPage] = useState(1);
  const [eventPageSize, setEventPageSize] = useState(10);
  const [eventSearch, setEventSearch] = useState('');
  const [eventId, setEventId] = useState('');
  const [registrationToReject, setRegistrationToReject] = useState<Registration | null>(null);

  const { data: registrations, isLoading: loadingMembers, error: memberError } = useListRegistrations({
    page: memberPage,
    page_size: memberPageSize,
    search: memberSearch || undefined,
    status: memberStatus || undefined,
  });
  const { data: eventRegistrations, isLoading: loadingEventRegistrations, error: eventRegistrationError } = useListEventRegistrations({
    page: eventPage,
    page_size: eventPageSize,
    search: eventSearch || undefined,
    event_id: eventId || undefined,
  });
  const { data: events } = useListEvents({ page_size: 100 });
  const { mutate: approveRegistration, isPending: approving } = useApproveRegistration();
  const { mutate: deleteRegistration, isPending: deletingMemberRegistration } = useDeleteRegistration();
  const { mutate: deleteEventRegistration, isPending: deletingEventRegistration } = useDeleteEventRegistration();

  const memberResponse: RegistrationListResponse | null = registrations ?? null;
  const eventResponse: EventRegistrationListResponse | null = eventRegistrations ?? null;
  const memberRows = memberResponse?.data ?? [];
  const eventRows = eventResponse?.data ?? [];
  const hasMemberRows = memberRows.length > 0;
  const hasEventRows = eventRows.length > 0;

  const eventTitleById = useMemo(() => {
    return new Map((events?.data ?? []).map((event) => [event.id, event.title]));
  }, [events?.data]);

  const memberColumns = createRegistrationColumns({
    isApproving: approving,
    isDeleting: deletingMemberRegistration,
    onApprove: (registration) => approveRegistration(registration.id),
    onReject: setRegistrationToReject,
    onDelete: (registration) => deleteRegistration(registration.id),
  });

  const eventColumns = createEventRegistrationColumns({
    isDeleting: deletingEventRegistration,
    getEventTitle: (id) => eventTitleById.get(id) ?? id,
    onDelete: (registration) => deleteEventRegistration(registration.id),
  });

  return (
    <LayoutUI.Column gap="gap-8">
      <LayoutUI.Column gap="gap-2">
        <Text as="h1" variant="inverse" className="font-['Sora'] text-3xl font-bold md:text-4xl">
          Registrations Management
        </Text>
        <Text variant="muted-inverse">
          Review community member signups and event attendees from one place.
        </Text>
      </LayoutUI.Column>

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList className="rounded-2xl bg-black/5 p-1">
          <TabsTrigger value="members" className="text-[#04090C] data-[state=active]:bg-black/10">
            Member Registrations
          </TabsTrigger>
          <TabsTrigger value="events" className="text-[#04090C] data-[state=active]:bg-black/10">
            Event Registrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <LayoutUI.Row justify="justify-between" align="items-start" className="gap-4 max-xl:flex-col max-xl:items-start">
            {typeof memberResponse?.total === 'number' ? (
              <Text variant="muted-inverse" className="shrink-0 md:pt-2">
                Showing {(memberPage - 1) * (memberResponse?.page_size ?? memberPageSize) + 1} to{' '}
                {Math.min(memberPage * (memberResponse?.page_size ?? memberPageSize), memberResponse.total)} of{' '}
                {memberResponse.total} member registrations
              </Text>
            ) : null}

            <CardUI.Card tone="inverse" border={false} className="w-full flex-1">
              <CardUI.CardContent>
                <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px]">
                  <SearchField
                    value={memberSearch}
                    onChange={(event) => {
                      setMemberSearch(event.target.value);
                      setMemberPage(1);
                    }}

                    placeholder="Search by name or email"
                  />

                  <SelectUI.Select
                    value={memberStatus || 'all'}
                    onValueChange={(value) => {
                      setMemberStatus(value === 'all' ? '' : (value as RegistrationStatus));
                      setMemberPage(1);
                    }}
                  >
                    <SelectUI.SelectTrigger appearance="admin">
                      <SelectUI.SelectValue>{memberStatus || 'All statuses'}</SelectUI.SelectValue>
                    </SelectUI.SelectTrigger>
                    <SelectUI.SelectContent appearance="admin">
                      <SelectUI.SelectItem value="all">All statuses</SelectUI.SelectItem>
                      <SelectUI.SelectItem value="pending">Pending</SelectUI.SelectItem>
                      <SelectUI.SelectItem value="approved">Approved</SelectUI.SelectItem>
                      <SelectUI.SelectItem value="rejected">Rejected</SelectUI.SelectItem>
                    </SelectUI.SelectContent>
                  </SelectUI.Select>
                </LayoutUI.Container>
              </CardUI.CardContent>
            </CardUI.Card>
          </LayoutUI.Row>

          {loadingMembers ? <RegistrationsQueryState type="loading" scope="members" /> : null}
          {!loadingMembers && memberError ? <RegistrationsQueryState type="error" scope="members" /> : null}
          {!loadingMembers && !memberError && !hasMemberRows ? <RegistrationsQueryState type="empty" scope="members" /> : null}

          {!loadingMembers && !memberError && memberResponse && hasMemberRows ? (
            <LayoutUI.Column>
              <CardUI.Card tone="inverse" className="overflow-hidden">
                <DataTable
                  data={memberRows}
                  columns={memberColumns}
                  rowKey="id"
                  emptyMessage="No registrations found."
                />
              </CardUI.Card>

              <DataPagination
                pagination={memberResponse}
                onPageChange={setMemberPage}
                onPageSizeChange={(value) => {
                  setMemberPageSize(value);
                  setMemberPage(1);
                }}
              />
            </LayoutUI.Column>
          ) : null}
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <LayoutUI.Row justify="justify-between" align="items-start" className="gap-4 max-xl:flex-col max-xl:items-start">
            {typeof eventResponse?.total === 'number' ? (
              <Text variant="muted-inverse" className="shrink-0 md:pt-2">
                Showing {(eventPage - 1) * (eventResponse?.page_size ?? eventPageSize) + 1} to{' '}
                {Math.min(eventPage * (eventResponse?.page_size ?? eventPageSize), eventResponse.total)} of{' '}
                {eventResponse.total} event registrations
              </Text>
            ) : null}

            <CardUI.Card tone="inverse" border={false} className="w-full flex-1">
              <CardUI.CardContent>
                <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_260px]">
                  <SearchField
                    value={eventSearch}
                    onChange={(event) => {
                      setEventSearch(event.target.value);
                      setEventPage(1);
                    }}
                    placeholder="Search attendee"
                  />

                  <SelectUI.Select
                    value={eventId || 'all'}
                    onValueChange={(value) => {
                      setEventId(value === 'all' ? '' : value);
                      setEventPage(1);
                    }}
                  >
                    <SelectUI.SelectTrigger appearance="admin">
                      <SelectUI.SelectValue>{eventId ? eventTitleById.get(eventId) ?? eventId : 'All events'}</SelectUI.SelectValue>
                    </SelectUI.SelectTrigger>
                    <SelectUI.SelectContent appearance="admin">
                      <SelectUI.SelectItem value="all">All events</SelectUI.SelectItem>
                      {(events?.data ?? []).map((event) => (
                        <SelectUI.SelectItem key={event.id} value={event.id}>
                          {event.title}
                        </SelectUI.SelectItem>
                      ))}
                    </SelectUI.SelectContent>
                  </SelectUI.Select>
                </LayoutUI.Container>
              </CardUI.CardContent>
            </CardUI.Card>
          </LayoutUI.Row>

          {loadingEventRegistrations ? <RegistrationsQueryState type="loading" scope="events" /> : null}
          {!loadingEventRegistrations && eventRegistrationError ? <RegistrationsQueryState type="error" scope="events" /> : null}
          {!loadingEventRegistrations && !eventRegistrationError && !hasEventRows ? <RegistrationsQueryState type="empty" scope="events" /> : null}

          {!loadingEventRegistrations && !eventRegistrationError && eventResponse && hasEventRows ? (
            <LayoutUI.Column>
              <CardUI.Card tone="inverse" className="overflow-hidden">
                <DataTable
                  data={eventRows}
                  columns={eventColumns}
                  rowKey="id"
                  emptyMessage="No event registrations found."
                />
              </CardUI.Card>

              <DataPagination
                pagination={eventResponse}
                onPageChange={setEventPage}
                onPageSizeChange={(value) => {
                  setEventPageSize(value);
                  setEventPage(1);
                }}
              />
            </LayoutUI.Column>
          ) : null}
        </TabsContent>
      </Tabs>

      <RejectRegistrationModal
        registration={registrationToReject}
        isOpen={Boolean(registrationToReject)}
        onClose={() => setRegistrationToReject(null)}
      />
    </LayoutUI.Column>
  );
}
