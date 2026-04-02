import { z } from 'zod';
import * as Icons from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { Checkbox } from '@components/ui/checkbox';
import { Button } from '@components/ui/button';
import * as CardUI from '@components/ui/card';
import * as FormUI from '@components/ui/form';
import { Input } from '@components/ui/input';
import * as LayoutUI from '@components/ui/layout';
import * as SelectUI from '@components/ui/select';
import { Text } from '@components/ui/text';
import { Textarea } from '@components/ui/textarea';
import { useCreateCourse } from '@feature/learning/hooks';
import { courseFormSchema, type CourseFormData, type CreateCourseRequest, type ProgramType } from '@feature/learning/types';

type CourseFormInput = z.input<typeof courseFormSchema>;

const levelOptions = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
] as const;

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
] as const;

const programOptions: Array<{ value: ProgramType; label: string }> = [
  { value: 'programming', label: 'Programming' },
  { value: 'networking', label: 'Networking' },
  { value: 'devsecops', label: 'DevSecOps' },
];

export function AdminLearningCourseCreate() {
  const navigate = useNavigate();
  const { mutate: createCourse, isPending } = useCreateCourse();
  const form = useForm<CourseFormInput, unknown, CourseFormData>({
    resolver: zodResolver(courseFormSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      slug: '',
      title: '',
      subtitle: '',
      description: '',
      thumbnail_url: '',
      program: 'programming',
      level: 'beginner',
      status: 'draft',
      estimated_minutes: 0,
      is_featured: false,
    },
  });
  const {
    control,
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = form;

  const isFeatured = Boolean(watch('is_featured'));

  const handleValidSubmit: SubmitHandler<CourseFormData> = (data) => {
    const payload: CreateCourseRequest = {
      slug: data.slug,
      title: data.title,
      subtitle: data.subtitle || undefined,
      description: data.description || undefined,
      thumbnail_url: data.thumbnail_url || undefined,
      program: data.program,
      level: data.level,
      status: data.status,
      estimated_minutes: data.estimated_minutes,
      is_featured: data.is_featured,
    };

    createCourse(payload, {
      onSuccess: (response) => {
        navigate(`/admin/learning/edit/${response.data.id}`);
      },
    });
  };

  return (
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
              Create course
            </Text>
            <Text variant="muted-inverse">
              Set the learning path foundation first, then continue to sections, lessons, quizzes, and assignments.
            </Text>
          </LayoutUI.Column>
        </LayoutUI.Row>
      </LayoutUI.Row>

      <FormUI.FormRoot onSubmit={handleSubmit(handleValidSubmit)}>
        <CardUI.Card tone="inverse">
          <CardUI.CardContent padding="auth" spacing="lg">
            <LayoutUI.Row className="border-b border-black/10 pb-4" gap="gap-3">
              <LayoutUI.Container surface="accent" radius="xl" className="flex h-10 w-10 items-center justify-center">
                <Icons.BookOpen className="text-[#29E68C]" size={20} />
              </LayoutUI.Container>
              <Text variant="inverse" className="font-['Sora'] text-lg font-semibold">
                Course profile
              </Text>
            </LayoutUI.Row>

            <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormUI.FormField id="title" label="Title" error={errors.title?.message} tone="inverse">
                <Input id="title" {...register('title')} hasError={Boolean(errors.title)} tone="inverse" />
              </FormUI.FormField>
              <FormUI.FormField id="slug" label="Slug" error={errors.slug?.message} tone="inverse">
                <Input id="slug" {...register('slug')} hasError={Boolean(errors.slug)} tone="inverse" />
              </FormUI.FormField>
            </LayoutUI.Container>

            <FormUI.FormField id="subtitle" label="Subtitle" error={errors.subtitle?.message} tone="inverse">
              <Input id="subtitle" {...register('subtitle')} tone="inverse" />
            </FormUI.FormField>

            <FormUI.FormField id="description" label="Description" error={errors.description?.message} tone="inverse">
              <Textarea id="description" {...register('description')} rows={5} hasError={Boolean(errors.description)} />
            </FormUI.FormField>

            <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-[1.2fr_0.8fr]">
              <FormUI.FormField id="thumbnail_url" label="Thumbnail URL" error={errors.thumbnail_url?.message} tone="inverse">
                <Input id="thumbnail_url" {...register('thumbnail_url')} hasError={Boolean(errors.thumbnail_url)} tone="inverse" />
              </FormUI.FormField>
              <FormUI.FormField id="estimated_minutes" label="Estimated minutes" error={errors.estimated_minutes?.message} tone="inverse">
                <Input
                  id="estimated_minutes"
                  type="number"
                  {...register('estimated_minutes')}
                  hasError={Boolean(errors.estimated_minutes)}
                  tone="inverse"
                />
              </FormUI.FormField>
            </LayoutUI.Container>

            <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormUI.FormField id="program" label="Program" error={errors.program?.message} tone="inverse">
                <Controller
                  control={control}
                  name="program"
                  render={({ field }) => (
                    <SelectUI.Select value={field.value ?? '__empty__'} onValueChange={(value) => field.onChange(value === '__empty__' ? undefined : value)}>
                      <SelectUI.SelectTrigger appearance="admin">
                        <SelectUI.SelectValue placeholder="Select program" />
                      </SelectUI.SelectTrigger>
                      <SelectUI.SelectContent appearance="admin">
                        <SelectUI.SelectItem value="__empty__">No program</SelectUI.SelectItem>
                        {programOptions.map((option) => (
                          <SelectUI.SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectUI.SelectItem>
                        ))}
                      </SelectUI.SelectContent>
                    </SelectUI.Select>
                  )}
                />
              </FormUI.FormField>

              <FormUI.FormField id="level" label="Level" error={errors.level?.message} tone="inverse">
                <Controller
                  control={control}
                  name="level"
                  render={({ field }) => (
                    <SelectUI.Select value={field.value} onValueChange={field.onChange}>
                      <SelectUI.SelectTrigger appearance="admin">
                        <SelectUI.SelectValue placeholder="Select level" />
                      </SelectUI.SelectTrigger>
                      <SelectUI.SelectContent appearance="admin">
                        {levelOptions.map((option) => (
                          <SelectUI.SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectUI.SelectItem>
                        ))}
                      </SelectUI.SelectContent>
                    </SelectUI.Select>
                  )}
                />
              </FormUI.FormField>

              <FormUI.FormField id="status" label="Status" error={errors.status?.message} tone="inverse">
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <SelectUI.Select value={field.value} onValueChange={field.onChange}>
                      <SelectUI.SelectTrigger appearance="admin">
                        <SelectUI.SelectValue placeholder="Select status" />
                      </SelectUI.SelectTrigger>
                      <SelectUI.SelectContent appearance="admin">
                        {statusOptions.map((option) => (
                          <SelectUI.SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectUI.SelectItem>
                        ))}
                      </SelectUI.SelectContent>
                    </SelectUI.Select>
                  )}
                />
              </FormUI.FormField>
            </LayoutUI.Container>

            <FormUI.FormField id="is_featured" label="Placement" tone="inverse">
              <LayoutUI.Row surface="panel" padding="md" radius="xl" className="gap-3">
                <Controller
                  control={control}
                  name="is_featured"
                  render={({ field }) => <Checkbox checked={Boolean(field.value)} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />}
                />
                <LayoutUI.Column className="flex-1" gap="gap-1">
                  <Text variant="inverse" className="font-medium">
                    Featured course
                  </Text>
                  <Text variant="muted-inverse" size="xs">
                    {isFeatured ? 'This course will be highlighted in the catalog.' : 'Keep this course as a regular catalog entry.'}
                  </Text>
                </LayoutUI.Column>
              </LayoutUI.Row>
            </FormUI.FormField>
          </CardUI.CardContent>
        </CardUI.Card>

        <CardUI.Card tone="inverse" border={false}>
          <CardUI.CardContent>
            <FormUI.FormFooter align="end" gap="md" flush>
              <Button type="button" onClick={() => navigate('/admin/learning')} variant="destructive" size="form">
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} variant="accent" size="form">
                <Icons.Save size={18} />
                {isPending ? 'Creating...' : 'Create and continue'}
              </Button>
            </FormUI.FormFooter>
          </CardUI.CardContent>
        </CardUI.Card>
      </FormUI.FormRoot>
    </LayoutUI.Column>
  );
}
