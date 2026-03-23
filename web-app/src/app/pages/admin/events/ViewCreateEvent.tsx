import { z } from 'zod';
import * as Icons from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import * as CardUI from '@components/ui/card';
import * as FormUI from '@components/ui/form';
import * as LayoutUI from '@components/ui/layout';
import { Button } from '@components/ui/button';
import { DateRangePicker } from '@components/ui/date-range-picker';
import { Input } from '@components/ui/input';
import * as SelectUI from '@components/ui/select';
import { Text } from '@components/ui/text';
import { Textarea } from '@components/ui/textarea';
import { useCreateEvent, useUploadEventImage } from '@feature/event/hooks';
import { eventSchema, type CreateEventRequest, type EventFormData } from '@feature/event/types';
import { EventImageField } from './EventImageField';

type EventFormInput = z.input<typeof eventSchema>;
const programOptions = [
  { value: 'general', label: 'General' },
  { value: 'networking', label: 'Networking' },
  { value: 'devsecops', label: 'DevSecOps' },
  { value: 'programming', label: 'Programming' },
] as const;
const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'open', label: 'Open' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'closed', label: 'Closed' },
] as const;

export function AdminEventCreate() {
  const navigate = useNavigate();
  const { mutate: createEvent, isPending } = useCreateEvent();
  const uploadImage = useUploadEventImage();
  const form = useForm<EventFormInput, unknown, EventFormData>({
    resolver: zodResolver(eventSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      slug: '',
      title: '',
      summary: '',
      description: '',
      image_url: '',
      status: 'draft',
      starts_at: '',
      ends_at: '',
      venue: '',
    },
  });
  const { control, register, handleSubmit, setValue, watch, formState: { errors } } = form;

  const handleValidSubmit: SubmitHandler<EventFormData> = (data) => {
    const payload: CreateEventRequest = {
      slug: data.slug || undefined,
      title: data.title,
      summary: data.summary || undefined,
      description: data.description || undefined,
      file_path: data.image_url || undefined,
      program: data.program || undefined,
      status: data.status,
      starts_at: new Date(data.starts_at).toISOString(),
      ends_at: data.ends_at ? new Date(data.ends_at).toISOString() : undefined,
      venue: data.venue || undefined,
    };

    createEvent(payload, {
      onSuccess: (response) => {
        navigate(`/admin/events/${response.data.id}`);
      },
    });
  };

  return (
    <LayoutUI.Column gap="gap-6">
      <LayoutUI.Row justify="justify-between" align="items-start" className="gap-4 max-md:flex-col">
        <LayoutUI.Row gap="gap-4">
          <Button type="button" onClick={() => navigate('/admin/events')} variant="ghost-inverse" size="icon" className="rounded-xl border border-black/10 bg-black/5">
            <Icons.ArrowLeft size={20} />
          </Button>
          <LayoutUI.Column gap="gap-2">
            <Text as="h1" variant="inverse" className="font-['Sora'] text-3xl font-bold">
              Create Event
            </Text>
            <Text variant="muted-inverse">Manage event details, schedule, and publication state.</Text>
          </LayoutUI.Column>
        </LayoutUI.Row>
      </LayoutUI.Row>

      <FormUI.FormRoot onSubmit={handleSubmit(handleValidSubmit)}>
        <CardUI.Card tone="inverse">
          <CardUI.CardContent padding="auth" spacing="lg">
            <LayoutUI.Row className="border-b border-black/10 pb-4" gap="gap-3">
              <Text variant="inverse" className="font-['Sora'] text-lg font-semibold">
                Event Information
              </Text>
            </LayoutUI.Row>

            <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormUI.FormField id="title" label="Title" error={errors.title?.message} tone="inverse">
                <Input id="title" {...register('title')} hasError={Boolean(errors.title)} tone="inverse" />
              </FormUI.FormField>
              <FormUI.FormField id="slug" label="Slug" error={errors.slug?.message} tone="inverse">
                <Input id="slug" {...register('slug')} tone="inverse" />
              </FormUI.FormField>
            </LayoutUI.Container>

            <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormUI.FormField id="program" label="Program" tone="inverse">
                <Controller
                  control={control}
                  name="program"
                  render={({ field }) => (
                    <SelectUI.Select value={field.value || 'general'} onValueChange={(value) => field.onChange(value === 'general' ? '' : value)}>
                      <SelectUI.SelectTrigger appearance="admin">
                        <SelectUI.SelectValue placeholder="Select program" />
                      </SelectUI.SelectTrigger>
                      <SelectUI.SelectContent appearance="admin">
                        {programOptions.map((option) => (
                          <SelectUI.SelectItem key={option.value} value={option.value}>{option.label}</SelectUI.SelectItem>
                        ))}
                      </SelectUI.SelectContent>
                    </SelectUI.Select>
                  )}
                />
              </FormUI.FormField>
              <FormUI.FormField id="status" label="Status" tone="inverse">
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
                          <SelectUI.SelectItem key={option.value} value={option.value}>{option.label}</SelectUI.SelectItem>
                        ))}
                      </SelectUI.SelectContent>
                    </SelectUI.Select>
                  )}
                />
              </FormUI.FormField>
            </LayoutUI.Container>

            <FormUI.FormField id="starts_at" label="Event Dates" error={errors.starts_at?.message || errors.ends_at?.message} tone="inverse">
              <Controller
                control={control}
                name="starts_at"
                render={({ field }) => (
                  <DateRangePicker
                    startValue={field.value}
                    endValue={form.watch('ends_at')}
                    onChange={({ startsAt, endsAt }) => {
                      field.onChange(startsAt);
                      form.setValue('ends_at', endsAt, { shouldDirty: true, shouldValidate: true });
                    }}
                    hasError={Boolean(errors.starts_at) || Boolean(errors.ends_at)}
                    placeholder="Pick start and end date"
                  />
                )}
              />
            </FormUI.FormField>

            <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormUI.FormField id="venue" label="Venue" error={errors.venue?.message} tone="inverse">
                <Input id="venue" {...register('venue')} tone="inverse" />
              </FormUI.FormField>
              <EventImageField
                value={watch('image_url') || ''}
                error={errors.image_url?.message}
                isUploading={uploadImage.isPending}
                onFileSelect={async (file) => {
                  const response = await uploadImage.mutateAsync(file);
                  setValue('image_url', response.data.file_path, { shouldDirty: true, shouldValidate: true });
                }}
              />
            </LayoutUI.Container>

            <FormUI.FormField id="summary" label="Summary" error={errors.summary?.message} tone="inverse">
              <Textarea id="summary" {...register('summary')} rows={2} />
            </FormUI.FormField>

            <FormUI.FormField id="description" label="Description" error={errors.description?.message} tone="inverse">
              <Textarea id="description" {...register('description')} rows={4} />
            </FormUI.FormField>
          </CardUI.CardContent>
        </CardUI.Card>

        <CardUI.Card tone="inverse" border={false}>
          <CardUI.CardContent>
            <FormUI.FormFooter align="end" gap="md" flush>
              <Button type="button" onClick={() => navigate('/admin/events')} variant="destructive" size="form">
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} variant="accent" size="form">
                <Icons.Save size={18} />
                {isPending ? 'Saving...' : 'Create Event'}
              </Button>
            </FormUI.FormFooter>
          </CardUI.CardContent>
        </CardUI.Card>
      </FormUI.FormRoot>
    </LayoutUI.Column>
  );
}
