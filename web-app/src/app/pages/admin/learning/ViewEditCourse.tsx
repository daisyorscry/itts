import { useEffect, useMemo } from 'react';
import * as Icons from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { QueryStatePanel } from '@components/query-state-panel';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import * as CardUI from '@components/ui/card';
import * as LayoutUI from '@components/ui/layout';
import * as TabsUI from '@components/ui/tabs';
import { Text } from '@components/ui/text';
import { useAdminCourse, useDeleteCourse } from '@feature/learning/hooks';
import { CourseSetupPanel } from './CourseSetupPanel';
import { CourseBuilderContext } from './course-builder.context';
import { CurriculumSidebar } from './CurriculumSidebar';
import { LessonAccessTab } from './LessonAccessTab';
import { LessonAssessmentTab } from './LessonAssessmentTab';
import { LessonContentTab } from './LessonContentTab';
import { sortLessons, sortSections, type WorkspaceTab } from './course-builder.shared';

type BuilderView = 'overview' | 'curriculum' | 'lesson';

const workspaceTabs: WorkspaceTab[] = ['content', 'assessment', 'access'];
const builderViews: BuilderView[] = ['overview', 'curriculum', 'lesson'];

function LearningWorkspaceEmptyState() {
  return (
    <CardUI.Card tone="inverse" border={false}>
      <CardUI.CardContent padding="auth">
        <QueryStatePanel
          icon={Icons.BookOpen}
          title="Choose a lesson first"
          description="Open Curriculum, pick a lesson, then come back here to edit the content and assessment."
        />
      </CardUI.CardContent>
    </CardUI.Card>
  );
}

