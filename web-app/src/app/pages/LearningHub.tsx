import * as Icons from 'lucide-react';
import { useMemo, useState } from 'react';
import * as CardUI from '@components/ui/card';
import * as LayoutUI from '@components/ui/layout';
import * as TabsUI from '@components/ui/tabs';
import { Button } from '@components/ui/button';
import { Badge } from '@components/ui/badge';
import { Progress } from '@components/ui/progress';
import { SearchField } from '@components/ui/search';
import { Text } from '@components/ui/text';
import { Textarea } from '@components/ui/textarea';
import { QueryStatePanel } from '@components/query-state-panel';
import { LearningPublicShell } from '@feature/learning/components/LearningPublicShell';
import {
  useAssignment,
  useListPublicCourses,
  useMyAssignmentSubmissions,
  useMyCertificates,
  useMyEnrollments,
  usePublicCourse,
  useQuiz,
  useSubmitAssignment,
  useSubmitQuizAttempt,
  useUpdateLessonProgress,
} from '@feature/learning/hooks';

export function LearningHub() {
  const [search, setSearch] = useState('');
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState('');
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [assignmentText, setAssignmentText] = useState('');
  const [assignmentUrl, setAssignmentUrl] = useState('');
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string[]>>({});

  const { data: enrollments, isLoading: isLoadingEnrollments, error: enrollmentsError } = useMyEnrollments({
    search: search || undefined,
    page_size: 20,
  });
  const { data: courseCatalog } = useListPublicCourses({ page_size: 100 });
  const { data: certificates } = useMyCertificates({ page_size: 20 });
  const { data: submissions } = useMyAssignmentSubmissions({ page_size: 20 });
  const { mutate: updateProgress, isPending: isUpdatingProgress } = useUpdateLessonProgress();
  const { mutate: submitQuizAttempt, isPending: isSubmittingQuiz } = useSubmitQuizAttempt();
  const { mutate: submitAssignment, isPending: isSubmittingAssignment } = useSubmitAssignment();

  const enrollmentList = enrollments?.data ?? [];
  const selectedEnrollment = enrollmentList.find((item) => item.id === selectedEnrollmentId) ?? enrollmentList[0] ?? null;
  const selectedCourseSlug = useMemo(() => {
    const courses = courseCatalog?.data ?? [];
    return courses.find((item) => item.id === selectedEnrollment?.course_id)?.slug;
  }, [courseCatalog, selectedEnrollment?.course_id]);
  const { data: selectedCourse } = usePublicCourse(selectedCourseSlug ?? '', Boolean(selectedCourseSlug));
  const allLessons = selectedCourse?.sections.flatMap((section) => section.lessons) ?? [];
  const selectedLesson = allLessons.find((lesson) => lesson.id === selectedLessonId) ?? allLessons[0] ?? null;
  const { data: quiz } = useQuiz(selectedLesson?.quiz_id ?? '', Boolean(selectedLesson?.quiz_id));
  const { data: assignment } = useAssignment(selectedLesson?.assignment_id ?? '', Boolean(selectedLesson?.assignment_id));

  return (
    <LearningPublicShell
      eyebrow="Learning Hub"
      title="A learner workspace that finally matches the public site."
      description="Continue enrolled courses, submit work, and track earned certificates from a page that feels like part of the same product instead of a separate admin panel."
      leftMeta={(
        <LayoutUI.Row className="flex-wrap gap-3">
          <Badge variant="outline">{enrollmentList.length} active enrollments</Badge>
          <Badge variant="outline">{certificates?.data.length ?? 0} certificates</Badge>
          <Badge variant="outline">{submissions?.data.length ?? 0} submissions</Badge>
        </LayoutUI.Row>
      )}
      rightPanel={(
        <LayoutUI.Column gap="gap-4" className="mx-auto max-w-xl">
          <LayoutUI.Column surface="panel" padding="lg" radius="2xl" className="border border-white/10 bg-white/5">
            <Text variant="inverse" className="font-['Sora'] text-2xl font-semibold">Your progress stays in one place</Text>
            <Text variant="muted-inverse" className="leading-7">
              Move from learning flow to quiz, assignment, and certificate tracking without switching to a totally different visual system.
            </Text>
          </LayoutUI.Column>
          <LayoutUI.Container className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <LayoutUI.Column surface="panel" padding="md" radius="xl" gap="gap-1" className="border border-white/10 bg-white/5">
              <Text variant="inverse" className="font-['Sora'] text-2xl font-semibold">{enrollmentList.length}</Text>
              <Text variant="muted-inverse" size="sm">Courses</Text>
            </LayoutUI.Column>
            <LayoutUI.Column surface="panel" padding="md" radius="xl" gap="gap-1" className="border border-white/10 bg-white/5">
              <Text variant="inverse" className="font-['Sora'] text-2xl font-semibold">{certificates?.data.length ?? 0}</Text>
              <Text variant="muted-inverse" size="sm">Certificates</Text>
            </LayoutUI.Column>
            <LayoutUI.Column surface="panel" padding="md" radius="xl" gap="gap-1" className="border border-white/10 bg-white/5">
              <Text variant="inverse" className="font-['Sora'] text-2xl font-semibold">{submissions?.data.length ?? 0}</Text>
              <Text variant="muted-inverse" size="sm">Submissions</Text>
            </LayoutUI.Column>
          </LayoutUI.Container>
        </LayoutUI.Column>
      )}
    >
      <TabsUI.Tabs defaultValue="courses">
        <TabsUI.TabsList className="border border-black/10 bg-white/70 shadow-[0_10px_30px_rgba(4,9,12,0.04)]">
          <TabsUI.TabsTrigger value="courses">Courses</TabsUI.TabsTrigger>
          <TabsUI.TabsTrigger value="certificates">Certificates</TabsUI.TabsTrigger>
          <TabsUI.TabsTrigger value="submissions">Submissions</TabsUI.TabsTrigger>
        </TabsUI.TabsList>

        <TabsUI.TabsContent value="courses">
          <LayoutUI.Column gap="gap-6">
            <SearchField
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search enrolled courses"
              wrapperClassName="max-w-md"
            />

            {isLoadingEnrollments ? (
              <QueryStatePanel icon={Icons.LoaderCircle} title="Loading your enrollments" description="Fetching progress and available lessons." />
            ) : null}

            {!isLoadingEnrollments && enrollmentsError ? (
              <QueryStatePanel icon={Icons.AlertCircle} tone="error" title="Failed to load enrollments" description="Please refresh and try again." />
            ) : null}

            {!isLoadingEnrollments && !enrollmentsError && selectedEnrollment ? (
              <LayoutUI.Container className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_1fr]">
                <CardUI.Card tone="inverse" className="border border-black/10 shadow-[0_16px_40px_rgba(4,9,12,0.08)]">
                  <CardUI.CardContent padding="auth" spacing="lg">
                    <LayoutUI.Column gap="gap-3">
                      <Text variant="inverse" className="font-['Sora'] text-xl font-semibold">My courses</Text>
                      {enrollmentList.map((enrollment) => (
                        <button
                          key={enrollment.id}
                          type="button"
                          onClick={() => {
                            setSelectedEnrollmentId(enrollment.id);
                            setSelectedLessonId('');
                            setQuizAnswers({});
                          }}
                          className={`rounded-xl border px-4 py-3 text-left transition ${
                            selectedEnrollment.id === enrollment.id
                              ? 'border-[#29E68C] bg-[#29E68C1F]'
                              : 'border-black/10 bg-black/[0.03]'
                          }`}
                        >
                          <LayoutUI.Column gap="gap-2">
                            <Text variant="inverse" className="font-medium">{enrollment.course_title || enrollment.course_id}</Text>
                            <Progress value={enrollment.progress_percent} />
                            <Text variant="muted-inverse" size="sm">
                              {Math.round(enrollment.progress_percent)}% complete
                            </Text>
                          </LayoutUI.Column>
                        </button>
                      ))}
                    </LayoutUI.Column>
                  </CardUI.CardContent>
                </CardUI.Card>

                <LayoutUI.Column gap="gap-6">
                  <CardUI.Card tone="paper" className="border border-black/10 shadow-[0_16px_40px_rgba(4,9,12,0.06)]">
                    <CardUI.CardContent padding="auth" spacing="lg">
                      <LayoutUI.Row justify="justify-between" align="items-start" className="gap-4 max-md:flex-col">
                        <LayoutUI.Column gap="gap-2">
                          <Text as="h2" className="font-['Sora'] text-2xl font-semibold text-[#04090C]">
                            {selectedEnrollment.course_title || selectedCourse?.title || selectedEnrollment.course_id}
                          </Text>
                          <Text className="text-black/65">
                            Choose a lesson below and mark progress, submit quizzes, or upload assignments.
                          </Text>
                        </LayoutUI.Column>
                        <Badge variant={selectedEnrollment.status === 'completed' ? 'success' : 'secondary'}>
                          {selectedEnrollment.status}
                        </Badge>
                      </LayoutUI.Row>
                      <Progress value={selectedEnrollment.progress_percent} />
                    </CardUI.CardContent>
                  </CardUI.Card>

                  <LayoutUI.Container className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
                    <CardUI.Card tone="inverse" className="border border-black/10 shadow-[0_16px_40px_rgba(4,9,12,0.08)]">
                      <CardUI.CardContent padding="auth" spacing="lg">
                        <LayoutUI.Column gap="gap-3">
                          <Text variant="inverse" className="font-['Sora'] text-lg font-semibold">Lessons</Text>
                          {allLessons.map((lesson) => (
                            <button
                              key={lesson.id}
                              type="button"
                              onClick={() => {
                                setSelectedLessonId(lesson.id);
                                setQuizAnswers({});
                              }}
                              className={`rounded-xl border px-4 py-3 text-left ${
                                selectedLesson?.id === lesson.id
                                  ? 'border-[#29E68C] bg-[#29E68C1F]'
                                  : 'border-black/10 bg-black/[0.03]'
                              }`}
                            >
                              <LayoutUI.Column gap="gap-2">
                                <LayoutUI.Row className="flex-wrap" gap="gap-2">
                                  <Badge variant="outline">{lesson.lesson_type}</Badge>
                                  {lesson.prerequisite_lesson_ids.length > 0 ? <Badge variant="secondary">locked until prerequisite</Badge> : null}
                                </LayoutUI.Row>
                                <Text variant="inverse" className="font-medium">{lesson.title}</Text>
                                <Text variant="muted-inverse" size="sm">{lesson.duration_minutes} mins</Text>
                              </LayoutUI.Column>
                            </button>
                          ))}
                        </LayoutUI.Column>
                      </CardUI.CardContent>
                    </CardUI.Card>

                    {selectedLesson ? (
                      <CardUI.Card tone="paper" className="border border-black/10 shadow-[0_16px_40px_rgba(4,9,12,0.06)]">
                        <CardUI.CardContent padding="auth" spacing="lg">
                          <LayoutUI.Column gap="gap-5">
                            <LayoutUI.Column gap="gap-2">
                              <LayoutUI.Row className="flex-wrap" gap="gap-2">
                                <Badge variant="outline">{selectedLesson.lesson_type}</Badge>
                                {selectedLesson.prerequisite_lesson_ids.length > 0 ? (
                                  <Badge variant="secondary">{selectedLesson.prerequisite_lesson_ids.length} prerequisites</Badge>
                                ) : null}
                              </LayoutUI.Row>
                              <Text as="h3" className="font-['Sora'] text-2xl font-semibold text-[#04090C]">{selectedLesson.title}</Text>
                              {selectedLesson.summary ? <Text className="text-black/65">{selectedLesson.summary}</Text> : null}
                            </LayoutUI.Column>

                            <Button
                              variant="accent"
                              size="form"
                              disabled={isUpdatingProgress}
                              onClick={() =>
                                updateProgress({
                                  lessonId: selectedLesson.id,
                                  payload: {
                                    last_position_seconds: selectedLesson.duration_minutes * 60,
                                    time_spent_seconds: selectedLesson.duration_minutes * 60,
                                    is_completed: true,
                                  },
                                })
                              }
                            >
                              <Icons.CheckCircle size={18} />
                              {isUpdatingProgress ? 'Saving progress...' : 'Mark lesson complete'}
                            </Button>

                            {quiz && selectedLesson.quiz_id ? (
                              <LayoutUI.Column gap="gap-4">
                                <Text className="font-['Sora'] text-xl font-semibold text-[#04090C]">Quiz</Text>
                                {quiz.questions.map((question) => (
                                  <LayoutUI.Column key={question.id} gap="gap-3" surface="panel" padding="md" radius="xl">
                                    <Text className="font-medium text-[#04090C]">{question.question_text}</Text>
                                    {question.options.map((option) => {
                                      const selected = quizAnswers[question.id] ?? [];
                                      const isSelected = selected.includes(option.id);
                                      return (
                                        <button
                                          key={option.id}
                                          type="button"
                                          onClick={() => {
                                            setQuizAnswers((current) => {
                                              const previous = current[question.id] ?? [];
                                              const next =
                                                question.question_type === 'single_choice'
                                                  ? [option.id]
                                                  : isSelected
                                                    ? previous.filter((id) => id !== option.id)
                                                    : [...previous, option.id];
                                              return { ...current, [question.id]: next };
                                            });
                                          }}
                                          className={`rounded-xl border px-4 py-3 text-left ${
                                            isSelected ? 'border-[#29E68C] bg-[#29E68C1F]' : 'border-black/10 bg-white/70'
                                          }`}
                                        >
                                          {option.option_text}
                                        </button>
                                      );
                                    })}
                                  </LayoutUI.Column>
                                ))}
                                <Button
                                  variant="accent"
                                  size="form"
                                  disabled={isSubmittingQuiz}
                                  onClick={() =>
                                    submitQuizAttempt({
                                      quiz_id: quiz.id,
                                      answers: quiz.questions.map((question) => ({
                                        question_id: question.id,
                                        selected_option_ids: quizAnswers[question.id] ?? [],
                                      })),
                                    })
                                  }
                                >
                                  <Icons.Send size={18} />
                                  {isSubmittingQuiz ? 'Submitting quiz...' : 'Submit quiz'}
                                </Button>
                              </LayoutUI.Column>
                            ) : null}

                            {assignment && selectedLesson.assignment_id ? (
                              <LayoutUI.Column gap="gap-4">
                                <Text className="font-['Sora'] text-xl font-semibold text-[#04090C]">Assignment</Text>
                                {assignment.instructions ? <Text className="text-black/65">{assignment.instructions}</Text> : null}
                                {assignment.allow_text_submission ? (
                                  <Textarea
                                    value={assignmentText}
                                    onChange={(event) => setAssignmentText(event.target.value)}
                                    placeholder="Write your submission"
                                    rows={6}
                                  />
                                ) : null}
                                {assignment.allow_link_submission ? (
                                  <SearchField
                                    value={assignmentUrl}
                                    onChange={(event) => setAssignmentUrl(event.target.value)}
                                    placeholder="Paste submission URL"
                                  />
                                ) : null}
                                <Button
                                  variant="accent"
                                  size="form"
                                  disabled={isSubmittingAssignment}
                                  onClick={() =>
                                    submitAssignment({
                                      assignment_id: assignment.id,
                                      submission_text: assignmentText || undefined,
                                      submission_url: assignmentUrl || undefined,
                                    })
                                  }
                                >
                                  <Icons.Upload size={18} />
                                  {isSubmittingAssignment ? 'Submitting assignment...' : 'Submit assignment'}
                                </Button>
                              </LayoutUI.Column>
                            ) : null}
                          </LayoutUI.Column>
                        </CardUI.CardContent>
                      </CardUI.Card>
                    ) : (
                      <QueryStatePanel icon={Icons.BookOpen} title="Choose a lesson" description="Pick a lesson from your enrolled course to continue." />
                    )}
                  </LayoutUI.Container>
                </LayoutUI.Column>
              </LayoutUI.Container>
            ) : null}

            {!isLoadingEnrollments && !enrollmentsError && enrollmentList.length === 0 ? (
              <QueryStatePanel icon={Icons.GraduationCap} title="No enrollments yet" description="Enroll in a course from the learning catalog to start tracking progress." />
            ) : null}
          </LayoutUI.Column>
        </TabsUI.TabsContent>

        <TabsUI.TabsContent value="certificates">
          <CardUI.Card tone="paper" className="border border-black/10 shadow-[0_16px_40px_rgba(4,9,12,0.06)]">
            <CardUI.CardContent padding="auth" spacing="lg">
              {certificates?.data.length ? (
                <LayoutUI.Column gap="gap-4">
                  {certificates.data.map((certificate) => (
                    <LayoutUI.Row key={certificate.id} justify="justify-between" surface="panel" padding="md" radius="xl" className="gap-4 max-md:flex-col max-md:items-start">
                      <LayoutUI.Column gap="gap-1">
                        <Text className="font-medium text-[#04090C]">{certificate.certificate_number}</Text>
                        <Text className="text-sm text-black/60">{certificate.course_title || certificate.course_id}</Text>
                      </LayoutUI.Column>
                      <Badge variant={certificate.status === 'issued' ? 'success' : 'secondary'}>{certificate.status}</Badge>
                    </LayoutUI.Row>
                  ))}
                </LayoutUI.Column>
              ) : (
                <QueryStatePanel icon={Icons.BadgeCheck} title="No certificates yet" description="Certificates will appear here when you complete eligible courses." />
              )}
            </CardUI.CardContent>
          </CardUI.Card>
        </TabsUI.TabsContent>

        <TabsUI.TabsContent value="submissions">
          <CardUI.Card tone="paper" className="border border-black/10 shadow-[0_16px_40px_rgba(4,9,12,0.06)]">
            <CardUI.CardContent padding="auth" spacing="lg">
              {submissions?.data.length ? (
                <LayoutUI.Column gap="gap-4">
                  {submissions.data.map((submission) => (
                    <LayoutUI.Row key={submission.id} justify="justify-between" surface="panel" padding="md" radius="xl" className="gap-4 max-md:flex-col max-md:items-start">
                      <LayoutUI.Column gap="gap-1">
                        <Text className="font-medium text-[#04090C]">{submission.assignment_id}</Text>
                        <Text className="text-sm text-black/60">
                          {submission.user_full_name || submission.submission_text || submission.submission_url || 'Submitted assignment'}
                        </Text>
                      </LayoutUI.Column>
                      <Badge variant={submission.status === 'approved' ? 'success' : submission.status === 'rejected' ? 'destructive' : 'secondary'}>
                        {submission.status}
                      </Badge>
                    </LayoutUI.Row>
                  ))}
                </LayoutUI.Column>
              ) : (
                <QueryStatePanel icon={Icons.FileCheck2} title="No assignment submissions yet" description="Submitted tasks will be tracked here once you start working through assignments." />
              )}
            </CardUI.CardContent>
          </CardUI.Card>
        </TabsUI.TabsContent>
      </TabsUI.Tabs>
    </LearningPublicShell>
  );
}
