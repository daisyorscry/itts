import { useEffect, useState } from 'react';
import { z } from 'zod';
import * as Icons from 'lucide-react';
import toast from 'react-hot-toast';
import { BlogEditor } from '@components/blog/BlogEditor';
import { Button } from '@components/ui/button';
import * as CardUI from '@components/ui/card';
import * as FormUI from '@components/ui/form';
import { Input } from '@components/ui/input';
import * as LayoutUI from '@components/ui/layout';
import * as SelectUI from '@components/ui/select';
import { Switch } from '@components/ui/switch';
import { Text } from '@components/ui/text';
import { Textarea } from '@components/ui/textarea';
import { AdminLearningAssetUploadField } from '@feature/learning/components/AdminLearningAssetUploadField';
import { useUpdateLesson, useUploadLearningFile, useUploadLearningVideo } from '@feature/learning/hooks';
import { lessonFormSchema, normalizeRichTextContent, parsePrerequisiteIds } from '@feature/learning/types';
import { useSelectedLesson } from './course-builder.hooks';
import { buildDefaultLessonDraft, lessonTypeOptions } from './course-builder.shared';

function getFirstErrorMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? 'Please check the form fields.';
}

export function LessonContentTab() {
  const { selectedLesson } = useSelectedLesson();
  const { mutate: updateLesson, isPending: isUpdatingLesson } = useUpdateLesson();
  const uploadLearningFile = useUploadLearningFile();
  const uploadLearningVideo = useUploadLearningVideo();
  const [lessonDraft, setLessonDraft] = useState(buildDefaultLessonDraft());
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState('');
  const [uploadedAttachmentUrl, setUploadedAttachmentUrl] = useState('');

  useEffect(() => {
    if (!selectedLesson) {
      setLessonDraft(buildDefaultLessonDraft());
      setUploadedVideoUrl('');
      setUploadedAttachmentUrl('');
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
    setUploadedVideoUrl(selectedLesson.video_url ?? '');
    setUploadedAttachmentUrl(selectedLesson.attachment_url ?? '');
  }, [selectedLesson]);

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

  const handleLessonVideoUpload = async (file: File) => {
    const response = await uploadLearningVideo.mutateAsync(file);
    setLessonDraft((current) => ({ ...current, video_url: response.data.file_path }));
    setUploadedVideoUrl(response.data.file_url || response.data.file_path);
  };

  const handleLessonAttachmentUpload = async (file: File) => {
    const response = await uploadLearningFile.mutateAsync(file);
    setLessonDraft((current) => ({ ...current, attachment_url: response.data.file_path }));
    setUploadedAttachmentUrl(response.data.file_url || response.data.file_path);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <LayoutUI.Column gap="gap-6">
        <CardUI.Card tone="inverse" border={false}>
          <CardUI.CardContent spacing="lg">
            <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormUI.FormField id="lesson-title" label="Lesson title" tone="inverse">
                <Input id="lesson-title" value={lessonDraft.title} onChange={(event) => setLessonDraft((current) => ({ ...current, title: event.target.value }))} tone="inverse" />
              </FormUI.FormField>
              <FormUI.FormField id="lesson-slug" label="Slug" tone="inverse">
                <Input id="lesson-slug" value={lessonDraft.slug} onChange={(event) => setLessonDraft((current) => ({ ...current, slug: event.target.value }))} tone="inverse" />
              </FormUI.FormField>
            </LayoutUI.Container>

            <FormUI.FormField id="lesson-summary" label="Summary" tone="inverse">
              <Textarea
                id="lesson-summary"
                value={lessonDraft.summary}
                onChange={(event) => setLessonDraft((current) => ({ ...current, summary: event.target.value }))}
                rows={3}
                placeholder="Short learner-facing summary"
              />
            </FormUI.FormField>

            <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormUI.FormField id="lesson-type" label="Lesson type" tone="inverse">
                <SelectUI.Select value={lessonDraft.lesson_type} onValueChange={(value) => setLessonDraft((current) => ({ ...current, lesson_type: value as typeof current.lesson_type }))}>
                  <SelectUI.SelectTrigger appearance="admin">
                    <SelectUI.SelectValue placeholder="Select lesson type" />
                  </SelectUI.SelectTrigger>
                  <SelectUI.SelectContent appearance="admin">
                    {lessonTypeOptions.map((option) => (
                      <SelectUI.SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectUI.SelectItem>
                    ))}
                  </SelectUI.SelectContent>
                </SelectUI.Select>
              </FormUI.FormField>
              <FormUI.FormField id="lesson-duration" label="Duration (minutes)" tone="inverse">
                <Input
                  id="lesson-duration"
                  type="number"
                  value={lessonDraft.duration_minutes}
                  onChange={(event) => setLessonDraft((current) => ({ ...current, duration_minutes: Number(event.target.value || 0) }))}
                  tone="inverse"
                />
              </FormUI.FormField>
              <FormUI.FormField id="lesson-order" label="Sort order" tone="inverse">
                <Input
                  id="lesson-order"
                  type="number"
                  value={lessonDraft.sort_order}
                  onChange={(event) => setLessonDraft((current) => ({ ...current, sort_order: Number(event.target.value || 0) }))}
                  tone="inverse"
                />
              </FormUI.FormField>
            </LayoutUI.Container>
          </CardUI.CardContent>
        </CardUI.Card>

        {lessonDraft.lesson_type === 'article' ? (
          <CardUI.Card tone="inverse" border={false}>
            <CardUI.CardContent spacing="lg">
              <LayoutUI.Column gap="gap-3">
                <Text variant="inverse" className="font-medium">
                  Article content
                </Text>
                <Text variant="muted-inverse" size="sm">
                  Write the lesson body here with headings, lists, links, and images.
                </Text>
              </LayoutUI.Column>
              <BlogEditor content={lessonDraft.content_json} onChange={(value) => setLessonDraft((current) => ({ ...current, content_json: value }))} placeholder="Start writing the lesson here..." className="min-h-[420px]" />
            </CardUI.CardContent>
          </CardUI.Card>
        ) : null}

        {lessonDraft.lesson_type === 'video' ? (
          <CardUI.Card tone="inverse" border={false}>
            <CardUI.CardContent spacing="lg">
              <AdminLearningAssetUploadField
                id="lesson-video"
                label="Video file"
                description="Upload the lesson video file directly instead of pasting a raw URL."
                value={lessonDraft.video_url}
                previewUrl={uploadedVideoUrl}
                accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov,.m4v"
                isUploading={uploadLearningVideo.isPending}
                onSelect={handleLessonVideoUpload}
                onClear={() => setLessonDraft((current) => ({ ...current, video_url: '' }))}
              />
            </CardUI.CardContent>
          </CardUI.Card>
        ) : null}

        {lessonDraft.lesson_type === 'file' ? (
          <CardUI.Card tone="inverse" border={false}>
            <CardUI.CardContent spacing="lg">
              <AdminLearningAssetUploadField
                id="lesson-attachment"
                label="Attachment file"
                description="Upload slides, PDFs, worksheets, or handouts for this lesson."
                value={lessonDraft.attachment_url}
                previewUrl={uploadedAttachmentUrl}
                isUploading={uploadLearningFile.isPending}
                onSelect={handleLessonAttachmentUpload}
                onClear={() => setLessonDraft((current) => ({ ...current, attachment_url: '' }))}
              />
            </CardUI.CardContent>
          </CardUI.Card>
        ) : null}

        {lessonDraft.lesson_type === 'embed' ? (
          <CardUI.Card tone="inverse" border={false}>
            <CardUI.CardContent spacing="lg">
              <FormUI.FormField id="embed-url" label="Embed URL" tone="inverse">
                <Input
                  id="embed-url"
                  value={lessonDraft.video_url}
                  onChange={(event) => setLessonDraft((current) => ({ ...current, video_url: event.target.value }))}
                  tone="inverse"
                  placeholder="https://www.youtube.com/embed/..."
                />
              </FormUI.FormField>
            </CardUI.CardContent>
          </CardUI.Card>
        ) : null}

        {(lessonDraft.lesson_type === 'quiz' || lessonDraft.lesson_type === 'assignment') ? (
          <CardUI.Card tone="inverse" border={false}>
            <CardUI.CardContent spacing="lg">
              <LayoutUI.Row gap="gap-3" align="items-start" className="rounded-3xl border border-black/10 bg-black/[0.03] p-4">
                <Icons.Sparkles size={18} className="mt-0.5 shrink-0 text-[#29E68C]" />
                <LayoutUI.Column gap="gap-2">
                  <Text variant="inverse" className="font-medium">
                    Assessment-first lesson
                  </Text>
                  <Text variant="muted-inverse" size="sm">
                    This lesson type focuses on the assessment. Use the Assessment tab to configure the quiz or assignment itself.
                  </Text>
                </LayoutUI.Column>
              </LayoutUI.Row>
            </CardUI.CardContent>
          </CardUI.Card>
        ) : null}
      </LayoutUI.Column>

      <CardUI.Card tone="inverse" border={false} className="h-fit">
        <CardUI.CardContent spacing="lg">
          <LayoutUI.Column gap="gap-4">
            <Text variant="inverse" className="font-medium">
              Quick settings
            </Text>
            <LayoutUI.Row surface="panel" padding="md" radius="xl" className="gap-3">
              <Switch checked={lessonDraft.is_preview} onCheckedChange={(checked) => setLessonDraft((current) => ({ ...current, is_preview: Boolean(checked) }))} />
              <LayoutUI.Column className="flex-1" gap="gap-1">
                <Text variant="inverse" size="sm" className="font-medium">
                  Preview lesson
                </Text>
                <Text variant="muted-inverse" size="xs">
                  Allow learners to see this lesson before enrolling.
                </Text>
              </LayoutUI.Column>
            </LayoutUI.Row>
            <LayoutUI.Row surface="panel" padding="md" radius="xl" className="gap-3">
              <Switch checked={lessonDraft.is_published} onCheckedChange={(checked) => setLessonDraft((current) => ({ ...current, is_published: Boolean(checked) }))} />
              <LayoutUI.Column className="flex-1" gap="gap-1">
                <Text variant="inverse" size="sm" className="font-medium">
                  Published
                </Text>
                <Text variant="muted-inverse" size="xs">
                  Make this lesson visible inside the course.
                </Text>
              </LayoutUI.Column>
            </LayoutUI.Row>
            <Button type="button" variant="accent" size="form" disabled={isUpdatingLesson} onClick={handleSaveLesson}>
              <Icons.Save size={18} />
              {isUpdatingLesson ? 'Saving...' : 'Save lesson'}
            </Button>
          </LayoutUI.Column>
        </CardUI.CardContent>
      </CardUI.Card>
    </div>
  );
}
