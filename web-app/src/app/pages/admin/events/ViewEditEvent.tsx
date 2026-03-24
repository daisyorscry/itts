import { z } from 'zod';
import { useEffect, useRef, useState } from 'react';
import * as Icons from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';
import * as CardUI from '@components/ui/card';
import * as FormUI from '@components/ui/form';
import * as LayoutUI from '@components/ui/layout';
import { Button } from '@components/ui/button';
import { Text } from '@components/ui/text';
import { QueryStatePanel } from '@components/query-state-panel';
import { useEvent, useUpdateEvent, useUploadEventImage } from '@feature/event/hooks';
import { eventSchema, type EventFormData, type UpdateEventRequest } from '@feature/event/types';
import { getFirstErrorField, toDatetimeLocal } from '@utility/date';
import { PERMISSIONS, useHasPermission } from '@utils/permissions';
import { EventEditorFields } from './EventEditorFields';

type EventFormInput = z.input<typeof eventSchema>;

export function AdminEventEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const canRead = useHasPermission(PERMISSIONS.EVENTS_READ);
  const canUpdate = useHasPermission(PERMISSIONS.EVENTS_UPDATE);
  const [uploadingField, setUploadingField] = useState<'square_image_url' | 'landscape_image_url' | null>(null);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<Partial<Record<'square_image_url' | 'landscape_image_url', string>>>({});
  const { data: event, isLoading, error } = useEvent(id ?? '', Boolean(id) && canRead);
  const { mutate: updateEvent, isPending } = useUpdateEvent(id ?? '');
  const uploadImage = useUploadEventImage();
  const hasInitialized = useRef(false);
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
  const { handleSubmit, reset, setValue, formState } = form;

  const resetFormWithEvent = () => {
    if (!event) return;
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
  };

  useEffect(() => {
    if (!id) {
      navigate('/admin/events', { replace: true });
    }
  }, [id, navigate]);

  useEffect(() => {
    if (event && !hasInitialized.current) {
      hasInitialized.current = true;
      resetFormWithEvent();
    }
  }, [event]);

  useEffect(() => {
    if (formState.submitCount < 1 || !Object.keys(formState.errors).length) {
      return;
    }

    const firstErrorField = getFirstErrorField(formState.errors);
    if (!firstErrorField) {
      return;
    }

    requestAnimationFrame(() => {
      const target = document.getElementById(firstErrorField);
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (target instanceof HTMLElement) {
        target.focus();
      }
    });
  }, [formState.submitCount, formState.errors]);

  if (isLoading) {
    return (
      <CardUI.Card tone="inverse">
        <CardUI.CardContent padding="auth">
          <div className="p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-[#29E68C]" />
            <Text className="mt-4" style={{ color: 'rgba(4, 9, 12, 0.6)' }}>Loading event data...</Text>
          </div>
        </CardUI.CardContent>
      </CardUI.Card>
    );
  }

  if (!canRead) {
    return (
      <QueryStatePanel
        tone="error"
        icon={Icons.ShieldAlert}
        title="You do not have permission to view this event"
        description="Ask an administrator for events:read access."
      />
    );
  }

  if (error || !event) {
    return (
      <CardUI.Card tone="inverse">
        <CardUI.CardContent padding="auth">
          <div className="p-12 text-center">
            <Text className="font-medium" style={{ color: '#04090C' }}>
              {error ? 'Error loading event data' : 'Event not found'}
            </Text>
            <Button onClick={() => navigate('/admin/events')} variant="accent" size="form" className="mt-4">
              Back to Events
            </Button>
          </div>
        </CardUI.CardContent>
      </CardUI.Card>
    );
  }

  const handleCancelEdit = () => {
    resetFormWithEvent();
    navigate(`/admin/events/${event.id}`);
  };

  const handleValidSubmit: SubmitHandler<EventFormData> = (data) => {
    const payload: UpdateEventRequest = {
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

    updateEvent(payload, {
      onSuccess: () => {
        navigate(`/admin/events/${event.id}`);
      },
    });
  };

  return (
    <LayoutUI.Column gap="gap-6">
      <LayoutUI.Row justify="justify-between" align="items-start" className="gap-4 max-md:flex-col">
        <LayoutUI.Row gap="gap-4">
          <Button type="button" onClick={() => navigate('/admin/events')} variant="ghost-inverse" size="icon">
            <Icons.ArrowLeft size={20} />
          </Button>
          <LayoutUI.Column gap="gap-2">
            <Text as="h1" variant="inverse" className="font-['Sora'] text-3xl font-bold">
              Edit Event
            </Text>
            <Text variant="muted-inverse" className="max-w-2xl">
              Refine the schedule, ticketing, and content without the old cluttered preview block.
            </Text>
          </LayoutUI.Column>
        </LayoutUI.Row>
      </LayoutUI.Row>

      <FormUI.FormRoot onSubmit={handleSubmit(handleValidSubmit)}>
        <CardUI.Card tone="inverse" border={false}>
          <CardUI.CardContent padding="auth" spacing="lg">
            <EventEditorFields
              form={form}
              disabled={isPending || !canUpdate}
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
          </CardUI.CardContent>
        </CardUI.Card>

        {canUpdate ? (
          <CardUI.Card tone="inverse" border={false}>
            <CardUI.CardContent>
              <FormUI.FormFooter align="end" gap="md" flush>
                <Button type="button" onClick={handleCancelEdit} variant="destructive" size="form">Cancel</Button>
                <Button type="submit" disabled={isPending} variant="accent" size="form">
                  <Icons.Save size={18} />
                  {isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </FormUI.FormFooter>
            </CardUI.CardContent>
          </CardUI.Card>
        ) : null}
      </FormUI.FormRoot>
    </LayoutUI.Column>
  );
}
