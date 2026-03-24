import { z } from 'zod';
import * as Icons from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { type SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import * as CardUI from '@components/ui/card';
import * as FormUI from '@components/ui/form';
import * as LayoutUI from '@components/ui/layout';
import { Button } from '@components/ui/button';
import { Text } from '@components/ui/text';
import { useCreateEvent, useUploadEventImage } from '@feature/event/hooks';
import { eventSchema, type CreateEventRequest, type EventFormData } from '@feature/event/types';
import { EventEditorFields } from './EventEditorFields';

type EventFormInput = z.input<typeof eventSchema>;

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
  const { handleSubmit, setValue } = form;

  const handleValidSubmit: SubmitHandler<EventFormData> = (data) => {
    const payload: CreateEventRequest = {
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
            <EventEditorFields
              form={form}
              isUploading={uploadImage.isPending}
              onFileSelect={async (file) => {
                const response = await uploadImage.mutateAsync(file);
                setValue('image_url', response.data.file_path, { shouldDirty: true, shouldValidate: true });
              }}
            />
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
