import { z } from 'zod';
import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import * as Icons from 'lucide-react';
import * as CardUI from '@components/ui/card';
import * as DialogUI from '@components/ui/dialog';
import * as FormUI from '@components/ui/form';
import * as LayoutUI from '@components/ui/layout';
import { Button } from '@components/ui/button';
import { DateRangePicker } from '@components/ui/date-range-picker';
import { Input } from '@components/ui/input';
import * as SelectUI from '@components/ui/select';
import { Textarea } from '@components/ui/textarea';
import { useCreateEvent, useUpdateEvent } from '@feature/event/hooks';
import {
  eventSchema,
  type CreateEventRequest,
  type Event,
  type EventFormData,
  type UpdateEventRequest,
} from '@feature/event/types';

interface EventFormModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

type EventFormInput = z.input<typeof eventSchema>;
const eventProgramOptions = [
  { value: 'general', label: 'General' },
  { value: 'networking', label: 'Networking' },
  { value: 'devsecops', label: 'DevSecOps' },
  { value: 'programming', label: 'Programming' },
] as const;
const eventStatusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'open', label: 'Open' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'closed', label: 'Closed' },
] as const;

function toDatetimeLocal(value?: string | null) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function EventFormModal({ event, isOpen, onClose }: EventFormModalProps) {
  const isEdit = Boolean(event);
  const { mutate: createEvent, isPending: creating } = useCreateEvent();
  const { mutate: updateEvent, isPending: updating } = useUpdateEvent(event?.id ?? '');
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
  const { control, register, handleSubmit, reset, watch, setValue, formState: { errors } } = form;
  const isPending = creating || updating;

  const handleValidSubmit: SubmitHandler<EventFormData> = (data) => {
    const payload: CreateEventRequest = {
      slug: data.slug || undefined,
      title: data.title,
      summary: data.summary || undefined,
      description: data.description || undefined,
      image_url: data.image_url || undefined,
      program: data.program || undefined,
      status: data.status,
      starts_at: new Date(data.starts_at).toISOString(),
      ends_at: data.ends_at ? new Date(data.ends_at).toISOString() : undefined,
      venue: data.venue || undefined,
    };

    if (isEdit && event) {
      const updatePayload: UpdateEventRequest = {
        slug: payload.slug,
        title: payload.title,
        summary: payload.summary,
        description: payload.description,
        image_url: payload.image_url,
        program: payload.program,
        status: payload.status,
        starts_at: payload.starts_at,
        ends_at: payload.ends_at,
        venue: payload.venue,
      };

      updateEvent(updatePayload, { onSuccess: onClose });
      return;
    }

    createEvent(payload, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  useEffect(() => {
    if (!event) {
      reset({
        slug: '',
        title: '',
        summary: '',
        description: '',
        image_url: '',
        program: undefined,
        status: 'draft',
        starts_at: '',
        ends_at: '',
        venue: '',
      });
      return;
    }

    reset({
      slug: event.slug ?? '',
      title: event.title,
      summary: event.summary ?? '',
      description: event.description ?? '',
      image_url: event.image_url ?? '',
      program: event.program || undefined,
      status: event.status,
      starts_at: toDatetimeLocal(event.starts_at),
      ends_at: toDatetimeLocal(event.ends_at),
      venue: event.venue ?? '',
    });
  }, [event, reset]);

  return (
    <DialogUI.Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogUI.DialogContent
        className="max-w-3xl overflow-y-auto border-black/10 bg-[#F7F4EC] p-0 text-[#04090C]"
        style={{ maxHeight: '90vh' }}
      >
        <CardUI.Card tone="inverse" className="gap-0 border-0 bg-transparent">
          <CardUI.CardHeader className="pb-6">
            <LayoutUI.Row justify="between" align="start" gap="gap-4">
              <LayoutUI.Row align="center" gap="gap-3">
                <LayoutUI.Container surface="accent" radius="xl" className="flex h-11 w-11 items-center justify-center">
                  <Icons.CalendarRange className="size-5 text-[#04090C]" />
                </LayoutUI.Container>
                <LayoutUI.Column gap="gap-1">
                  <DialogUI.DialogTitle className="font-['Sora'] text-xl font-bold text-[#04090C]">
                    {isEdit ? 'Edit Event' : 'Create Event'}
                  </DialogUI.DialogTitle>
                  <DialogUI.DialogDescription className="text-sm text-black/60">
                    Manage event details, schedule, and publication state.
                  </DialogUI.DialogDescription>
                </LayoutUI.Column>
              </LayoutUI.Row>
            </LayoutUI.Row>
          </CardUI.CardHeader>

          <CardUI.CardContent spacing="lg" className="pb-6">
            <FormUI.FormRoot
              onSubmit={handleSubmit(handleValidSubmit)}
            >
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
                  <Controller control={control} name="program" render={({ field }) => (
                    <SelectUI.Select value={field.value || 'general'} onValueChange={(value) => field.onChange(value === 'general' ? '' : value)}>
                      <SelectUI.SelectTrigger appearance="admin"><SelectUI.SelectValue placeholder="Select program" /></SelectUI.SelectTrigger>
                      <SelectUI.SelectContent appearance="admin">
                        {eventProgramOptions.map((option) => <SelectUI.SelectItem key={option.value} value={option.value}>{option.label}</SelectUI.SelectItem>)}
                      </SelectUI.SelectContent>
                    </SelectUI.Select>
                  )} />
                </FormUI.FormField>
                <FormUI.FormField id="status" label="Status" tone="inverse">
                  <Controller control={control} name="status" render={({ field }) => (
                    <SelectUI.Select value={field.value} onValueChange={field.onChange}>
                      <SelectUI.SelectTrigger appearance="admin"><SelectUI.SelectValue placeholder="Select status" /></SelectUI.SelectTrigger>
                      <SelectUI.SelectContent appearance="admin">
                        {eventStatusOptions.map((option) => <SelectUI.SelectItem key={option.value} value={option.value}>{option.label}</SelectUI.SelectItem>)}
                      </SelectUI.SelectContent>
                    </SelectUI.Select>
                  )} />
                </FormUI.FormField>
              </LayoutUI.Container>

              <FormUI.FormField id="starts_at" label="Event Dates" error={errors.starts_at?.message || errors.ends_at?.message} tone="inverse">
                <Controller
                  control={control}
                  name="starts_at"
                  render={({ field }) => (
                    <DateRangePicker
                      startValue={field.value}
                      endValue={watch('ends_at')}
                      onChange={({ startsAt, endsAt }) => {
                        field.onChange(startsAt);
                        setValue('ends_at', endsAt, { shouldDirty: true, shouldValidate: true });
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
                <FormUI.FormField id="image_url" label="Image URL" error={errors.image_url?.message} tone="inverse">
                  <Input id="image_url" {...register('image_url')} hasError={Boolean(errors.image_url)} tone="inverse" />
                </FormUI.FormField>
              </LayoutUI.Container>

              <FormUI.FormField id="summary" label="Summary" error={errors.summary?.message} tone="inverse">
                <Textarea id="summary" {...register('summary')} rows={2} />
              </FormUI.FormField>

              <FormUI.FormField id="description" label="Description" error={errors.description?.message} tone="inverse">
                <Textarea id="description" {...register('description')} rows={4} />
              </FormUI.FormField>

              <FormUI.FormFooter align="end" gap="md" flush className="border-t border-black/10">
                <Button type="button" onClick={onClose} variant="destructive" size="form">
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending} variant="accent" size="form">
                  <Icons.Save size={18} />
                  {isPending ? 'Saving...' : isEdit ? 'Update Event' : 'Create Event'}
                </Button>
              </FormUI.FormFooter>
            </FormUI.FormRoot>
          </CardUI.CardContent>
        </CardUI.Card>
      </DialogUI.DialogContent>
    </DialogUI.Dialog>
  );
}
