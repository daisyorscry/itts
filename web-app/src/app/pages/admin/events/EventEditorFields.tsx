import { z } from 'zod';
import { useEffect, useState, type DragEvent, type KeyboardEvent, type ReactNode } from 'react';
import { Controller, type UseFormReturn } from 'react-hook-form';
import * as Icons from 'lucide-react';
import { Badge } from '@components/ui/badge';
import * as CardUI from '@components/ui/card';
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
import { EventImageCropDialog } from './EventImageCropDialog';

type EventFormInput = z.input<typeof eventSchema>;

const programOptions = [
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
  uploadingField?: 'square_image_url' | 'landscape_image_url' | null;
  uploadedImageUrls?: Partial<Record<'square_image_url' | 'landscape_image_url', string>>;
  onFileSelect: (field: 'square_image_url' | 'landscape_image_url', file: File) => Promise<void>;
}

type CropTargetField = 'square_image_url' | 'landscape_image_url';

interface PendingCropState {
  field: CropTargetField;
  file: File;
  previewUrl: string;
}

export function EventEditorFields({
  form,
  disabled = false,
  uploadingField = null,
  uploadedImageUrls,
  onFileSelect,
}: EventEditorFieldsProps) {
  const {
    control,
    register,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const visibleErrors = disabled ? undefined : errors;

  const isPaid = Boolean(watch('is_paid'));
  const [pendingCrop, setPendingCrop] = useState<PendingCropState | null>(null);
  const selectedProgram = programOptions.find((option) => option.value === watch('program'))?.label ?? 'Not set';
  const selectedStatus = statusOptions.find((option) => option.value === watch('status'))?.label ?? 'Not set';

  useEffect(() => {
    return () => {
      if (pendingCrop?.previewUrl) {
        URL.revokeObjectURL(pendingCrop.previewUrl);
      }
    };
  }, [pendingCrop]);

  const openCropper = (field: CropTargetField, file: File) => {
    setPendingCrop((current) => {
      if (current?.previewUrl) {
        URL.revokeObjectURL(current.previewUrl);
      }
      return {
        field,
        file,
        previewUrl: URL.createObjectURL(file),
      };
    });
  };

  const closeCropper = () => {
    setPendingCrop((current) => {
      if (current?.previewUrl) {
        URL.revokeObjectURL(current.previewUrl);
      }
      return null;
    });
  };

  return (
    <>
      <EditorSection
        title="Event basics"
        description="Prepare both event visuals first, then complete the public identity fields that people will see across the site."
      >
        <LayoutUI.Column gap="gap-5">
          <LayoutUI.Container className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
            <CardUI.Card tone="inverse" border={false}>
              <CardUI.CardContent>
                <LayoutUI.Column gap="gap-4">
                  <FormUI.FormField id="title" label="Event title" error={visibleErrors?.title?.message} required tone="inverse">
                    <Input
                      id="title"
                      {...register('title')}
                      disabled={disabled}
                      hasError={Boolean(visibleErrors?.title)}
                      tone="inverse"
                      placeholder="ITTS Networking Night 2026"
                      className={disabled ? 'cursor-default opacity-80' : undefined}
                    />
                  </FormUI.FormField>

                  <FormUI.FormField id="slug" label="Public slug" error={visibleErrors?.slug?.message} required tone="inverse">
                    <Input
                      id="slug"
                      {...register('slug')}
                      disabled={disabled}
                      tone="inverse"
                      placeholder="itts-networking-night-2026"
                      className={disabled ? 'cursor-default opacity-80' : undefined}
                    />
                  </FormUI.FormField>
                </LayoutUI.Column>
              </CardUI.CardContent>
            </CardUI.Card>

            <CardUI.Card tone="inverse" border={false}>
              <CardUI.CardContent >
                <LayoutUI.Column gap="gap-4">
                  <FormUI.FormField id="program" label="Program track" error={visibleErrors?.program?.message} required tone="inverse">
                    {disabled ? (
                      <Input id="program" value={selectedProgram} disabled tone="inverse" className="cursor-default opacity-80" />
                    ) : (
                      <Controller
                        control={control}
                        name="program"
                        render={({ field }) => (
                          <SelectUI.Select
                            value={typeof field.value === 'string' && field.value ? field.value : undefined}
                            onValueChange={field.onChange}
                            disabled={disabled}
                          >
                            <SelectUI.SelectTrigger id="program" appearance="admin">
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
                    )}
                  </FormUI.FormField>

                  <FormUI.FormField id="status" label="Lifecycle status" error={visibleErrors?.status?.message} required tone="inverse">
                    {disabled ? (
                      <Input id="status" value={selectedStatus} disabled tone="inverse" className="cursor-default opacity-80" />
                    ) : (
                      <Controller
                        control={control}
                        name="status"
                        render={({ field }) => (
                          <SelectUI.Select
                            value={typeof field.value === 'string' && field.value ? field.value : undefined}
                            onValueChange={field.onChange}
                            disabled={disabled}
                          >
                            <SelectUI.SelectTrigger id="status" appearance="admin">
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
                    )}
                  </FormUI.FormField>
                </LayoutUI.Column>
              </CardUI.CardContent>
            </CardUI.Card>

          </LayoutUI.Container>
          <CardUI.Card tone="inverse" border={false}>
            <CardUI.CardContent className="space-y-4 pt-5">
              <LayoutUI.Container className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] [&>*]:self-start">
                <EventImageField
                  id="square_image_url"
                  label="Square image"
                  required
                  description="Used on event cards, listings, and compact previews."
                  aspect="square"
                  value={watch('square_image_url') || ''}
                  previewUrl={uploadedImageUrls?.square_image_url}
                  error={visibleErrors?.square_image_url?.message}
                  disabled={disabled}
                  isUploading={uploadingField === 'square_image_url'}
                  onFileSelect={(file) => openCropper('square_image_url', file)}
                />
                <EventImageField
                  id="landscape_image_url"
                  label="Landscape image"
                  required
                  description="Used on the public event detail hero and other wide layouts."
                  aspect="landscape"
                  value={watch('landscape_image_url') || ''}
                  previewUrl={uploadedImageUrls?.landscape_image_url}
                  error={visibleErrors?.landscape_image_url?.message}
                  disabled={disabled}
                  isUploading={uploadingField === 'landscape_image_url'}
                  onFileSelect={(file) => openCropper('landscape_image_url', file)}
                />
              </LayoutUI.Container>
            </CardUI.CardContent>
          </CardUI.Card>
        </LayoutUI.Column>
      </EditorSection>

      <EditorSection
        title="Timing and access"
        description="Organize the live window, registration cutoff, venue, and seat limit in one place."
      >
        <FormUI.FormField id="starts_at" label="Event schedule" error={visibleErrors?.starts_at?.message || visibleErrors?.ends_at?.message} required tone="inverse">
          <Controller
            control={control}
            name="starts_at"
            render={({ field }) => (
              <DateRangePicker
                id="starts_at"
                startValue={field.value}
                endValue={watch('ends_at')}
                onChange={({ startsAt, endsAt }) => {
                  field.onChange(startsAt);
                  setValue('ends_at', endsAt, { shouldDirty: true, shouldValidate: true });
                }}
                disabled={disabled}
                hasError={Boolean(visibleErrors?.starts_at) || Boolean(visibleErrors?.ends_at)}
                placeholder="Pick start and end date"
              />
            )}
          />
        </FormUI.FormField>

        <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FormUI.FormField id="registration_deadline" label="Registration deadline" error={visibleErrors?.registration_deadline?.message} required tone="inverse">
            <Input
              id="registration_deadline"
              type="datetime-local"
              {...register('registration_deadline')}
              disabled={disabled}
              hasError={Boolean(visibleErrors?.registration_deadline)}
              tone="inverse"
              className={disabled ? 'cursor-default opacity-80' : undefined}
            />
          </FormUI.FormField>
          <FormUI.FormField id="venue" label="Venue or platform" error={visibleErrors?.venue?.message} required tone="inverse">
            <Input
              id="venue"
              {...register('venue')}
              disabled={disabled}
              tone="inverse"
              placeholder="ITS Tower Hall or Zoom"
              className={disabled ? 'cursor-default opacity-80' : undefined}
            />
          </FormUI.FormField>
          <FormUI.FormField id="capacity" label="Seat capacity" error={visibleErrors?.capacity?.message} required tone="inverse">
            <Input
              id="capacity"
              type="number"
              min={0}
              {...register('capacity', { valueAsNumber: true })}
              disabled={disabled}
              hasError={Boolean(visibleErrors?.capacity)}
              tone="inverse"
              placeholder="0 for unlimited"
              className={disabled ? 'cursor-default opacity-80' : undefined}
            />
          </FormUI.FormField>
        </LayoutUI.Container>
      </EditorSection>

      <EditorSection
        title="Payment setup"
        description="Decide whether registration is free or paid, then configure the ticket value and currency."
      >
        <CardUI.Card tone="inverse">
          <CardUI.CardContent className="pt-5">
            <LayoutUI.Row justify="justify-between" align="items-start" className="gap-4 max-sm:flex-col">
              <LayoutUI.Column gap="gap-1">
                <Text variant="inverse" className="font-['Sora'] text-base font-semibold">
                  Ticket mode
                </Text>
                <Text variant="muted-inverse" size="sm">
                  Use paid mode only when the attendee must complete payment before the seat is confirmed.
                </Text>
              </LayoutUI.Column>
              <Controller
                control={control}
                name="is_paid"
                render={({ field }) => (
                  <LayoutUI.Row align="items-center" gap="gap-3">
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
                  </LayoutUI.Row>
                )}
              />
            </LayoutUI.Row>
          </CardUI.CardContent>
        </CardUI.Card>

        <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormUI.FormField id="price" label="Ticket price" error={visibleErrors?.price?.message} required tone="inverse">
            <Input
              id="price"
              type="number"
              min={0}
              {...register('price', { valueAsNumber: true })}
              disabled={disabled || !isPaid}
              hasError={Boolean(visibleErrors?.price)}
              tone="inverse"
              placeholder={isPaid ? '150000' : 'Free event'}
              className={disabled || !isPaid ? 'cursor-default opacity-80' : undefined}
            />
          </FormUI.FormField>
          <FormUI.FormField id="currency" label="Currency" error={visibleErrors?.currency?.message} required tone="inverse">
            <Controller
              control={control}
              name="currency"
              render={({ field }) => (
                <SelectUI.Select
                  value={field.value || 'IDR'}
                  onValueChange={field.onChange}
                  disabled={disabled || !isPaid}
                >
                  <SelectUI.SelectTrigger id="currency" appearance="admin">
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
      </EditorSection>

      <EditorSection
        title="Public-facing copy"
        description="Write the supporting copy that shows up in cards, details, and registration touchpoints."
      >
        <FormUI.FormField id="summary" label="Short summary" error={visibleErrors?.summary?.message} required tone="inverse">
          <Textarea
            id="summary"
            {...register('summary')}
            rows={2}
            placeholder="Short copy for cards, previews, and event feed."
            className={disabled ? 'cursor-default opacity-80' : undefined}
          />
        </FormUI.FormField>

        <FormUI.FormField id="description" label="Full event description" error={visibleErrors?.description?.message} required tone="inverse">
          <Textarea
            id="description"
            {...register('description')}
            rows={6}
            placeholder="Describe the format, speakers, expected outcome, and attendee experience."
            className={disabled ? 'cursor-default opacity-80' : undefined}
          />
        </FormUI.FormField>

        <FormUI.FormField id="benefits" label="Benefits for attendees" error={visibleErrors?.benefits?.message as string | undefined} required tone="inverse">
          <Controller
            control={control}
            name="benefits"
            render={({ field }) => (
              <BenefitInput
                id="benefits"
                values={field.value ?? []}
                onChange={field.onChange}
                disabled={disabled}
              />
            )}
          />
        </FormUI.FormField>
      </EditorSection>

      {pendingCrop ? (
        <EventImageCropDialog
          open
          imageUrl={pendingCrop.previewUrl}
          fileName={pendingCrop.file.name}
          aspect={pendingCrop.field === 'landscape_image_url' ? 16 / 9 : 1}
          title={pendingCrop.field === 'landscape_image_url' ? 'Crop landscape image' : 'Crop square image'}
          description={
            pendingCrop.field === 'landscape_image_url'
              ? 'Prepare the wide hero image used on the public event detail page before upload.'
              : 'Prepare the square image used on public event cards before upload.'
          }
          onOpenChange={(open) => {
            if (!open) {
              closeCropper();
            }
          }}
          onConfirm={async (file) => {
            await onFileSelect(pendingCrop.field, file);
            closeCropper();
          }}
        />
      ) : null}
    </>
  );
}

function BenefitInput({
  id,
  values,
  onChange,
  disabled,
}: {
  id: string;
  values: string[];
  onChange: (values: string[]) => void;
  disabled?: boolean;
}) {
  const [draft, setDraft] = useState('');
  const [draggedValue, setDraggedValue] = useState<string | null>(null);

  const commitDraft = () => {
    const nextValue = draft.trim();
    if (!nextValue) {
      return;
    }

    if (values.some((value) => value.toLowerCase() === nextValue.toLowerCase())) {
      setDraft('');
      return;
    }

    onChange([...values, nextValue]);
    setDraft('');
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      commitDraft();
      return;
    }

    if (event.key === 'Backspace' && !draft && values.length) {
      event.preventDefault();
      onChange(values.slice(0, -1));
    }
  };

  const removeValue = (valueToRemove: string) => {
    onChange(values.filter((value) => value !== valueToRemove));
  };

  const moveValue = (activeValue: string, targetValue: string) => {
    if (activeValue === targetValue) {
      return;
    }

    const currentIndex = values.indexOf(activeValue);
    const targetIndex = values.indexOf(targetValue);

    if (currentIndex === -1 || targetIndex === -1) {
      return;
    }

    const nextValues = [...values];
    const [movedValue] = nextValues.splice(currentIndex, 1);
    nextValues.splice(targetIndex, 0, movedValue);
    onChange(nextValues);
  };

  const handleDragStart = (event: DragEvent<HTMLDivElement>, value: string) => {
    setDraggedValue(value);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', value);
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>, targetValue: string) => {
    event.preventDefault();
    const sourceValue = draggedValue || event.dataTransfer.getData('text/plain');
    if (!sourceValue) {
      return;
    }
    moveValue(sourceValue, targetValue);
    setDraggedValue(null);
  };

  const handleDragEnd = () => {
    setDraggedValue(null);
  };

  return (
    <div className="space-y-3">
      <Input
        id={id}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commitDraft}
        disabled={disabled}
        tone="inverse"
        placeholder="Type a benefit and press Enter"
        className={disabled ? 'cursor-default opacity-80' : undefined}
      />

      {values.length ? (
        <div className="flex flex-wrap gap-2">
          {values.map((value) => (
            <div
              key={value}
              draggable={!disabled}
              onDragStart={(event) => handleDragStart(event, value)}
              onDragOver={handleDragOver}
              onDrop={(event) => handleDrop(event, value)}
              onDragEnd={handleDragEnd}
              className={!disabled ? 'cursor-grab active:cursor-grabbing' : undefined}
            >
              <Badge
                variant="success"
                className={`gap-2 px-3 py-1 text-xs ${draggedValue === value ? 'opacity-60' : ''}`}
              >
                {!disabled ? <Icons.GripVertical className="size-3 text-current/60" /> : null}
                <span>{value}</span>
                {!disabled ? (
                  <button
                    type="button"
                    onClick={() => removeValue(value)}
                    className="inline-flex items-center justify-center rounded-full text-current/70 transition hover:text-current"
                    aria-label={`Remove ${value}`}
                  >
                    <Icons.X className="size-3" />
                  </button>
                ) : null}
              </Badge>
            </div>
          ))}
        </div>
      ) : (
        <Text variant="muted-inverse" size="sm">
          No benefits added yet. Press Enter after each item to turn it into a badge, then drag badges to reorder them.
        </Text>
      )}
    </div>
  );
}

function EditorSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <CardUI.Card tone="inverse">
      <CardUI.CardContent padding="auth" spacing="lg">
        <LayoutUI.Row justify="justify-between" align="items-start" className="gap-4 border-b border-black/10 pb-5 max-md:flex-col">
          <LayoutUI.Column gap="gap-1">
            <Text variant="inverse" className="font-['Sora'] text-xl font-bold tracking-[-0.03em]">
              {title}
            </Text>
            <Text variant="muted-inverse" size="sm" className="max-w-2xl leading-6">
              {description}
            </Text>
          </LayoutUI.Column>
        </LayoutUI.Row>

        <LayoutUI.Column gap="gap-5" className="pt-5">
          {children}
        </LayoutUI.Column>
      </CardUI.CardContent>
    </CardUI.Card>
  );
}
