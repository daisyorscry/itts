import { z } from 'zod';
import { useEffect } from 'react';
import * as Icons from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { Switch } from '@components/ui/switch';
import { Button } from '@components/ui/button';
import * as CardUI from '@components/ui/card';
import * as FormUI from '@components/ui/form';
import { Input } from '@components/ui/input';
import * as LayoutUI from '@components/ui/layout';
import * as SelectUI from '@components/ui/select';
import { Text } from '@components/ui/text';
import { Textarea } from '@components/ui/textarea';
import { useAdminCourse, useUpdateCourse } from '@feature/learning/hooks';
import { courseFormSchema, type CourseFormData, type ProgramType, type UpdateCourseRequest } from '@feature/learning/types';
import { useCourseBuilderContext } from './course-builder.context';
import { levelOptions, programOptions, statusOptions } from './course-builder.shared';

type CourseFormInput = z.input<typeof courseFormSchema>;

export function CourseSetupPanel() {
  const { courseId } = useCourseBuilderContext();
  const { data: course } = useAdminCourse(courseId, Boolean(courseId));
  const { mutate: updateCourse, isPending: isUpdatingCourse } = useUpdateCourse();
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
    reset,
    watch,
    handleSubmit,
    formState: { errors },
  } = form;

  useEffect(() => {
    if (!course) {
      return;
    }

    reset({
      slug: course.slug,
      title: course.title,
      subtitle: course.subtitle ?? '',
      description: course.description ?? '',
      thumbnail_url: course.thumbnail_url ?? '',
      program: course.program as ProgramType | undefined,
      level: course.level,
      status: course.status,
      estimated_minutes: course.estimated_minutes,
      is_featured: course.is_featured,
    });
  }, [course, reset]);

  const featureFlagText = watch('is_featured') ? 'Featured in catalog' : 'Standard catalog placement';

  const handleCourseSubmit: SubmitHandler<CourseFormData> = (data) => {
    const payload: UpdateCourseRequest = {
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

    updateCourse({ id: courseId, payload });
  };

  return (
    <CardUI.Card tone="inverse" border={false}>
      <CardUI.CardContent padding="auth" spacing="lg">
        <LayoutUI.Row justify="justify-between" align="items-start" className="gap-4 max-md:flex-col">
          <LayoutUI.Column gap="gap-2">
            <Text variant="inverse" className="font-['Sora'] text-xl font-semibold">
              Course setup
            </Text>
            <Text variant="muted-inverse">
              Keep the course identity and catalog settings here. Curriculum editing stays below in its own builder.
            </Text>
          </LayoutUI.Column>
          <Button variant="ghost-inverse" size="sm" type="button" className="pointer-events-none">
            <Icons.Sparkles size={16} />
            {featureFlagText}
          </Button>
        </LayoutUI.Row>

        <FormUI.FormRoot onSubmit={handleSubmit(handleCourseSubmit)} gap="lg">
          <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormUI.FormField id="title" label="Course title" error={errors.title?.message} tone="inverse">
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
            <Textarea id="description" {...register('description')} rows={4} />
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
                  <SelectUI.Select
                    value={field.value ?? '__empty__'}
                    onValueChange={(value) => field.onChange(value === '__empty__' ? undefined : value)}
                  >
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

          <LayoutUI.Row surface="panel" padding="md" radius="xl" className="gap-3">
            <Controller
              control={control}
              name="is_featured"
              render={({ field }) => <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} />}
            />
            <LayoutUI.Column className="flex-1" gap="gap-1">
              <Text variant="inverse" className="font-medium">
                Featured course
              </Text>
              <Text variant="muted-inverse" size="xs">
                Highlight this course in the public catalog.
              </Text>
            </LayoutUI.Column>
          </LayoutUI.Row>

          <FormUI.FormFooter align="end" gap="md" flush>
            <Button type="submit" variant="accent" size="form" disabled={isUpdatingCourse}>
              <Icons.Save size={18} />
              {isUpdatingCourse ? 'Saving...' : 'Save course setup'}
            </Button>
          </FormUI.FormFooter>
        </FormUI.FormRoot>
      </CardUI.CardContent>
    </CardUI.Card>
  );
}
