import { z } from 'zod';
import { useEffect, useRef, useState } from 'react';
import * as Icons from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { useLocation, useNavigate, useParams } from 'react-router';
import * as CardUI from '@components/ui/card';
import * as FormUI from '@components/ui/form';
import * as LayoutUI from '@components/ui/layout';
import { Button } from '@components/ui/button';
import { Text } from '@components/ui/text';
import { useEvent, useUpdateEvent, useUploadEventImage } from '@feature/event/hooks';
import { eventSchema, type EventFormData, type UpdateEventRequest } from '@feature/event/types';
import { formatDateTime } from '@utility/date';
import { EventEditorFields } from './EventEditorFields';

type EventFormInput = z.input<typeof eventSchema>;

function toDatetimeLocal(value?: string | null) {
  if (!value) return '';
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function AdminEventEdit() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const isRouteEditMode = location.pathname.includes('/admin/events/edit/');
  const [isEditMode, setIsEditMode] = useState(isRouteEditMode);
  const { data: event, isLoading, error } = useEvent(id ?? '', Boolean(id));
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

  const resetFormWithEvent = () => {
    if (!event) return;
    reset({
      slug: event.slug ?? '',
      title: event.title,
      summary: event.summary ?? '',
      description: event.description ?? '',
      image_url: event.image_url ?? '',
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
    setIsEditMode(isRouteEditMode);
  }, [isRouteEditMode]);

  useEffect(() => {
    if (event && !hasInitialized.current) {
      hasInitialized.current = true;
      resetFormWithEvent();
    }
  }, [event]);

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

  const handleEnableEdit = () => {
    resetFormWithEvent();
    setIsEditMode(true);
    navigate(`/admin/events/edit/${event.id}`);
  };

  const handleCancelEdit = () => {
    resetFormWithEvent();
    setIsEditMode(false);
    navigate(`/admin/events/${event.id}`);
  };

  const handleValidSubmit: SubmitHandler<EventFormData> = (data) => {
    if (!isEditMode) return;

    const payload: UpdateEventRequest = {
      slug: data.slug || undefined,
      title: data.title,
      summary: data.summary || undefined,
      description: data.description || undefined,
      file_path: data.image_url || undefined,
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
        setIsEditMode(false);
        navigate(`/admin/events/${event.id}`);
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
              {isEditMode ? 'Edit Event' : 'Event Details'}
            </Text>
            <Text variant="muted-inverse">
              {isEditMode ? 'Update event details, schedule, and publication state.' : 'Review event details before editing.'}
            </Text>
          </LayoutUI.Column>
        </LayoutUI.Row>
        {!isEditMode ? (
          <Button type="button" onClick={handleEnableEdit} variant="accent" size="form">
            <Icons.Edit size={18} />
            Edit Event
          </Button>
        ) : null}
      </LayoutUI.Row>

      <FormUI.FormRoot onSubmit={handleSubmit(handleValidSubmit)}>
        <CardUI.Card tone="inverse">
          <CardUI.CardContent padding="auth" spacing="lg">
            <EventEditorFields
              form={form}
              disabled={!isEditMode || isPending}
              isUploading={uploadImage.isPending}
              onFileSelect={async (file) => {
                const response = await uploadImage.mutateAsync(file);
                setValue('image_url', response.data.file_path, { shouldDirty: true, shouldValidate: true });
              }}
            />

            {!isEditMode ? (
              <LayoutUI.Container className="rounded-xl border border-black/10 bg-black/5 px-4 py-3">
                <LayoutUI.Row className="max-md:flex-col max-md:gap-2" justify="justify-between">
                  <Text variant="muted-inverse" size="sm">Published schedule</Text>
                  <Text variant="inverse" size="sm">{formatDateTime(event.starts_at)}</Text>
                </LayoutUI.Row>
              </LayoutUI.Container>
            ) : null}
          </CardUI.CardContent>
        </CardUI.Card>

        {isEditMode ? (
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
