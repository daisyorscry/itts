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
import { useDeleteMentor, useListMentors, useSetMentorActive, useSetMentorPriority } from '@feature/mentor/hooks';
import { type Mentor, type MentorListResponse, type ProgramType } from '@feature/mentor/types';
import { createMentorColumns } from '@pages/admin/mentors/Columns';
import { MentorsQueryState } from '@pages/admin/mentors/MentorsQueryState';

export function AdminMentors() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [program, setProgram] = useState<ProgramType | ''>('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, error } = useListMentors({
    page,
    page_size: pageSize,
    search: search || undefined,
    program: program || undefined,
  });
  const { mutate: setActive, isPending: settingActive } = useSetMentorActive();
  const { mutate: setPriority, isPending: settingPriority } = useSetMentorPriority();
  const { mutate: deleteMentor, isPending: deleting } = useDeleteMentor();

  const listMentorsResponse: MentorListResponse | null = data ?? null;
  const mentors = listMentorsResponse?.data ?? [];
  const hasMentors = mentors.length > 0;

  const mentorColumns = createMentorColumns({
    isSettingActive: settingActive,
    isSettingPriority: settingPriority,
    isDeleting: deleting,
    onPriorityChange: (mentor, priority) => {
      setPriority({ id: mentor.id, priority });
    },
    onToggleActive: (mentor) => {
      setActive({ id: mentor.id, active: !mentor.is_active });
    },
    onView: (mentor) => navigate(`/admin/mentors/${mentor.id}`),
    onEdit: (mentor) => navigate(`/admin/mentors/edit/${mentor.id}`),
    onDelete: (mentor) => {
      deleteMentor(mentor.id);
    },
  });

  return (
    <LayoutUI.Column gap="gap-8">
      <LayoutUI.Row justify="justify-between" align="items-center" className="gap-4 max-md:flex-col max-md:items-start">
        <LayoutUI.Column gap="gap-2">
          <Text as="h1" variant="inverse" className="font-['Sora'] text-3xl font-bold md:text-4xl">
            Mentors
          </Text>
          <Text variant="muted-inverse">
            Manage mentors, expertise areas, and display priority.
          </Text>
        </LayoutUI.Column>
        <Button onClick={() => navigate('/admin/mentors/create')} variant="accent" size="form">
          <Icons.Plus />
          Add Mentor
        </Button>
      </LayoutUI.Row>

      <LayoutUI.Row justify="justify-between" align="items-start" className="gap-4 max-xl:flex-col max-xl:items-start">
        {typeof listMentorsResponse?.total === 'number' ? (
          <Text variant="muted-inverse" className="shrink-0 md:pt-2">
            Showing {(page - 1) * (listMentorsResponse?.page_size ?? pageSize) + 1} to{' '}
            {Math.min(page * (listMentorsResponse?.page_size ?? pageSize), listMentorsResponse.total)} of{' '}
            {listMentorsResponse.total} mentors
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
                placeholder="Search mentors"
              />

              <SelectUI.Select
                value={program || 'all'}
                onValueChange={(value) => {
                  setProgram(value === 'all' ? '' : (value as ProgramType));
                  setPage(1);
                }}
              >
                <SelectUI.SelectTrigger appearance="admin">
                  <SelectUI.SelectValue>{program || 'All programs'}</SelectUI.SelectValue>
                </SelectUI.SelectTrigger>
                <SelectUI.SelectContent appearance="admin">
                  <SelectUI.SelectItem value="all">All programs</SelectUI.SelectItem>
                  <SelectUI.SelectItem value="networking">Networking</SelectUI.SelectItem>
                  <SelectUI.SelectItem value="devsecops">DevSecOps</SelectUI.SelectItem>
                  <SelectUI.SelectItem value="programming">Programming</SelectUI.SelectItem>
                </SelectUI.SelectContent>
              </SelectUI.Select>
            </LayoutUI.Container>
          </CardUI.CardContent>
        </CardUI.Card>
      </LayoutUI.Row>

      {isLoading ? <MentorsQueryState type="loading" /> : null}
      {!isLoading && error ? <MentorsQueryState type="error" /> : null}
      {!isLoading && !error && !hasMentors ? <MentorsQueryState type="empty" /> : null}

      {!isLoading && !error && listMentorsResponse && hasMentors ? (
        <LayoutUI.Column>
          <CardUI.Card tone="inverse" className="overflow-hidden">
            <DataTable data={mentors} columns={mentorColumns} rowKey="id" emptyMessage="No mentors found." />
          </CardUI.Card>

          <DataPagination
            pagination={listMentorsResponse}
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
