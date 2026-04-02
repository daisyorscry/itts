import { useEffect, useMemo, useState } from 'react';
import * as Icons from 'lucide-react';
import * as CardUI from '@components/ui/card';
import * as LayoutUI from '@components/ui/layout';
import * as AvatarUI from '@components/ui/avatar';
import * as SelectUI from '@components/ui/select';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import * as FormUI from '@components/ui/form';
import { Input } from '@components/ui/input';
import { DataPagination } from '@components/ui/pagination';
import { SearchField } from '@components/ui/search';
import { DataTable, type DataTableColumn } from '@components/ui/table';
import { Text } from '@components/ui/text';
import { Textarea } from '@components/ui/textarea';
import { QueryStatePanel } from '@components/query-state-panel';
import {
  useAdminCourse,
  useAssignment,
  useAssignmentSubmissions,
  useListAdminCourses,
  useReviewAssignmentSubmission,
} from '@feature/learning/hooks';
import type { AssignmentSubmission, ReviewAssignmentSubmissionRequest } from '@feature/learning/types';

interface CourseAssignmentOption {
  assignmentId: string;
  lessonTitle: string;
  sectionTitle: string;
}

function getInitials(name?: string, fallback?: string) {
  const source = (name || fallback || '?').trim();
  const parts = source.split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return '?';
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('');
}

function createSubmissionColumns(onSelect: (submission: AssignmentSubmission) => void): Array<DataTableColumn<AssignmentSubmission>> {
  return [
    {
      id: 'user',
      header: 'Learner',
      cell: ({ row }) => (
        <LayoutUI.Row gap="gap-3" align="items-center">
          <AvatarUI.Avatar className="size-10 border border-black/10">
            <AvatarUI.AvatarFallback className="bg-[#29E68C1F] font-semibold text-[#04090C]">
              {getInitials(row.user_full_name, row.user_email || row.user_id)}
            </AvatarUI.AvatarFallback>
          </AvatarUI.Avatar>
          <LayoutUI.Column gap="gap-1">
            <Text variant="inverse" className="font-medium">{row.user_full_name || row.user_id}</Text>
            <Text variant="muted-inverse" size="xs">{row.user_email || row.user_id}</Text>
          </LayoutUI.Column>
        </LayoutUI.Row>
      ),
    },
    {
      id: 'submission',
      header: 'Submission',
      cell: ({ row }) => (
        <Text variant="muted-inverse" className="max-w-xs truncate">
          {row.submission_text || row.submission_url || row.attachment_url || 'No content'}
        </Text>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.status === 'approved' ? 'success' : row.status === 'rejected' ? 'destructive' : 'secondary'}>
          {row.status}
        </Badge>
      ),
    },
    {
      id: 'submitted_at',
      header: 'Submitted',
      accessorKey: 'submitted_at',
      cell: ({ row }) => <Text variant="muted-inverse">{new Date(row.submitted_at).toLocaleString()}</Text>,
    },
    {
      id: 'action',
      header: '',
      align: 'right',
      cell: ({ row }) => (
        <Button type="button" variant="ghost-inverse" size="sm" onClick={() => onSelect(row)}>
          Review
        </Button>
      ),
    },
  ];
}

