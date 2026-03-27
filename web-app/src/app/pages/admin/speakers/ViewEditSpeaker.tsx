import { z } from 'zod';
import { useEffect, useRef } from 'react';
import * as Icons from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';
import * as CardUI from '@components/ui/card';
import * as FormUI from '@components/ui/form';
import * as LayoutUI from '@components/ui/layout';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import * as SelectUI from '@components/ui/select';
import { Text } from '@components/ui/text';
import { useListEvents, useListSpeakers, useUpdateSpeaker } from '@feature/event/hooks';
import { speakerSchema, type Speaker, type SpeakerFormData, type UpdateSpeakerRequest } from '@feature/event/types';
import { SpeakerAvatarField } from './SpeakerAvatarField';

type SpeakerFormInput = z.input<typeof speakerSchema>;

export function AdminSpeakerEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data: events } = useListEvents({ page_size: 100 });
  const { data: speakerList, isLoading, error } = useListSpeakers({ page_size: 100 });
  const speaker = (speakerList?.data ?? []).find((item) => item.id === id) as Speaker | undefined;
  const { mutate: updateSpeaker, isPending } = useUpdateSpeaker();
  const hasInitialized = useRef(false);
  const form = useForm<SpeakerFormInput, unknown, SpeakerFormData>({
    resolver: zodResolver(speakerSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: { event_id: '', name: '', title: '', avatar_url: '', sort_order: 0 },
  });
  const { control, register, handleSubmit, reset, watch, setValue, formState: { errors } } = form;

  const resetFormWithSpeaker = () => {
    if (!speaker) return;
    reset({
      event_id: speaker.event_id,
      name: speaker.name,
      title: speaker.title ?? '',
      avatar_url: speaker.avatar_url ?? '',
      sort_order: speaker.sort_order,
    });
  };

  useEffect(() => { if (!id) navigate('/admin/speakers', { replace: true }); }, [id, navigate]);
  useEffect(() => { if (speaker && !hasInitialized.current) { hasInitialized.current = true; resetFormWithSpeaker(); } }, [speaker]);

  if (isLoading) return <CardUI.Card tone="inverse"><CardUI.CardContent padding="auth"><div className="p-12 text-center"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-[#29E68C]" /><Text className="mt-4" style={{ color: 'rgba(4, 9, 12, 0.6)' }}>Loading speaker data...</Text></div></CardUI.CardContent></CardUI.Card>;
  if (error || !speaker) return <CardUI.Card tone="inverse"><CardUI.CardContent padding="auth"><div className="p-12 text-center"><Text className="font-medium" style={{ color: '#04090C' }}>{error ? 'Error loading speaker data' : 'Speaker not found'}</Text><Button onClick={() => navigate('/admin/speakers')} variant="accent" size="form" className="mt-4">Back to Speakers</Button></div></CardUI.CardContent></CardUI.Card>;

  const handleValidSubmit: SubmitHandler<SpeakerFormData> = (data) => {
    const payload: UpdateSpeakerRequest = { event_id: data.event_id, name: data.name, title: data.title || undefined, avatar_url: data.avatar_url || undefined, sort_order: data.sort_order };
    updateSpeaker({ id: speaker.id, payload }, { onSuccess: () => navigate(`/admin/speakers/${speaker.id}`) });
  };

  return (
    <LayoutUI.Column gap="gap-6">
      <LayoutUI.Row justify="justify-between" align="items-start" className="gap-4 max-md:flex-col">
        <LayoutUI.Row gap="gap-4">
          <Button type="button" onClick={() => navigate('/admin/speakers')} variant="ghost-inverse" size="icon" className="rounded-xl border border-black/10 bg-black/5"><Icons.ArrowLeft size={20} /></Button>
          <LayoutUI.Column gap="gap-2">
            <Text as="h1" variant="inverse" className="font-['Sora'] text-3xl font-bold">Edit Speaker</Text>
            <Text variant="muted-inverse">Update speaker profile and event assignment.</Text>
          </LayoutUI.Column>
        </LayoutUI.Row>
      </LayoutUI.Row>

      <FormUI.FormRoot onSubmit={handleSubmit(handleValidSubmit)}>
        <CardUI.Card tone="inverse"><CardUI.CardContent padding="auth" spacing="lg">
          <LayoutUI.Row className="border-b border-black/10 pb-4" gap="gap-3"><Text variant="inverse" className="font-['Sora'] text-lg font-semibold">Speaker Profile</Text></LayoutUI.Row>
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
                    {(events?.data ?? []).map((event) => <SelectUI.SelectItem key={event.id} value={event.id}>{event.title}</SelectUI.SelectItem>)}
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
        <CardUI.Card tone="inverse" border={false}><CardUI.CardContent><FormUI.FormFooter align="end" gap="md" flush><Button type="button" onClick={() => { resetFormWithSpeaker(); navigate(`/admin/speakers/${speaker.id}`); }} variant="destructive" size="form">Cancel</Button><Button type="submit" disabled={isPending} variant="accent" size="form"><Icons.Save size={18} />{isPending ? 'Saving...' : 'Save Changes'}</Button></FormUI.FormFooter></CardUI.CardContent></CardUI.Card>
      </FormUI.FormRoot>
    </LayoutUI.Column>
  );
}
