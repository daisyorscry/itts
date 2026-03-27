import { z } from 'zod';
import * as Icons from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router';
import * as CardUI from '@components/ui/card';
import * as FormUI from '@components/ui/form';
import * as LayoutUI from '@components/ui/layout';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import * as SelectUI from '@components/ui/select';
import { Text } from '@components/ui/text';
import { useCreateSpeaker, useListEvents } from '@feature/event/hooks';
import { speakerSchema, type CreateSpeakerRequest, type SpeakerFormData } from '@feature/event/types';
import { SpeakerAvatarField } from './SpeakerAvatarField';

type SpeakerFormInput = z.input<typeof speakerSchema>;

export function AdminSpeakerCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultEventId = searchParams.get('eventId') || '';
  const { data: events } = useListEvents({ page_size: 100 });
  const { mutate: createSpeaker, isPending } = useCreateSpeaker();
  const form = useForm<SpeakerFormInput, unknown, SpeakerFormData>({
    resolver: zodResolver(speakerSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      event_id: defaultEventId,
      name: '',
      title: '',
      avatar_url: '',
      sort_order: 0,
    },
  });
  const { control, register, handleSubmit, watch, setValue, formState: { errors } } = form;

  const handleValidSubmit: SubmitHandler<SpeakerFormData> = (data) => {
    const payload: CreateSpeakerRequest = {
      event_id: data.event_id,
      name: data.name,
      title: data.title || undefined,
      avatar_url: data.avatar_url || undefined,
      sort_order: data.sort_order,
    };
    createSpeaker(payload, { onSuccess: (response) => navigate(`/admin/speakers/${response.data.id}`) });
  };

  return (
    <LayoutUI.Column gap="gap-6">
      <LayoutUI.Row justify="justify-between" align="items-start" className="gap-4 max-md:flex-col">
        <LayoutUI.Row gap="gap-4">
          <Button type="button" onClick={() => navigate('/admin/speakers')} variant="ghost-inverse" size="icon" className="rounded-xl border border-black/10 bg-black/5"><Icons.ArrowLeft size={20} /></Button>
          <LayoutUI.Column gap="gap-2">
            <Text as="h1" variant="inverse" className="font-['Sora'] text-3xl font-bold">Create Speaker</Text>
            <Text variant="muted-inverse">Assign and maintain speaker profiles for each event.</Text>
          </LayoutUI.Column>
        </LayoutUI.Row>
      </LayoutUI.Row>

      <FormUI.FormRoot onSubmit={handleSubmit(handleValidSubmit)}>
        <CardUI.Card tone="inverse"><CardUI.CardContent padding="auth" spacing="lg">
          <LayoutUI.Row className="border-b border-black/10 pb-4" gap="gap-3">
            <Text variant="inverse" className="font-['Sora'] text-lg font-semibold">Speaker Profile</Text>
          </LayoutUI.Row>

          <FormUI.FormField id="event_id" label="Event" error={errors.event_id?.message} tone="inverse">
            <Controller
              control={control}
              name="event_id"
              render={({ field }) => (
                <SelectUI.Select value={field.value || '__empty__'} onValueChange={(value) => field.onChange(value === '__empty__' ? '' : value)}>
                  <SelectUI.SelectTrigger appearance="admin">
                    <SelectUI.SelectValue placeholder="Select event" />
                  </SelectUI.SelectTrigger>
                  <SelectUI.SelectContent appearance="admin">
                    <SelectUI.SelectItem value="__empty__">Select event</SelectUI.SelectItem>
                    {(events?.data ?? []).map((event) => (
                      <SelectUI.SelectItem key={event.id} value={event.id}>{event.title}</SelectUI.SelectItem>
                    ))}
                  </SelectUI.SelectContent>
                </SelectUI.Select>
              )}
            />
          </FormUI.FormField>

          <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormUI.FormField id="name" label="Name" error={errors.name?.message} tone="inverse"><Input id="name" {...register('name')} hasError={Boolean(errors.name)} tone="inverse" /></FormUI.FormField>
            <FormUI.FormField id="title" label="Title" error={errors.title?.message} tone="inverse"><Input id="title" {...register('title')} tone="inverse" /></FormUI.FormField>
          </LayoutUI.Container>

          <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_120px]">
            <SpeakerAvatarField
              value={watch('avatar_url') || ''}
              error={errors.avatar_url?.message}
              onChange={(nextValue) => setValue('avatar_url', nextValue, { shouldDirty: true, shouldValidate: true })}
            />
            <FormUI.FormField id="sort_order" label="Sort Order" error={errors.sort_order?.message} tone="inverse"><Input id="sort_order" type="number" {...register('sort_order')} hasError={Boolean(errors.sort_order)} tone="inverse" /></FormUI.FormField>
          </LayoutUI.Container>
        </CardUI.CardContent></CardUI.Card>

        <CardUI.Card tone="inverse" border={false}><CardUI.CardContent><FormUI.FormFooter align="end" gap="md" flush><Button type="button" onClick={() => navigate('/admin/speakers')} variant="destructive" size="form">Cancel</Button><Button type="submit" disabled={isPending} variant="accent" size="form"><Icons.Save size={18} />{isPending ? 'Saving...' : 'Create Speaker'}</Button></FormUI.FormFooter></CardUI.CardContent></CardUI.Card>
      </FormUI.FormRoot>
    </LayoutUI.Column>
  );
}
