import * as Icons from 'lucide-react';
import { useState } from 'react';
import * as CardUI from '@components/ui/card';
import * as LayoutUI from '@components/ui/layout';
import { Badge } from '@components/ui/badge';
import { DataPagination } from '@components/ui/pagination';
import { SearchField } from '@components/ui/search';
import * as SelectUI from '@components/ui/select';
import { Text } from '@components/ui/text';
import { QueryStatePanel } from '@components/query-state-panel';
import { LearningCourseCard } from '@feature/learning/components/LearningCourseCard';
import { useListPublicCourses } from '@feature/learning/hooks';
import type { CourseLevel } from '@feature/learning/types';

export function Learning() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState<CourseLevel | ''>('');

  const { data, isLoading, error } = useListPublicCourses({
    page,
    page_size: pageSize,
    search: search || undefined,
    level: level || undefined,
  });

  return (
    <div className="min-h-screen bg-card">
      <section className="bg-black py-16 text-white md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl">
            <Badge className="mb-6 border-0 bg-accent text-black">Learning Catalog</Badge>
            <h1 className="mb-6 text-4xl font-bold md:text-5xl lg:text-6xl">
              ITTS <span className="text-accent">Learning</span>
            </h1>
            <p className="max-w-2xl text-xl text-white/70">
              Browse structured learning paths for programming, networking, and DevSecOps without
              feeling like you left the main site.
            </p>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-card py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <CardUI.Card tone="paper">
            <CardUI.CardContent padding="auth">
              <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_220px]">
                <SearchField
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setPage(1);
                  }}
                  placeholder="Search courses, topics, or tracks"
                />
                <SelectUI.Select
                  value={level || 'all'}
                  onValueChange={(value) => {
                    setLevel(value === 'all' ? '' : (value as CourseLevel));
                    setPage(1);
                  }}
                >
                  <SelectUI.SelectTrigger appearance="admin">
                    <SelectUI.SelectValue>{level || 'All levels'}</SelectUI.SelectValue>
                  </SelectUI.SelectTrigger>
                  <SelectUI.SelectContent appearance="admin">
                    <SelectUI.SelectItem value="all">All levels</SelectUI.SelectItem>
                    <SelectUI.SelectItem value="beginner">Beginner</SelectUI.SelectItem>
                    <SelectUI.SelectItem value="intermediate">Intermediate</SelectUI.SelectItem>
                    <SelectUI.SelectItem value="advanced">Advanced</SelectUI.SelectItem>
                  </SelectUI.SelectContent>
                </SelectUI.Select>
              </LayoutUI.Container>
            </CardUI.CardContent>
          </CardUI.Card>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold md:text-4xl">Available Courses</h2>
              <p className="mt-2 text-foreground/70">
                Public catalog for structured tracks before learners move into the hub.
              </p>
            </div>
            <div className="text-sm text-foreground/60">
              {data?.total ?? 0} course{data?.total === 1 ? '' : 's'}
            </div>
          </div>

          {isLoading ? (
            <CardUI.Card tone="paper">
              <CardUI.CardContent padding="auth">
                <QueryStatePanel icon={Icons.LoaderCircle} title="Loading learning catalog" description="Fetching courses and sections." />
              </CardUI.CardContent>
            </CardUI.Card>
          ) : null}

          {!isLoading && error ? (
            <CardUI.Card tone="paper">
              <CardUI.CardContent padding="auth">
                <QueryStatePanel
                  icon={Icons.AlertCircle}
                  tone="error"
                  title="Failed to load learning catalog"
                  description="Please refresh and try again."
                />
              </CardUI.CardContent>
            </CardUI.Card>
          ) : null}

          {!isLoading && !error && data ? (
            <LayoutUI.Column gap="gap-8">
              <LayoutUI.Container className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {data.data.map((course) => (
                  <LearningCourseCard key={course.id} course={course} href={`/learning/${course.slug}`} />
                ))}
              </LayoutUI.Container>

              <DataPagination
                pagination={data}
                onPageChange={setPage}
                onPageSizeChange={(value) => {
                  setPageSize(value);
                  setPage(1);
                }}
              />
            </LayoutUI.Column>
          ) : null}
        </div>
      </section>
    </div>
  );
}