export function AdminLearningAssignmentReviews() {
  const [courseSearch, setCourseSearch] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState('');
  const [selectedSubmissionId, setSelectedSubmissionId] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected'>('approved');
  const [reviewScore, setReviewScore] = useState('');
  const [reviewFeedback, setReviewFeedback] = useState('');

  const { data: courses, isLoading: isLoadingCourses } = useListAdminCourses({
    page_size: 100,
    search: courseSearch || undefined,
  });
  const courseOptions = courses?.data ?? [];

  useEffect(() => {
    if (!courseOptions.length) {
      setSelectedCourseId('');
      return;
    }
    setSelectedCourseId((current) => (current && courseOptions.some((course) => course.id === current) ? current : courseOptions[0].id));
  }, [courseOptions]);

  const { data: courseDetail, isLoading: isLoadingCourseDetail, error: courseDetailError } = useAdminCourse(
    selectedCourseId,
    Boolean(selectedCourseId),
  );

  const assignmentOptions = useMemo<CourseAssignmentOption[]>(
    () =>
      (courseDetail?.sections ?? []).flatMap((section) =>
        section.lessons
          .filter((lesson) => Boolean(lesson.assignment_id))
          .map((lesson) => ({
            assignmentId: lesson.assignment_id,
            lessonTitle: lesson.title,
            sectionTitle: section.title,
          })),
      ) ?? [],
    [courseDetail],
  );

  useEffect(() => {
    if (!assignmentOptions.length) {
      setSelectedAssignmentId('');
      return;
    }
    setSelectedAssignmentId((current) =>
      current && assignmentOptions.some((assignment) => assignment.assignmentId === current)
        ? current
        : assignmentOptions[0].assignmentId,
    );
    setPage(1);
  }, [assignmentOptions]);

  const { data: assignment } = useAssignment(selectedAssignmentId, Boolean(selectedAssignmentId));
  const {
    data: submissions,
    isLoading: isLoadingSubmissions,
    error: submissionsError,
  } = useAssignmentSubmissions(selectedAssignmentId, { page, page_size: pageSize }, Boolean(selectedAssignmentId));
  const { mutate: reviewSubmission, isPending: isReviewing } = useReviewAssignmentSubmission();

  const submissionList = submissions?.data ?? [];
  const selectedSubmission = submissionList.find((submission) => submission.id === selectedSubmissionId) ?? submissionList[0] ?? null;

  useEffect(() => {
    if (!selectedSubmission) {
      setSelectedSubmissionId('');
      setReviewStatus('approved');
      setReviewScore('');
      setReviewFeedback('');
      return;
    }

    setSelectedSubmissionId(selectedSubmission.id);
    setReviewStatus(selectedSubmission.status === 'rejected' ? 'rejected' : 'approved');
    setReviewScore(selectedSubmission.score != null ? String(selectedSubmission.score) : '');
    setReviewFeedback(selectedSubmission.feedback ?? '');
  }, [selectedSubmission?.id]);

  const activeAssignmentOption = assignmentOptions.find((item) => item.assignmentId === selectedAssignmentId) ?? null;

  const handleSubmitReview = () => {
    if (!selectedSubmission) {
      return;
    }

    const payload: ReviewAssignmentSubmissionRequest = {
      status: reviewStatus,
      score: reviewScore ? Number(reviewScore) : undefined,
      feedback: reviewFeedback || undefined,
    };

    reviewSubmission({
      id: selectedSubmission.id,
      payload,
    });
  };

  return (
    <LayoutUI.Column gap="gap-6">
      <LayoutUI.Row justify="justify-between" align="items-start" className="gap-4 max-md:flex-col">
        <LayoutUI.Column gap="gap-2">
          <Text as="h1" variant="inverse" className="font-['Sora'] text-3xl font-bold">
            Assignment reviews
          </Text>
          <Text variant="muted-inverse">
            Select a course assignment, inspect learner submissions, then approve or reject with feedback.
          </Text>
        </LayoutUI.Column>
      </LayoutUI.Row>

      <LayoutUI.Container className="grid grid-cols-1 gap-6 xl:grid-cols-[360px_1fr]">
        <LayoutUI.Column gap="gap-6">
          <CardUI.Card tone="inverse">
            <CardUI.CardContent padding="auth" spacing="lg">
              <Text variant="inverse" className="font-['Sora'] text-lg font-semibold">Choose assignment</Text>
              <SearchField
                value={courseSearch}
                onChange={(event) => setCourseSearch(event.target.value)}
                placeholder="Search courses"
              />
              <FormUI.FormField id="review-course" label="Course" tone="inverse">
                <SelectUI.Select value={selectedCourseId || '__empty__'} onValueChange={(value) => setSelectedCourseId(value === '__empty__' ? '' : value)}>
                  <SelectUI.SelectTrigger appearance="admin">
                    <SelectUI.SelectValue placeholder="Select course" />
                  </SelectUI.SelectTrigger>
                  <SelectUI.SelectContent appearance="admin">
                    {courseOptions.length === 0 ? (
                      <SelectUI.SelectItem value="__empty__">No courses</SelectUI.SelectItem>
                    ) : (
                      courseOptions.map((course) => (
                        <SelectUI.SelectItem key={course.id} value={course.id}>
                          {course.title}
                        </SelectUI.SelectItem>
                      ))
                    )}
                  </SelectUI.SelectContent>
                </SelectUI.Select>
              </FormUI.FormField>

              <FormUI.FormField id="review-assignment" label="Assignment" tone="inverse">
                <SelectUI.Select
                  value={selectedAssignmentId || '__empty__'}
                  onValueChange={(value) => setSelectedAssignmentId(value === '__empty__' ? '' : value)}
                  disabled={!assignmentOptions.length}
                >
                  <SelectUI.SelectTrigger appearance="admin">
                    <SelectUI.SelectValue placeholder="Select assignment" />
                  </SelectUI.SelectTrigger>
                  <SelectUI.SelectContent appearance="admin">
                    {assignmentOptions.length === 0 ? (
                      <SelectUI.SelectItem value="__empty__">No assignments</SelectUI.SelectItem>
                    ) : (
                      assignmentOptions.map((option) => (
                        <SelectUI.SelectItem key={option.assignmentId} value={option.assignmentId}>
                          {option.sectionTitle} - {option.lessonTitle}
                        </SelectUI.SelectItem>
                      ))
                    )}
                  </SelectUI.SelectContent>
                </SelectUI.Select>
              </FormUI.FormField>

              {assignment ? (
                <LayoutUI.Column surface="panel" padding="md" radius="xl" gap="gap-2">
                  <Text variant="inverse" className="font-medium">{assignment.title}</Text>
                  {activeAssignmentOption ? (
                    <Text variant="muted-inverse" size="sm">{activeAssignmentOption.sectionTitle} / {activeAssignmentOption.lessonTitle}</Text>
                  ) : null}
                  {assignment.instructions ? <Text variant="muted-inverse" size="sm">{assignment.instructions}</Text> : null}
                </LayoutUI.Column>
              ) : null}
            </CardUI.CardContent>
          </CardUI.Card>

          <CardUI.Card tone="inverse">
            <CardUI.CardContent padding="auth" spacing="lg">
              <Text variant="inverse" className="font-['Sora'] text-lg font-semibold">Review form</Text>
              {selectedSubmission ? (
                <LayoutUI.Column gap="gap-4">
                  <LayoutUI.Row justify="justify-between" align="items-start" className="gap-3">
                    <LayoutUI.Row gap="gap-3" align="items-center">
                      <AvatarUI.Avatar className="size-14 border border-black/10">
                        <AvatarUI.AvatarFallback className="bg-[#29E68C1F] text-base font-semibold text-[#04090C]">
                          {getInitials(selectedSubmission.user_full_name, selectedSubmission.user_email || selectedSubmission.user_id)}
                        </AvatarUI.AvatarFallback>
                      </AvatarUI.Avatar>
                      <Text variant="inverse" className="font-medium">{selectedSubmission.user_full_name || selectedSubmission.user_id}</Text>
                    </LayoutUI.Row>
                    <Badge variant={selectedSubmission.status === 'approved' ? 'success' : selectedSubmission.status === 'rejected' ? 'destructive' : 'secondary'}>
                      {selectedSubmission.status}
                    </Badge>
                  </LayoutUI.Row>
                  <LayoutUI.Column surface="panel" padding="md" radius="xl" gap="gap-1">
                    <Text variant="muted-inverse" size="xs">Learner profile</Text>
                    <Text variant="inverse" className="font-medium">{selectedSubmission.user_full_name || selectedSubmission.user_id}</Text>
                    <Text variant="muted-inverse" size="sm">{selectedSubmission.user_email || '-'}</Text>
                  </LayoutUI.Column>
                  <FormUI.FormField id="review-status" label="Decision" tone="inverse">
                    <SelectUI.Select value={reviewStatus} onValueChange={(value) => setReviewStatus(value as 'approved' | 'rejected')}>
                      <SelectUI.SelectTrigger appearance="admin">
                        <SelectUI.SelectValue placeholder="Select decision" />
                      </SelectUI.SelectTrigger>
                      <SelectUI.SelectContent appearance="admin">
                        <SelectUI.SelectItem value="approved">Approve</SelectUI.SelectItem>
                        <SelectUI.SelectItem value="rejected">Reject</SelectUI.SelectItem>
                      </SelectUI.SelectContent>
                    </SelectUI.Select>
                  </FormUI.FormField>
                  <FormUI.FormField id="review-score" label="Score" tone="inverse">
                    <Input
                      id="review-score"
                      type="number"
                      value={reviewScore}
                      onChange={(event) => setReviewScore(event.target.value)}
                      placeholder="Optional score"
                      tone="inverse"
                    />
                  </FormUI.FormField>
                  <FormUI.FormField id="review-feedback" label="Feedback" tone="inverse">
                    <Textarea
                      id="review-feedback"
                      value={reviewFeedback}
                      onChange={(event) => setReviewFeedback(event.target.value)}
                      rows={6}
                    />
                  </FormUI.FormField>
                  {selectedSubmission.reviewed_by_name ? (
                    <Text variant="muted-inverse" size="sm">
                      Last reviewed by {selectedSubmission.reviewed_by_name}
                    </Text>
                  ) : null}
                  <Button type="button" onClick={handleSubmitReview} disabled={isReviewing} variant="accent" size="form">
                    <Icons.Save size={18} />
                    {isReviewing ? 'Saving...' : 'Submit review'}
                  </Button>
                </LayoutUI.Column>
              ) : (
                <QueryStatePanel icon={Icons.FileCheck2} title="Select a submission" description="Choose a learner submission from the table to start reviewing." />
              )}
            </CardUI.CardContent>
          </CardUI.Card>
        </LayoutUI.Column>

        <CardUI.Card tone="inverse" className="overflow-hidden">
          <CardUI.CardContent padding="auth" spacing="lg">
            {isLoadingCourses || isLoadingCourseDetail ? (
              <QueryStatePanel icon={Icons.LoaderCircle} title="Loading review workspace" description="Fetching courses and assignments." />
            ) : courseDetailError ? (
              <QueryStatePanel icon={Icons.AlertCircle} tone="error" title="Failed to load course detail" description="Please try another course or refresh this page." />
            ) : !selectedAssignmentId ? (
              <QueryStatePanel icon={Icons.BookOpenCheck} title="No assignments available" description="This course does not have any assignments yet." />
            ) : isLoadingSubmissions ? (
              <QueryStatePanel icon={Icons.LoaderCircle} title="Loading submissions" description="Fetching learner work for review." />
            ) : submissionsError ? (
              <QueryStatePanel icon={Icons.AlertCircle} tone="error" title="Failed to load submissions" description="Please refresh and try again." />
            ) : (
              <LayoutUI.Column gap="gap-4">
                <LayoutUI.Row justify="justify-between" align="items-center" className="gap-3 max-md:flex-col max-md:items-start">
                  <LayoutUI.Column gap="gap-1">
                    <Text variant="inverse" className="font-['Sora'] text-lg font-semibold">Submissions</Text>
                    <Text variant="muted-inverse" size="sm">
                      {assignment?.title ?? 'Selected assignment'}
                    </Text>
                  </LayoutUI.Column>
                  <Badge variant="outline">{submissions?.total ?? 0} total</Badge>
                </LayoutUI.Row>

                <DataTable
                  data={submissionList}
                  columns={createSubmissionColumns((submission) => setSelectedSubmissionId(submission.id))}
                  rowKey="id"
                  emptyMessage="No submissions available for this assignment yet."
                  onRowClick={(submission) => setSelectedSubmissionId(submission.id)}
                  rowClassName={(submission) => (submission.id === selectedSubmission?.id ? 'bg-[#29E68C1A]' : undefined)}
                />

                {submissions ? (
                  <DataPagination
                    pagination={submissions}
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
      </LayoutUI.Container>
    </LayoutUI.Column>
  );
}
