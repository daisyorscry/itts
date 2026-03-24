import { z } from 'zod';
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import * as Icons from 'lucide-react';
import * as CardUI from '@components/ui/card';
import * as DialogUI from '@components/ui/dialog';
import * as FormUI from '@components/ui/form';
import * as LayoutUI from '@components/ui/layout';
import { Button } from '@components/ui/button';
import { QueryStatePanel } from '@components/query-state-panel';
import { useCreateEvent, useUpdateEvent, useUploadEventImage } from '@feature/event/hooks';
import {
  eventSchema,
  type CreateEventRequest,
  type Event,
  type EventFormData,
  type UpdateEventRequest,
} from '@feature/event/types';
import { PERMISSIONS, useHasPermission } from '@utils/permissions';
import { EventEditorFields } from './EventEditorFields';

interface EventFormModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

type EventFormInput = z.input<typeof eventSchema>;

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
  const canCreate = useHasPermission(PERMISSIONS.EVENTS_CREATE);
  const canUpdate = useHasPermission(PERMISSIONS.EVENTS_UPDATE);
  const { mutate: createEvent, isPending: creating } = useCreateEvent();
  const { mutate: updateEvent, isPending: updating } = useUpdateEvent(event?.id ?? '');
  const uploadImage = useUploadEventImage();
  const [uploadingField, setUploadingField] = useState<'square_image_url' | 'landscape_image_url' | null>(null);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<Partial<Record<'square_image_url' | 'landscape_image_url', string>>>({});
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
      square_image_url: '',
      landscape_image_url: '',
      benefits: [],
      capacity: 0,
      registration_deadline: '',
      is_paid: false,
      price: 0,
      currency: 'IDR',
      program: undefined,
      status: 'draft',
      starts_at: '',
      ends_at: '',
      venue: '',
    },
  });
  const { handleSubmit, reset, setValue } = form;
  const isPending = creating || updating;

  if ((isEdit && !canUpdate) || (!isEdit && !canCreate)) {
    return (
      <DialogUI.Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogUI.DialogContent
          className="max-w-2xl overflow-y-auto border-black/10 bg-[#F7F4EC] p-6 text-[#04090C]"
          style={{ maxHeight: '90vh' }}
        >
          <QueryStatePanel
            tone="error"
            icon={Icons.ShieldAlert}
            title={isEdit ? 'You do not have permission to update events' : 'You do not have permission to create events'}
            description={isEdit ? 'Ask an administrator for events:update access.' : 'Ask an administrator for events:create access.'}
          />
        </DialogUI.DialogContent>
      </DialogUI.Dialog>
    );
  }

  const handleValidSubmit: SubmitHandler<EventFormData> = (data) => {
    const payload: CreateEventRequest = {
      slug: data.slug || undefined,
      title: data.title,
      summary: data.summary || undefined,
      description: data.description || undefined,
      square_file_path: data.square_image_url || undefined,
      landscape_file_path: data.landscape_image_url || undefined,
      benefits: data.benefits?.length ? data.benefits : undefined,
      program: data.program || undefined,
      status: data.status,
      capacity: data.capacity ?? 0,
      registration_deadline: data.registration_deadline ? new Date(data.registration_deadline).toISOString() : undefined,
      is_paid: Boolean(data.is_paid),
      price: data.is_paid ? Number(data.price ?? 0) : 0,
      currency: data.currency || 'IDR',
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
        square_file_path: payload.square_file_path,
        landscape_file_path: payload.landscape_file_path,
        benefits: payload.benefits,
        program: payload.program,
        status: payload.status,
        capacity: payload.capacity,
        registration_deadline: payload.registration_deadline,
        is_paid: payload.is_paid,
        price: payload.price,
        currency: payload.currency,
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
      setUploadedImageUrls({});
      reset({
        slug: '',
        title: '',
      summary: '',
      description: '',
      image_url: '',
      square_image_url: '',
      landscape_image_url: '',
      benefits: [],
      capacity: 0,
      registration_deadline: '',
      is_paid: false,
      price: 0,
      currency: 'IDR',
      program: undefined,
      status: 'draft',
      starts_at: '',
        ends_at: '',
        venue: '',
      });
      return;
    }

    setUploadedImageUrls({
      square_image_url: event.square_image_url ?? '',
      landscape_image_url: event.landscape_image_url ?? '',
    });
    reset({
      slug: event.slug ?? '',
      title: event.title,
      summary: event.summary ?? '',
      description: event.description ?? '',
      image_url: event.image_url ?? '',
      square_image_url: event.square_image_url ?? '',
      landscape_image_url: event.landscape_image_url ?? '',
      benefits: event.benefits ?? [],
      capacity: event.capacity ?? 0,
      registration_deadline: toDatetimeLocal(event.registration_deadline),
      is_paid: event.is_paid,
      price: event.price ?? 0,
      currency: event.currency ?? 'IDR',
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
              <EventEditorFields
                form={form}
                disabled={isPending}
                uploadingField={uploadingField}
                uploadedImageUrls={uploadedImageUrls}
                onFileSelect={async (field, file) => {
                  setUploadingField(field);
                  try {
                    const response = await uploadImage.mutateAsync(file);
                    setValue(field, response.data.file_path, { shouldDirty: true, shouldValidate: true });
                    setUploadedImageUrls((current) => ({
                      ...current,
                      [field]: response.data.image_url || response.data.file_path,
                    }));
                  } finally {
                    setUploadingField(null);
                  }
                }}
              />

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
