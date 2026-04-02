import * as Icons from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import * as CardUI from '@components/ui/card';
import * as LayoutUI from '@components/ui/layout';
import { Progress } from '@components/ui/progress';
import { Text } from '@components/ui/text';
import { QueryStatePanel } from '@components/query-state-panel';
import { LearningPublicShell } from '@feature/learning/components/LearningPublicShell';
import { useEnrollCourse, usePublicCourse } from '@feature/learning/hooks';
import { useAuthStore } from '@store/auth.store';
import { resolveAssetUrl } from '@utility/asset';

export function LearningDetail() {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const { data: course, isLoading, error } = usePublicCourse(slug);
  const { mutate: enrollCourse, isPending } = useEnrollCourse();

  if (isLoading) {
    return (
      <LayoutUI.Column className="px-4 py-12 md:px-8 lg:px-12">
        <QueryStatePanel icon={Icons.LoaderCircle} title="Loading course details" description="Preparing syllabus and lesson map." />
      </LayoutUI.Column>
    );
  }

  if (error || !course) {
    return (
      <LayoutUI.Column className="px-4 py-12 md:px-8 lg:px-12">
        <QueryStatePanel icon={Icons.AlertCircle} tone="error" title="Course not found" description="The learning path you requested is unavailable." />
      </LayoutUI.Column>
    );
  }

  const totalLessons = course.sections.reduce((total, section) => total + section.lessons.length, 0);
  const previewLessons = course.sections.flatMap((section) => section.lessons).filter((lesson) => lesson.is_preview).length;
  const thumbnail = resolveAssetUrl(course.thumbnail_url);

  return (
    <LearningPublicShell
      eyebrow="Course Overview"
      title={course.title}
      description={course.subtitle || course.description || 'Review the syllabus, preview accessible lessons, and decide if this learning path fits your current track.'}
      leftMeta={(
        <LayoutUI.Row className="flex-wrap gap-3">
          <Button asChild variant="ghost-inverse" size="form" className="!bg-transparent">
            <Link to="/learning">
              <Icons.ArrowLeft size={18} />
              Back to catalog
            </Link>
          </Button>
          <Badge variant="outline">{course.level}</Badge>
          {course.program ? <Badge variant="outline">{course.program}</Badge> : null}
          <Badge variant="outline">{totalLessons} lessons</Badge>
        </LayoutUI.Row>
      )}
      rightPanel={(
        <LayoutUI.Column gap="gap-4" className="mx-auto max-w-xl">
          {thumbnail ? (
            <div className="overflow-hidden rounded-[28px] border border-white/10 shadow-[0_30px_90px_rgba(0,0,0,0.3)]">
              <img src={thumbnail} alt={course.title} className="h-64 w-full object-cover" />
            </div>
          ) : (
            <LayoutUI.Column surface="panel" padding="lg" radius="2xl" className="border border-white/10 bg-white/5">
              <Text variant="inverse" className="font-['Sora'] text-2xl font-semibold">{course.title}</Text>
              <Text variant="muted-inverse">No thumbnail yet, but the learning path and structure are already in place.</Text>
            </LayoutUI.Column>
          )}
          <LayoutUI.Container className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <LayoutUI.Column surface="panel" padding="md" radius="xl" gap="gap-1" className="border border-white/10 bg-white/5">
              <Text variant="inverse" className="font-['Sora'] text-2xl font-semibold">{course.estimated_minutes}</Text>
              <Text variant="muted-inverse" size="sm">Minutes</Text>
            </LayoutUI.Column>
            <LayoutUI.Column surface="panel" padding="md" radius="xl" gap="gap-1" className="border border-white/10 bg-white/5">
              <Text variant="inverse" className="font-['Sora'] text-2xl font-semibold">{previewLessons}</Text>
              <Text variant="muted-inverse" size="sm">Preview lessons</Text>
            </LayoutUI.Column>
            <LayoutUI.Column surface="panel" padding="md" radius="xl" gap="gap-1" className="border border-white/10 bg-white/5">
              <Text variant="inverse" className="font-['Sora'] text-2xl font-semibold">{course.sections.length}</Text>
              <Text variant="muted-inverse" size="sm">Sections</Text>
            </LayoutUI.Column>
          </LayoutUI.Container>
        </LayoutUI.Column>
      )}
    >
      <CardUI.Card tone="inverse" className="border border-black/10 shadow-[0_24px_80px_rgba(4,9,12,0.08)]">
        <CardUI.CardContent padding="auth" spacing="lg">
          <LayoutUI.Row justify="justify-between" align="items-start" className="gap-4 max-md:flex-col">
            <LayoutUI.Column gap="gap-2">
              <Text variant="inverse" className="font-['Sora'] text-2xl font-semibold">
                Ready to start?
              </Text>
              <Text variant="muted-inverse">
                Enroll to unlock the full lesson flow, keep progress synced, and move into your personal learning hub.
              </Text>
            </LayoutUI.Column>
            <Badge variant={course.status === 'published' ? 'success' : 'secondary'}>{course.status}</Badge>
          </LayoutUI.Row>
          <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <LayoutUI.Column gap="gap-2" surface="panel" padding="md" radius="xl">
              <LayoutUI.Row justify="justify-between">
                <Text variant="muted-inverse">Estimated duration</Text>
                <Text variant="inverse">{course.estimated_minutes} minutes</Text>
              </LayoutUI.Row>
              <LayoutUI.Row justify="justify-between">
                <Text variant="muted-inverse">Preview lessons</Text>
                <Text variant="inverse">{previewLessons}</Text>
              </LayoutUI.Row>
              <Progress value={Math.min((previewLessons / Math.max(totalLessons, 1)) * 100, 100)} />
            </LayoutUI.Column>
            <LayoutUI.Column gap="gap-3" className="justify-center">
              <Button
                variant="accent"
                size="form"
                disabled={isPending}
                onClick={() => {
                  if (!isAuthenticated) {
                    navigate('/sign-in');
                    return;
                  }
                  enrollCourse(course.id, {
                    onSuccess: () => navigate('/learning/hub'),
                  });
                }}
              >
                <Icons.PlayCircle size={18} />
                {isAuthenticated ? (isPending ? 'Enrolling...' : 'Enroll and continue') : 'Sign in to enroll'}
              </Button>
              <Button asChild variant="ghost-inverse" size="form">
                <Link to="/learning/hub">Open my learning hub</Link>
              </Button>
            </LayoutUI.Column>
          </LayoutUI.Container>
        </CardUI.CardContent>
      </CardUI.Card>

      <LayoutUI.Column gap="gap-6">
        {course.sections.map((section, sectionIndex) => (
          <CardUI.Card key={section.id} tone="inverse" className="border border-black/10 shadow-[0_16px_40px_rgba(4,9,12,0.06)]">
            <CardUI.CardContent padding="auth" spacing="lg">
              <LayoutUI.Column gap="gap-4">
                <LayoutUI.Row justify="justify-between" align="items-start" className="gap-4">
                  <LayoutUI.Column gap="gap-2">
                    <Text variant="muted-inverse" size="sm">Section {sectionIndex + 1}</Text>
                    <Text variant="inverse" className="font-['Sora'] text-xl font-semibold">{section.title}</Text>
                    {section.description ? <Text variant="muted-inverse">{section.description}</Text> : null}
                  </LayoutUI.Column>
                </LayoutUI.Row>

                <LayoutUI.Column gap="gap-3">
                  {section.lessons.map((lesson, lessonIndex) => (
                    <LayoutUI.Row
                      key={lesson.id}
                      surface="panel"
                      padding="md"
                      radius="xl"
                      justify="justify-between"
                      align="items-start"
                      className="gap-4 max-md:flex-col"
                    >
                      <LayoutUI.Column gap="gap-2">
                        <LayoutUI.Row className="flex-wrap" gap="gap-2">
                          <Badge variant="outline">Lesson {lessonIndex + 1}</Badge>
                          <Badge variant="outline">{lesson.lesson_type}</Badge>
                          {lesson.is_preview ? <Badge variant="success">Preview</Badge> : null}
                          {lesson.prerequisite_lesson_ids.length > 0 ? (
                            <Badge variant="secondary">Needs prerequisite</Badge>
                          ) : null}
                        </LayoutUI.Row>
                        <Text variant="inverse" className="font-medium">{lesson.title}</Text>
                        {lesson.summary ? <Text variant="muted-inverse">{lesson.summary}</Text> : null}
                      </LayoutUI.Column>
                      <Text variant="muted-inverse" size="sm">{lesson.duration_minutes} mins</Text>
                    </LayoutUI.Row>
                  ))}
                </LayoutUI.Column>
              </LayoutUI.Column>
            </CardUI.CardContent>
          </CardUI.Card>
        ))}
      </LayoutUI.Column>
    </LearningPublicShell>
  );
}
