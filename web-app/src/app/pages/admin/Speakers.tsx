import { useMemo, useState } from 'react';
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
import { useDeleteSpeaker, useListEvents, useListSpeakers } from '@feature/event/hooks';
import { type Speaker, type SpeakerListResponse } from '@feature/event/types';
import { createSpeakerColumns } from '@pages/admin/speakers/Columns';
import { SpeakersQueryState } from '@pages/admin/speakers/SpeakersQueryState';

export function AdminSpeakers() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [eventId, setEventId] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: events } = useListEvents({ page_size: 100 });
  const { data, isLoading, error } = useListSpeakers({
    page,
    page_size: pageSize,
    search: search || undefined,
    event_id: eventId || undefined,
  });
  const { mutate: deleteSpeaker, isPending: deleting } = useDeleteSpeaker();

  const listSpeakersResponse: SpeakerListResponse | null = data ?? null;
  const speakers = listSpeakersResponse?.data ?? [];
  const hasSpeakers = speakers.length > 0;

  const eventTitleById = useMemo(() => {
    return new Map((events?.data ?? []).map((event) => [event.id, event.title]));
  }, [events?.data]);

  const speakerColumns = createSpeakerColumns({
    isDeleting: deleting,
    getEventTitle: (id) => eventTitleById.get(id) ?? id,
    onView: (speaker) => navigate(`/admin/speakers/${speaker.id}`),
    onEdit: (speaker) => navigate(`/admin/speakers/edit/${speaker.id}`),
    onDelete: (speaker) => deleteSpeaker(speaker.id),
  });

  return (
    <LayoutUI.Column gap="gap-8">
      <LayoutUI.Row justify="justify-between" align="items-center" className="gap-4 max-md:flex-col max-md:items-start">
        <LayoutUI.Column gap="gap-2">
          <Text as="h1" variant="inverse" className="font-['Sora'] text-3xl font-bold md:text-4xl">
            Speakers Management
          </Text>
          <Text variant="muted-inverse">
            Assign and maintain speaker profiles for each event.
          </Text>
        </LayoutUI.Column>
        <Button onClick={() => navigate(eventId ? `/admin/speakers/create?eventId=${eventId}` : '/admin/speakers/create')} variant="accent" size="form">
          <Icons.Plus />
          Add Speaker
        </Button>
      </LayoutUI.Row>

      <LayoutUI.Row justify="justify-between" align="items-start" className="gap-4 max-xl:flex-col max-xl:items-start">
        {typeof listSpeakersResponse?.total === 'number' ? (
          <Text variant="muted-inverse" className="shrink-0 md:pt-2">
            Showing {(page - 1) * (listSpeakersResponse?.page_size ?? pageSize) + 1} to{' '}
            {Math.min(page * (listSpeakersResponse?.page_size ?? pageSize), listSpeakersResponse.total)} of{' '}
            {listSpeakersResponse.total} speakers
          </Text>
        ) : null}

        <CardUI.Card tone="inverse" border={false} className="w-full flex-1">
          <CardUI.CardContent>
            <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_260px]">
              <SearchField
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search speakers"
              />

              <SelectUI.Select
                value={eventId || 'all'}
                onValueChange={(value) => {
                  setEventId(value === 'all' ? '' : value);
                  setPage(1);
                }}
              >
                <SelectUI.SelectTrigger appearance="admin">
                  <SelectUI.SelectValue>
                    {eventId ? eventTitleById.get(eventId) || 'All events' : 'All events'}
                  </SelectUI.SelectValue>
                </SelectUI.SelectTrigger>
                <SelectUI.SelectContent appearance="admin">
                  <SelectUI.SelectItem value="all">All events</SelectUI.SelectItem>
                  {(events?.data ?? []).map((event) => (
                    <SelectUI.SelectItem key={event.id} value={event.id}>{event.title}</SelectUI.SelectItem>
                  ))}
                </SelectUI.SelectContent>
              </SelectUI.Select>
            </LayoutUI.Container>
          </CardUI.CardContent>
        </CardUI.Card>
      </LayoutUI.Row>

      {isLoading ? <SpeakersQueryState type="loading" /> : null}
      {!isLoading && error ? <SpeakersQueryState type="error" /> : null}
      {!isLoading && !error && !hasSpeakers ? <SpeakersQueryState type="empty" /> : null}

      {!isLoading && !error && listSpeakersResponse && hasSpeakers ? (
        <LayoutUI.Column>
          <CardUI.Card tone="inverse" className="overflow-hidden">
            <DataTable data={speakers} columns={speakerColumns} rowKey="id" emptyMessage="No speakers found." />
          </CardUI.Card>

          <DataPagination
            pagination={listSpeakersResponse}
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