export function AdminLearningCourseEdit() {
  const navigate = useNavigate();
  const { id = '' } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: course, isLoading, error } = useAdminCourse(id, Boolean(id));
  const { mutate: deleteCourse, isPending: isDeletingCourse } = useDeleteCourse();

  const selectedSectionId = searchParams.get('section') ?? '';
  const selectedLessonId = searchParams.get('lesson') ?? '';
  const workspaceTab = workspaceTabs.includes((searchParams.get('tab') as WorkspaceTab | null) ?? 'content')
    ? ((searchParams.get('tab') as WorkspaceTab | null) ?? 'content')
    : 'content';
  const builderView = builderViews.includes((searchParams.get('view') as BuilderView | null) ?? 'overview')
    ? ((searchParams.get('view') as BuilderView | null) ?? 'overview')
    : 'overview';

  const sections = useMemo(() => sortSections(course?.sections ?? []), [course?.sections]);
  const selectedSection = useMemo(
    () => sections.find((section) => section.id === selectedSectionId) ?? sections[0] ?? null,
    [sections, selectedSectionId],
  );
  const selectedSectionLessons = useMemo(() => sortLessons(selectedSection?.lessons ?? []), [selectedSection?.lessons]);
  const selectedLesson = useMemo(
    () => selectedSectionLessons.find((lesson) => lesson.id === selectedLessonId) ?? selectedSectionLessons[0] ?? null,
    [selectedLessonId, selectedSectionLessons],
  );

  const updateSearchParams = (updates: Partial<Record<'section' | 'lesson' | 'tab' | 'view' | 'lesson_label', string>>) => {
    setSearchParams((current) => {
      const next = new URLSearchParams(current);

      Object.entries(updates).forEach(([key, value]) => {
        if (!value) {
          next.delete(key);
          return;
        }
        next.set(key, value);
      });

      return next;
    });
  };

  const setSelectedSectionId = (value: string) => {
    const nextSection = sections.find((section) => section.id === value) ?? null;
    const firstLessonId = sortLessons(nextSection?.lessons ?? [])[0]?.id ?? '';

    updateSearchParams({
      section: value,
      lesson: firstLessonId,
      lesson_label: nextSection ? sortLessons(nextSection.lessons ?? [])[0]?.title ?? '' : '',
    });
  };

  const setSelectedLessonId = (value: string) => {
    const nextLesson = sections
      .flatMap((section) => sortLessons(section.lessons ?? []))
      .find((lesson) => lesson.id === value);

    updateSearchParams({
      lesson: value,
      lesson_label: nextLesson?.title ?? '',
    });
  };

  const setWorkspaceTab = (value: WorkspaceTab) => {
    updateSearchParams({ tab: value });
  };

  useEffect(() => {
    if (!sections.length) {
      if (selectedSectionId || selectedLessonId) {
        updateSearchParams({ section: '', lesson: '', lesson_label: '' });
      }
      if (builderView === 'lesson') {
        updateSearchParams({ view: 'overview' });
      }
      return;
    }

    if (!sections.some((section) => section.id === selectedSectionId)) {
      const firstSection = sections[0];
      const firstLesson = sortLessons(firstSection.lessons ?? [])[0];

      updateSearchParams({
        section: firstSection.id,
        lesson: firstLesson?.id ?? '',
        lesson_label: firstLesson?.title ?? '',
      });
      return;
    }

    const currentLessons = sortLessons(selectedSection?.lessons ?? []);
    if (!selectedLessonId || !currentLessons.some((lesson) => lesson.id === selectedLessonId)) {
      updateSearchParams({
        lesson: currentLessons[0]?.id ?? '',
        lesson_label: currentLessons[0]?.title ?? '',
      });
      return;
    }

  }, [builderView, sections, selectedLesson, selectedLessonId, selectedSection, selectedSectionId]);

  if (isLoading) {
    return (
      <CardUI.Card tone="inverse">
        <CardUI.CardContent padding="auth">
          <QueryStatePanel icon={Icons.LoaderCircle} title="Loading course builder" description="Preparing curriculum structure and authoring workspace." />
        </CardUI.CardContent>
      </CardUI.Card>
    );
  }

  if (error || !course) {
    return (
      <CardUI.Card tone="inverse">
        <CardUI.CardContent padding="auth">
          <QueryStatePanel icon={Icons.AlertCircle} tone="error" title="Course unavailable" description="The requested course could not be loaded." />
        </CardUI.CardContent>
      </CardUI.Card>
    );
  }

  return (
    <CourseBuilderContext.Provider
      value={{
        courseId: course.id,
        selectedLessonId,
        selectedSectionId,
        setSelectedLessonId,
        setSelectedSectionId,
        setWorkspaceTab,
        workspaceTab,
      }}
    >
      <LayoutUI.Column gap="gap-6">
        <LayoutUI.Row justify="justify-between" align="items-start" className="gap-4 max-md:flex-col">
          <LayoutUI.Row gap="gap-4">
            <Button
              type="button"
              onClick={() => navigate('/admin/learning')}
              variant="ghost-inverse"
              size="icon"
              className="rounded-xl border border-black/10 bg-black/5"
            >
              <Icons.ArrowLeft size={20} />
            </Button>
            <LayoutUI.Column gap="gap-2">
              <Text as="h1" variant="inverse" className="font-['Sora'] text-3xl font-bold">
                {course.title}
              </Text>
              <Text variant="muted-inverse">Manage the course in smaller steps so the builder stays focused.</Text>
            </LayoutUI.Column>
          </LayoutUI.Row>

          <LayoutUI.Row className="flex-wrap gap-2">
            <Badge variant={course.status === 'published' ? 'success' : course.status === 'archived' ? 'secondary' : 'outline'}>
              {course.status}
            </Badge>
            <Badge variant="outline">{course.level}</Badge>
            <Button
              type="button"
              variant="destructive"
              size="form"
              disabled={isDeletingCourse}
              onClick={() => {
                if (!window.confirm(`Delete course "${course.title}"?`)) {
                  return;
                }
                deleteCourse(course.id, {
                  onSuccess: () => navigate('/admin/learning'),
                });
              }}
            >
              <Icons.Trash2 size={18} />
              {isDeletingCourse ? 'Deleting...' : 'Delete'}
            </Button>
          </LayoutUI.Row>
        </LayoutUI.Row>

        {builderView === 'overview' ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,0.72fr)_minmax(320px,0.28fr)]">
            <CourseSetupPanel />

            <CardUI.Card tone="inverse" border={false} className="h-fit">
              <CardUI.CardContent padding="auth" spacing="lg">
                <LayoutUI.Column gap="gap-4">
                  <Text variant="inverse" className="font-['Sora'] text-xl font-semibold">
                    Next steps
                  </Text>
                  {[
                    'Finish the course identity first so the catalog stays clean.',
                    'Open Curriculum when you are ready to add sections and lessons.',
                    'Use Lesson only after you have something concrete to edit.',
                  ].map((item) => (
                    <LayoutUI.Row key={item} gap="gap-3" align="items-start" className="rounded-2xl border border-black/10 bg-black/[0.04] px-4 py-3">
                      <Icons.CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#29E68C]" />
                      <Text variant="muted-inverse" size="sm">
                        {item}
                      </Text>
                    </LayoutUI.Row>
                  ))}
                  <Button type="button" variant="accent" size="form" onClick={() => updateSearchParams({ view: 'curriculum' })}>
                    Go to curriculum
                  </Button>
                </LayoutUI.Column>
              </CardUI.CardContent>
            </CardUI.Card>
          </div>
        ) : null}

        {builderView === 'curriculum' ? <CurriculumSidebar mode="manage" /> : null}

        {builderView === 'lesson' ? (
          <LayoutUI.Column gap="gap-6">
            <CurriculumSidebar mode="pick" />

            {selectedLesson ? (
              <CardUI.Card tone="inverse" border={false}>
                <CardUI.CardContent padding="auth" spacing="lg" className="min-h-[720px]">
                  <TabsUI.Tabs value={workspaceTab} onValueChange={(value) => setWorkspaceTab(value as WorkspaceTab)} className="space-y-6">
                    <LayoutUI.Row justify="justify-between" align="items-start" className="gap-4 max-md:flex-col">
                      <LayoutUI.Column gap="gap-2">
                        <Text variant="inverse" className="font-['Sora'] text-xl font-semibold">
                          Lesson workspace
                        </Text>
                        <Text variant="muted-inverse">
                          Editing <span className="font-medium text-white">{selectedLesson.title}</span> in{' '}
                          <span className="font-medium text-white">{selectedSection?.title}</span>.
                        </Text>
                      </LayoutUI.Column>
                      <LayoutUI.Row className="flex-wrap gap-2">
                        <Button type="button" variant="ghost-inverse" size="sm" onClick={() => updateSearchParams({ view: 'curriculum' })}>
                          Back to curriculum
                        </Button>
                        <TabsUI.TabsList className="rounded-2xl bg-black/5 p-1">
                          <TabsUI.TabsTrigger value="content" className="text-[#04090C] data-[state=active]:bg-black/10">
                            Content
                          </TabsUI.TabsTrigger>
                          <TabsUI.TabsTrigger value="assessment" className="text-[#04090C] data-[state=active]:bg-black/10">
                            Assessment
                          </TabsUI.TabsTrigger>
                          <TabsUI.TabsTrigger value="access" className="text-[#04090C] data-[state=active]:bg-black/10">
                            Access
                          </TabsUI.TabsTrigger>
                        </TabsUI.TabsList>
                      </LayoutUI.Row>
                    </LayoutUI.Row>

                    <TabsUI.TabsContent value="content" className="space-y-6">
                      <LessonContentTab />
                    </TabsUI.TabsContent>

                    <TabsUI.TabsContent value="assessment" className="space-y-6">
                      <LessonAssessmentTab />
                    </TabsUI.TabsContent>

                    <TabsUI.TabsContent value="access" className="space-y-6">
                      <LessonAccessTab />
                    </TabsUI.TabsContent>
                  </TabsUI.Tabs>
                </CardUI.CardContent>
              </CardUI.Card>
            ) : (
              <LearningWorkspaceEmptyState />
            )}
          </LayoutUI.Column>
        ) : null}
      </LayoutUI.Column>
    </CourseBuilderContext.Provider>
  );
}
