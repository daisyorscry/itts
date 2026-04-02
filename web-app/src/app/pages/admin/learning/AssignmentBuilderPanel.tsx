import { useEffect, useState } from 'react';
import { z } from 'zod';
import * as Icons from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@components/ui/button';
import * as CardUI from '@components/ui/card';
import * as FormUI from '@components/ui/form';
import { Input } from '@components/ui/input';
import * as LayoutUI from '@components/ui/layout';
import { Switch } from '@components/ui/switch';
import { Text } from '@components/ui/text';
import { Textarea } from '@components/ui/textarea';
import { useAssignment, useCreateAssignment, useDeleteAssignment, useUpdateAssignment } from '@feature/learning/hooks';
import { assignmentFormSchema, type AssignmentFormData, type CreateAssignmentRequest, type UpdateAssignmentRequest } from '@feature/learning/types';
import { useSelectedLesson } from './course-builder.hooks';
import { buildDefaultAssignmentDraft } from './course-builder.shared';

function getFirstErrorMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? 'Please check the form fields.';
}

export function AssignmentBuilderPanel() {
  const { selectedLesson } = useSelectedLesson();
  const { mutate: createAssignment, isPending: isCreatingAssignment } = useCreateAssignment();
  const { mutate: updateAssignment, isPending: isUpdatingAssignment } = useUpdateAssignment();
  const { mutate: deleteAssignment, isPending: isDeletingAssignment } = useDeleteAssignment();
  const { data: assignment } = useAssignment(selectedLesson?.assignment_id ?? '', Boolean(selectedLesson?.assignment_id));
  const [assignmentDraft, setAssignmentDraft] = useState<AssignmentFormData>(buildDefaultAssignmentDraft());

  useEffect(() => {
    if (!assignment) {
      setAssignmentDraft(buildDefaultAssignmentDraft());
      return;
    }

    setAssignmentDraft({
      title: assignment.title,
      instructions: assignment.instructions ?? '',
      due_at: assignment.due_at ? assignment.due_at.slice(0, 16) : '',
      max_score: assignment.max_score ?? undefined,
      allow_text_submission: assignment.allow_text_submission,
      allow_link_submission: assignment.allow_link_submission,
      allow_file_submission: assignment.allow_file_submission,
      is_active: assignment.is_active,
      is_auto_approve: assignment.is_auto_approve,
    });
  }, [assignment]);

  const handleSaveAssignment = () => {
    if (!selectedLesson) {
      return;
    }

    const parsed = assignmentFormSchema.safeParse(assignmentDraft);
    if (!parsed.success) {
      toast.error(getFirstErrorMessage(parsed.error));
      return;
    }

    const payload: CreateAssignmentRequest | UpdateAssignmentRequest = {
      title: parsed.data.title,
      instructions: parsed.data.instructions || undefined,
      due_at: parsed.data.due_at || undefined,
      max_score: parsed.data.max_score,
      allow_text_submission: parsed.data.allow_text_submission,
      allow_link_submission: parsed.data.allow_link_submission,
      allow_file_submission: parsed.data.allow_file_submission,
      is_active: parsed.data.is_active,
      is_auto_approve: parsed.data.is_auto_approve,
    };

    if (selectedLesson.assignment_id) {
      updateAssignment({ id: selectedLesson.assignment_id, payload: payload as UpdateAssignmentRequest });
      return;
    }

    createAssignment({ lessonId: selectedLesson.id, payload: payload as CreateAssignmentRequest });
  };

  if (!selectedLesson || (selectedLesson.lesson_type !== 'assignment' && !selectedLesson.assignment_id)) {
    return null;
  }

  return (
    <CardUI.Card tone="inverse" border={false}>
      <CardUI.CardContent spacing="lg">
        <LayoutUI.Row justify="justify-between" align="items-start" className="gap-4 max-md:flex-col">
          <LayoutUI.Column gap="gap-2">
            <Text variant="inverse" className="font-medium">
              Assignment builder
            </Text>
            <Text variant="muted-inverse" size="sm">
              Configure instructions, due date, and allowed submission methods for this lesson.
            </Text>
          </LayoutUI.Column>
          {selectedLesson.assignment_id ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isDeletingAssignment}
              onClick={() => {
                if (!selectedLesson.assignment_id || !window.confirm('Delete this assignment?')) {
                  return;
                }
                deleteAssignment(selectedLesson.assignment_id);
              }}
            >
              <Icons.Trash2 size={16} />
              {isDeletingAssignment ? 'Deleting...' : 'Delete assignment'}
            </Button>
          ) : null}
        </LayoutUI.Row>

        <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormUI.FormField id="assignment-title" label="Title" tone="inverse">
            <Input id="assignment-title" value={assignmentDraft.title} onChange={(event) => setAssignmentDraft((current) => ({ ...current, title: event.target.value }))} tone="inverse" />
          </FormUI.FormField>
          <FormUI.FormField id="assignment-due-at" label="Due at" tone="inverse">
            <Input id="assignment-due-at" type="datetime-local" value={assignmentDraft.due_at ?? ''} onChange={(event) => setAssignmentDraft((current) => ({ ...current, due_at: event.target.value }))} tone="inverse" />
          </FormUI.FormField>
        </LayoutUI.Container>

        <FormUI.FormField id="assignment-instructions" label="Instructions" tone="inverse">
          <Textarea id="assignment-instructions" value={assignmentDraft.instructions} onChange={(event) => setAssignmentDraft((current) => ({ ...current, instructions: event.target.value }))} rows={5} />
        </FormUI.FormField>

        <FormUI.FormField id="assignment-max-score" label="Max score" tone="inverse">
          <Input id="assignment-max-score" type="number" value={assignmentDraft.max_score ?? ''} onChange={(event) => setAssignmentDraft((current) => ({ ...current, max_score: event.target.value ? Number(event.target.value) : undefined }))} tone="inverse" />
        </FormUI.FormField>

        <LayoutUI.Container className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {[
            { key: 'allow_text_submission', label: 'Allow text submission', description: 'Learners can submit written answers directly.' },
            { key: 'allow_link_submission', label: 'Allow link submission', description: 'Learners can submit GitHub, Drive, or portfolio links.' },
            { key: 'allow_file_submission', label: 'Allow file submission', description: 'Learners can upload supporting files when submitting.' },
            { key: 'is_auto_approve', label: 'Auto approve', description: 'Submission instantly passes without instructor review.' },
            { key: 'is_active', label: 'Assignment active', description: 'Turn this off to hide the assignment temporarily.' },
          ].map((toggle) => (
            <LayoutUI.Row key={toggle.key} surface="panel" padding="md" radius="xl" className="gap-3">
              <Switch checked={Boolean(assignmentDraft[toggle.key as keyof AssignmentFormData])} onCheckedChange={(checked) => setAssignmentDraft((current) => ({ ...current, [toggle.key]: Boolean(checked) }))} />
              <LayoutUI.Column className="flex-1" gap="gap-1">
                <Text variant="inverse" size="sm" className="font-medium">
                  {toggle.label}
                </Text>
                <Text variant="muted-inverse" size="xs">
                  {toggle.description}
                </Text>
              </LayoutUI.Column>
            </LayoutUI.Row>
          ))}
        </LayoutUI.Container>

        <LayoutUI.Row justify="justify-end">
          <Button type="button" variant="accent" size="form" disabled={isCreatingAssignment || isUpdatingAssignment} onClick={handleSaveAssignment}>
            <Icons.Save size={18} />
            {isCreatingAssignment || isUpdatingAssignment ? 'Saving...' : 'Save assignment'}
          </Button>
        </LayoutUI.Row>
      </CardUI.CardContent>
    </CardUI.Card>
  );
}
