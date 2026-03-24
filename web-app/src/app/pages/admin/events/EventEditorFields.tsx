import { z } from 'zod';
import { Controller, type UseFormReturn } from 'react-hook-form';
import * as Icons from 'lucide-react';
import * as FormUI from '@components/ui/form';
import * as LayoutUI from '@components/ui/layout';
import * as SelectUI from '@components/ui/select';
import { Switch } from '@components/ui/switch';
import { Text } from '@components/ui/text';
import { DateRangePicker } from '@components/ui/date-range-picker';
import { Input } from '@components/ui/input';
import { Textarea } from '@components/ui/textarea';
import { eventSchema, type EventFormData } from '@feature/event/types';
import { EventImageField } from './EventImageField';

type EventFormInput = z.input<typeof eventSchema>;

const programOptions = [
  { value: 'general', label: 'General audience' },
  { value: 'networking', label: 'Networking' },
  { value: 'devsecops', label: 'DevSecOps' },
  { value: 'programming', label: 'Programming' },
] as const;

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'open', label: 'Open registration' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'closed', label: 'Closed' },
] as const;

const currencyOptions = [
  { value: 'IDR', label: 'IDR' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
] as const;

interface EventEditorFieldsProps {
  form: UseFormReturn<EventFormInput, unknown, EventFormData>;
  disabled?: boolean;
  isUploading: boolean;
  onFileSelect: (file: File) => Promise<void>;
  showPreview?: boolean;
}

function formatEventPrice(isPaid?: boolean, price?: number, currency?: string) {
  if (!isPaid) {
    return 'Free event';
  }

  const normalizedPrice = Number(price ?? 0);
  if (!normalizedPrice) {
    return `Paid event${currency ? ` • ${currency}` : ''}`;
  }

  return `${currency || 'IDR'} ${normalizedPrice.toLocaleString('id-ID')}`;
}

export function EventEditorFields({
  form,
  disabled = false,
  isUploading,
  onFileSelect,
  showPreview = true,
}: EventEditorFieldsProps) {
  const {
    control,
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const benefits = watch('benefits') ?? [];
  const isPaid = Boolean(watch('is_paid'));
  const capacity = Number(watch('capacity') ?? 0);
  const remainingLabel = capacity > 0 ? `${capacity} attendee slots` : 'Unlimited capacity';

  return (
    <>
      <LayoutUI.Row className="border-b border-black/10 pb-4" gap="gap-3">
        <Text variant="inverse" className="font-['Sora'] text-lg font-semibold">
          Event Overview
        </Text>
      </LayoutUI.Row>

      <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormUI.FormField id="title" label="Event title" error={errors.title?.message} tone="inverse">
          <Input
            id="title"
            {...register('title')}
            disabled={disabled}
            hasError={Boolean(errors.title)}
            tone="inverse"
            placeholder="ITTS Networking Night 2026"
            className={disabled ? 'cursor-default opacity-80' : undefined}
          />
        </FormUI.FormField>
        <FormUI.FormField id="slug" label="Public slug" error={errors.slug?.message} tone="inverse">
          <Input
            id="slug"
            {...register('slug')}
            disabled={disabled}
            tone="inverse"
            placeholder="itts-networking-night-2026"
            className={disabled ? 'cursor-default opacity-80' : undefined}
          />
        </FormUI.FormField>
      </LayoutUI.Container>

      <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormUI.FormField id="program" label="Program track" tone="inverse">
          <Controller
            control={control}
            name="program"
            render={({ field }) => (
              <SelectUI.Select
                value={field.value || 'general'}
                onValueChange={(value) => field.onChange(value === 'general' ? '' : value)}
                disabled={disabled}
              >
                <SelectUI.SelectTrigger appearance="admin">
                  <SelectUI.SelectValue placeholder="Select event track" />
                </SelectUI.SelectTrigger>
                <SelectUI.SelectContent appearance="admin">
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
        <FormUI.FormField id="status" label="Lifecycle status" tone="inverse">
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <SelectUI.Select value={field.value} onValueChange={field.onChange} disabled={disabled}>
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

      <FormUI.FormField id="starts_at" label="Event schedule" error={errors.starts_at?.message || errors.ends_at?.message} tone="inverse">
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
              disabled={disabled}
              hasError={Boolean(errors.starts_at) || Boolean(errors.ends_at)}
              placeholder="Pick start and end date"
            />
          )}
        />
      </FormUI.FormField>

      <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormUI.FormField id="registration_deadline" label="Registration deadline" error={errors.registration_deadline?.message} tone="inverse">
          <Input
            id="registration_deadline"
            type="datetime-local"
            {...register('registration_deadline')}
            disabled={disabled}
            hasError={Boolean(errors.registration_deadline)}
            tone="inverse"
            className={disabled ? 'cursor-default opacity-80' : undefined}
          />
        </FormUI.FormField>
        <FormUI.FormField id="venue" label="Venue or platform" error={errors.venue?.message} tone="inverse">
          <Input
            id="venue"
            {...register('venue')}
            disabled={disabled}
            tone="inverse"
            placeholder="ITS Tower Hall or Zoom"
            className={disabled ? 'cursor-default opacity-80' : undefined}
          />
        </FormUI.FormField>
      </LayoutUI.Container>

      <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormUI.FormField id="capacity" label="Seat capacity" error={errors.capacity?.message} tone="inverse">
          <Input
            id="capacity"
            type="number"
            min={0}
            {...register('capacity', { valueAsNumber: true })}
            disabled={disabled}
            hasError={Boolean(errors.capacity)}
            tone="inverse"
            placeholder="0 for unlimited"
            className={disabled ? 'cursor-default opacity-80' : undefined}
          />
        </FormUI.FormField>
        <EventImageField
          value={watch('image_url') || ''}
          error={errors.image_url?.message}
          disabled={disabled}
          isUploading={isUploading}
          onFileSelect={onFileSelect}
        />
      </LayoutUI.Container>

      <FormUI.FormField id="benefits" label="Benefits for attendees" error={errors.benefits?.message as string | undefined} tone="inverse">
        <Controller
          control={control}
          name="benefits"
          render={({ field }) => (
            <Textarea
              id="benefits"
              rows={4}
              value={(field.value ?? []).join('\n')}
              onChange={(event) => {
                const values = event.target.value
                  .split('\n')
                  .map((item) => item.trim())
                  .filter(Boolean);
                field.onChange(values);
              }}
              disabled={disabled}
              placeholder={'One benefit per line\nCertificate of attendance\nNetworking session\nHands-on workshop materials'}
              className={disabled ? 'cursor-default opacity-80' : undefined}
            />
          )}
        />
      </FormUI.FormField>

      <LayoutUI.Container className="rounded-[1rem] border border-black/10 bg-black/[0.03] p-4">
        <LayoutUI.Row justify="justify-between" align="items-start" className="gap-4 max-sm:flex-col">
          <LayoutUI.Column gap="gap-1">
            <Text variant="inverse" className="font-['Sora'] text-base font-semibold">
              Ticketing setup
            </Text>
            <Text variant="muted-inverse" size="sm">
              Turn this on when the event requires payment before a seat is confirmed.
            </Text>
          </LayoutUI.Column>
          <Controller
            control={control}
            name="is_paid"
            render={({ field }) => (
              <div className="flex items-center gap-3">
                <Text variant="inverse" size="sm" className="font-medium">
                  {field.value ? 'Paid event' : 'Free event'}
                </Text>
                <Switch
                  checked={Boolean(field.value)}
                  onCheckedChange={(checked) => {
                    field.onChange(Boolean(checked));
                    if (!checked) {
                      setValue('price', 0, { shouldDirty: true, shouldValidate: true });
                      setValue('currency', 'IDR', { shouldDirty: true, shouldValidate: true });
                    }
                  }}
                  disabled={disabled}
                />
              </div>
            )}
          />
        </LayoutUI.Row>
      </LayoutUI.Container>

      <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormUI.FormField id="price" label="Ticket price" error={errors.price?.message} tone="inverse">
          <Input
            id="price"
            type="number"
            min={0}
            {...register('price', { valueAsNumber: true })}
            disabled={disabled || !isPaid}
            hasError={Boolean(errors.price)}
            tone="inverse"
            placeholder={isPaid ? '150000' : 'Free event'}
            className={disabled || !isPaid ? 'cursor-default opacity-80' : undefined}
          />
        </FormUI.FormField>
        <FormUI.FormField id="currency" label="Currency" error={errors.currency?.message} tone="inverse">
          <Controller
            control={control}
            name="currency"
            render={({ field }) => (
              <SelectUI.Select
                value={field.value || 'IDR'}
                onValueChange={field.onChange}
                disabled={disabled || !isPaid}
              >
                <SelectUI.SelectTrigger appearance="admin">
                  <SelectUI.SelectValue placeholder="Select currency" />
                </SelectUI.SelectTrigger>
                <SelectUI.SelectContent appearance="admin">
                  {currencyOptions.map((option) => (
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

      <FormUI.FormField id="summary" label="Short summary" error={errors.summary?.message} tone="inverse">
        <Textarea
          id="summary"
          {...register('summary')}
          rows={2}
          placeholder="Short copy for cards, previews, and event feed."
          className={disabled ? 'cursor-default opacity-80' : undefined}
        />
      </FormUI.FormField>

      <FormUI.FormField id="description" label="Full event description" error={errors.description?.message} tone="inverse">
        <Textarea
          id="description"
          {...register('description')}
          rows={5}
          placeholder="Describe the format, speakers, expected outcome, and attendee experience."
          className={disabled ? 'cursor-default opacity-80' : undefined}
        />
      </FormUI.FormField>

      {showPreview ? (
        <LayoutUI.Container className="rounded-[1rem] border border-black/10 bg-black/[0.03] p-5">
          <LayoutUI.Row align="items-start" gap="gap-3" className="mb-4">
            <LayoutUI.Container className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/70">
              <Icons.Ticket className="size-5 text-[#04090C]" />
            </LayoutUI.Container>
            <LayoutUI.Column gap="gap-1">
              <Text variant="inverse" className="font-['Sora'] text-base font-semibold">
                Registration preview
              </Text>
              <Text variant="muted-inverse" size="sm">
                Quick check for slot and payment settings before publishing.
              </Text>
            </LayoutUI.Column>
          </LayoutUI.Row>

          <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <PreviewItem label="Seat setup" value={remainingLabel} />
            <PreviewItem
              label="Payment"
              value={formatEventPrice(isPaid, Number(watch('price') ?? 0), watch('currency') || 'IDR')}
            />
            <PreviewItem
              label="Registration closes"
              value={watch('registration_deadline') || 'No separate deadline yet'}
            />
          </LayoutUI.Container>

          <LayoutUI.Container className="mt-4 rounded-xl border border-black/10 bg-[#F7F4EC] p-4">
            <Text variant="inverse" size="sm" className="font-medium">
              Included benefits
            </Text>
            {benefits.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {benefits.map((benefit, index) => (
                  <span key={`${benefit}-${index}`} className="rounded-full border border-black/10 bg-black/[0.04] px-3 py-1 text-xs text-[#04090C]/75">
                    {benefit}
                  </span>
                ))}
              </div>
            ) : (
              <Text variant="muted-inverse" size="sm" className="mt-2">
                Add attendee benefits to make the event value clearer on the public page.
              </Text>
            )}
          </LayoutUI.Container>
        </LayoutUI.Container>
      ) : null}
    </>
  );
}

function PreviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-black/10 bg-[#F7F4EC] p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-black/45">{label}</p>
      <p className="mt-2 text-sm font-medium leading-6 text-[#04090C]">{value}</p>
    </div>
  );
}
