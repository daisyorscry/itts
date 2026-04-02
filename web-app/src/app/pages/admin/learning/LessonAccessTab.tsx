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
import { useUpdateLesson } from '@feature/learning/hooks';
import { lessonFormSchema, normalizeRichTextContent, parsePrerequisiteIds } from '@feature/learning/types';
import { useSelectedLesson } from './course-builder.hooks';
import { buildDefaultLessonDraft } from './course-builder.shared';

function getFirstErrorMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? 'Please check the form fields.';
}

export function LessonAccessTab() {
  const { selectedLesson, prerequisiteOptions } = useSelectedLesson();
  const { mutate: updateLesson, isPending: isUpdatingLesson } = useUpdateLesson();
  const [lessonDraft, setLessonDraft] = useState(buildDefaultLessonDraft());

  useEffect(() => {
    if (!selectedLesson) {
      setLessonDraft(buildDefaultLessonDraft());
      return;
    }

    setLessonDraft({
      slug: selectedLesson.slug,
      title: selectedLesson.title,
      summary: selectedLesson.summary ?? '',
      content_json: normalizeRichTextContent(selectedLesson.content_json),
      video_url: selectedLesson.video_url ?? '',
      attachment_url: selectedLesson.attachment_url ?? '',
      lesson_type: selectedLesson.lesson_type,
      duration_minutes: selectedLesson.duration_minutes,
      sort_order: selectedLesson.sort_order,
      is_preview: selectedLesson.is_preview,
      is_published: selectedLesson.is_published,
      prerequisite_lesson_ids_text: selectedLesson.prerequisite_lesson_ids.join(', '),
    });
  }, [selectedLesson]);

  const selectedIds = parsePrerequisiteIds(lessonDraft.prerequisite_lesson_ids_text);

  const handleSaveLesson = () => {
    if (!selectedLesson) {
      return;
    }

    const parsed = lessonFormSchema.safeParse(lessonDraft);
    if (!parsed.success) {
      toast.error(getFirstErrorMessage(parsed.error));
      return;
    }

    updateLesson({
      id: selectedLesson.id,
      payload: {
        slug: parsed.data.slug,
        title: parsed.data.title,
        summary: parsed.data.summary || undefined,
        content_json: normalizeRichTextContent(parsed.data.content_json),
        video_url: parsed.data.video_url || undefined,
        attachment_url: parsed.data.attachment_url || undefined,
        lesson_type: parsed.data.lesson_type,
        duration_minutes: parsed.data.duration_minutes,
        sort_order: parsed.data.sort_order,
        is_preview: parsed.data.is_preview,
        is_published: parsed.data.is_published,
        prerequisite_lesson_ids: parsePrerequisiteIds(parsed.data.prerequisite_lesson_ids_text),
      },
    });
  };

  return (
    <CardUI.Card tone="inverse" border={false}>
      <CardUI.CardContent spacing="lg">
        <LayoutUI.Column gap="gap-4">
          <LayoutUI.Column gap="gap-2">
            <Text variant="inverse" className="font-medium">
              Lesson access rules
            </Text>
            <Text variant="muted-inverse" size="sm">
              Decide whether this lesson is previewable, published, and which lessons must be finished first.
            </Text>
          </LayoutUI.Column>

          <LayoutUI.Row surface="panel" padding="md" radius="xl" className="gap-3">
            <Switch checked={lessonDraft.is_preview} onCheckedChange={(checked) => setLessonDraft((current) => ({ ...current, is_preview: Boolean(checked) }))} />
            <LayoutUI.Column className="flex-1" gap="gap-1">
              <Text variant="inverse" size="sm" className="font-medium">
                Preview before enrollment
              </Text>
              <Text variant="muted-inverse" size="xs">
                Learners can see this lesson before enrolling in the course.
              </Text>
            </LayoutUI.Column>
          </LayoutUI.Row>

          <LayoutUI.Row surface="panel" padding="md" radius="xl" className="gap-3">
            <Switch checked={lessonDraft.is_published} onCheckedChange={(checked) => setLessonDraft((current) => ({ ...current, is_published: Boolean(checked) }))} />
            <LayoutUI.Column className="flex-1" gap="gap-1">
              <Text variant="inverse" size="sm" className="font-medium">
                Published to learners
              </Text>
              <Text variant="muted-inverse" size="xs">
                Draft lessons stay hidden until you publish them.
              </Text>
            </LayoutUI.Column>
          </LayoutUI.Row>

          <LayoutUI.Column gap="gap-3">
            <Text variant="inverse" className="font-medium">
              Prerequisites
            </Text>
            {prerequisiteOptions.length ? (
              <div className="grid gap-3 md:grid-cols-2">
                {prerequisiteOptions.map((lesson) => {
                  const isChecked = selectedIds.includes(lesson.id);

                  return (
                    <LayoutUI.Row key={lesson.id} surface="panel" padding="md" radius="xl" className="gap-3">
                      <Switch
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          const nextIds = checked ? [...selectedIds, lesson.id] : selectedIds.filter((entry) => entry !== lesson.id);
                          setLessonDraft((current) => ({
                            ...current,
                            prerequisite_lesson_ids_text: nextIds.join(', '),
                          }));
                        }}
                      />
                      <LayoutUI.Column className="flex-1" gap="gap-1">
                        <Text variant="inverse" size="sm" className="font-medium">
                          {lesson.title}
                        </Text>
                        <Text variant="muted-inverse" size="xs">
                          {lesson.section_title}
                        </Text>
                      </LayoutUI.Column>
                    </LayoutUI.Row>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-black/10 px-4 py-4">
                <Text variant="muted-inverse" size="sm">
                  No prerequisite lessons available yet.
                </Text>
              </div>
            )}
          </LayoutUI.Column>

          <FormUI.FormField id="raw-prerequisite-ids" label="Raw prerequisite IDs" tone="inverse">
            <Input
              id="raw-prerequisite-ids"
              value={lessonDraft.prerequisite_lesson_ids_text}
              onChange={(event) => setLessonDraft((current) => ({ ...current, prerequisite_lesson_ids_text: event.target.value }))}
              tone="inverse"
              placeholder="Optional manual override"
            />
          </FormUI.FormField>

          <LayoutUI.Row justify="justify-end">
            <Button type="button" variant="accent" size="form" disabled={isUpdatingLesson} onClick={handleSaveLesson}>
              <Icons.Save size={18} />
              {isUpdatingLesson ? 'Saving...' : 'Save access rules'}
            </Button>
          </LayoutUI.Row>
        </LayoutUI.Column>
      </CardUI.CardContent>
    </CardUI.Card>
  );
}
