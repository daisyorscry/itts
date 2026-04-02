import * as Icons from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@components/ui/button';
import * as CardUI from '@components/ui/card';
import * as LayoutUI from '@components/ui/layout';
import { DataPagination } from '@components/ui/pagination';
import { SearchField } from '@components/ui/search';
import { DataTable, type DataTableColumn } from '@components/ui/table';
import { Text } from '@components/ui/text';
import { QueryStatePanel } from '@components/query-state-panel';
import { LearningMetricCard } from '@feature/learning/components/LearningMetricCard';
import { useCourseAnalytics, useLearningAnalyticsOverview, useListAdminCourses } from '@feature/learning/hooks';
import type { LearningCourse, LearningCourseAnalytics } from '@feature/learning/types';

function createCourseColumns(onOpen: (course: LearningCourse) => void): Array<DataTableColumn<LearningCourse>> {
  return [
    {
      id: 'course',
      header: 'Course',
      cell: ({ row }) => (
        <LayoutUI.Column gap="gap-1">
          <Text variant="inverse" className="font-medium">{row.title}</Text>
          <Text variant="muted-inverse" size="xs">{row.slug}</Text>
        </LayoutUI.Column>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => <Text variant="muted-inverse">{row.status}</Text>,
    },
    {
      id: 'level',
      header: 'Level',
      accessorKey: 'level',
      cell: ({ row }) => <Text variant="muted-inverse">{row.level}</Text>,
    },
    {
      id: 'minutes',
      header: 'Minutes',
      cell: ({ row }) => <Text variant="muted-inverse">{row.estimated_minutes}</Text>,
      align: 'right',
    },
    {
      id: 'action',
      header: '',
      align: 'right',
      cell: ({ row }) => (
        <Button type="button" variant="ghost-inverse" size="sm" onClick={() => onOpen(row)}>
          Open
        </Button>
      ),
    },
  ];
}

function createAnalyticsColumns(): Array<DataTableColumn<LearningCourseAnalytics>> {
  return [
    {
      id: 'course',
      header: 'Course',
      cell: ({ row }) => (
        <LayoutUI.Column gap="gap-1">
          <Text variant="inverse" className="font-medium">{row.course_title}</Text>
          <Text variant="muted-inverse" size="xs">{row.course_slug}</Text>
        </LayoutUI.Column>
      ),
    },
    { id: 'enrollments', header: 'Enrollments', accessorKey: 'enrollments', align: 'right' },
    { id: 'completion', header: 'Completion', accessorKey: 'completion_rate', align: 'right', cell: ({ row }) => `${Math.round(row.completion_rate)}%` },
    { id: 'quizzes', header: 'Quiz Avg', accessorKey: 'average_quiz_score', align: 'right', cell: ({ row }) => `${Math.round(row.average_quiz_score)}%` },
    { id: 'assignments', header: 'Assignments', accessorKey: 'assignment_submissions', align: 'right' },
  ];
}

export function AdminLearning() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const { data: overview, isLoading: isOverviewLoading } = useLearningAnalyticsOverview();
  const { data: courses, isLoading: isCoursesLoading, error: coursesError } = useListAdminCourses({
    page,
    page_size: pageSize,
    search: search || undefined,
  });
  const { data: analytics } = useCourseAnalytics({ page_size: 10, search: search || undefined });

  return (
    <LayoutUI.Column gap="gap-8">
      <LayoutUI.Row justify="justify-between" align="items-start" className="gap-4 max-md:flex-col">
        <LayoutUI.Column gap="gap-2">
          <Text as="h1" variant="inverse" className="font-['Sora'] text-3xl font-bold md:text-4xl">
            Learning studio
          </Text>
          <Text variant="muted-inverse">
            Manage courses, structure lessons, and monitor learner performance from one workspace.
          </Text>
        </LayoutUI.Column>
        <Button onClick={() => navigate('/admin/learning/create')} variant="accent" size="form">
          <Icons.Plus size={18} />
          Create course
        </Button>
      </LayoutUI.Row>

      <LayoutUI.Row className="flex-wrap gap-3">
        <Button type="button" variant="ghost-inverse" size="form" onClick={() => navigate('/admin/learning/reviews')}>
          <Icons.FileCheck2 size={18} />
          Review assignments
        </Button>
        <Button type="button" variant="ghost-inverse" size="form" onClick={() => navigate('/admin/learning/certificates')}>
          <Icons.BadgeCheck size={18} />
          View certificates
        </Button>
      </LayoutUI.Row>

      <LayoutUI.Container className="grid grid-cols-1 gap-4 xl:grid-cols-4 md:grid-cols-2">
        <LearningMetricCard
          icon={Icons.BookOpen}
          label="Total courses"
          value={String(overview?.total_courses ?? (isOverviewLoading ? '...' : 0))}
        />
        <LearningMetricCard
          icon={Icons.Users}
          label="Enrollments"
          value={String(overview?.total_enrollments ?? (isOverviewLoading ? '...' : 0))}
          hint={`${Math.round(overview?.completion_rate ?? 0)}% completion rate`}
        />
        <LearningMetricCard
          icon={Icons.BadgeCheck}
          label="Certificates"
          value={String(overview?.total_certificates_issued ?? (isOverviewLoading ? '...' : 0))}
        />
        <LearningMetricCard
          icon={Icons.FileCheck2}
          label="Assignment submissions"
          value={String(overview?.total_assignment_submissions ?? (isOverviewLoading ? '...' : 0))}
        />
      </LayoutUI.Container>

      <CardUI.Card tone="inverse">
        <CardUI.CardContent>
          <SearchField
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search courses"
          />
        </CardUI.CardContent>
      </CardUI.Card>

      <LayoutUI.Container className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <CardUI.Card tone="inverse" className="overflow-hidden">
          <CardUI.CardContent padding="auth" spacing="lg">
            <Text variant="inverse" className="font-['Sora'] text-xl font-semibold">Course management</Text>
            {isCoursesLoading ? (
              <QueryStatePanel icon={Icons.LoaderCircle} title="Loading courses" description="Fetching authoring workspace." />
            ) : coursesError ? (
              <QueryStatePanel icon={Icons.AlertCircle} tone="error" title="Failed to load courses" description="Please refresh and try again." />
            ) : (
              <LayoutUI.Column gap="gap-4">
                <DataTable
                  data={courses?.data ?? []}
                  columns={createCourseColumns((course) => navigate(`/admin/learning/edit/${course.id}`))}
                  rowKey="id"
                  emptyMessage="No courses found."
                />
                {courses ? (
                  <DataPagination
                    pagination={courses}
                    onPageChange={setPage}
                    onPageSizeChange={(value) => {
                      setPageSize(value);
                      setPage(1);
                    }}
                  />
                ) : null}
              </LayoutUI.Column>
            )}
          </CardUI.CardContent>
        </CardUI.Card>

        <CardUI.Card tone="inverse" className="overflow-hidden">
          <CardUI.CardContent padding="auth" spacing="lg">
            <Text variant="inverse" className="font-['Sora'] text-xl font-semibold">Course analytics snapshot</Text>
            <DataTable
              data={analytics?.data ?? []}
              columns={createAnalyticsColumns()}
              rowKey="course_id"
              emptyMessage="No analytics available yet."
            />
          </CardUI.CardContent>
        </CardUI.Card>
      </LayoutUI.Container>
    </LayoutUI.Column>
  );
}
