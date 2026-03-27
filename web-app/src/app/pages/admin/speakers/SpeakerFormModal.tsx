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
import { Input } from '@components/ui/input';
import * as SelectUI from '@components/ui/select';
import { useListEvents, useCreateSpeaker, useUpdateSpeaker } from '@feature/event/hooks';
import {
  speakerSchema,
  type CreateSpeakerRequest,
  type Speaker,
  type SpeakerFormData,
  type UpdateSpeakerRequest,
} from '@feature/event/types';
import { SpeakerAvatarField } from './SpeakerAvatarField';

interface SpeakerFormModalProps {
  speaker: Speaker | null;
  defaultEventId?: string;
  isOpen: boolean;
  onClose: () => void;
}

type SpeakerFormInput = z.input<typeof speakerSchema>;

export function SpeakerFormModal({ speaker, defaultEventId, isOpen, onClose }: SpeakerFormModalProps) {
  const isEdit = Boolean(speaker);
  const { data: events } = useListEvents({ page_size: 100 });
  const { mutate: createSpeaker, isPending: creating } = useCreateSpeaker();
  const { mutate: updateSpeaker, isPending: updating } = useUpdateSpeaker();
  const form = useForm<SpeakerFormInput, unknown, SpeakerFormData>({
    resolver: zodResolver(speakerSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      event_id: defaultEventId || '',
      name: '',
      title: '',
      avatar_url: '',
      sort_order: 0,
    },
  });
  const { control, register, handleSubmit, reset, watch, setValue, formState: { errors } } = form;
  const isPending = creating || updating;

  const handleValidSubmit: SubmitHandler<SpeakerFormData> = (data) => {
    const payload: CreateSpeakerRequest = {
      event_id: data.event_id,
      name: data.name,
      title: data.title || undefined,
      avatar_url: data.avatar_url || undefined,
      sort_order: data.sort_order,
    };

    if (isEdit && speaker) {
      const updatePayload: UpdateSpeakerRequest = {
        event_id: payload.event_id,
        name: payload.name,
        title: payload.title,
        avatar_url: payload.avatar_url,
        sort_order: payload.sort_order,
      };

      updateSpeaker({ id: speaker.id, payload: updatePayload }, { onSuccess: onClose });
      return;
    }

    createSpeaker(payload, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  useEffect(() => {
    if (!speaker) {
      reset({
        event_id: defaultEventId || '',
        name: '',
        title: '',
        avatar_url: '',
        sort_order: 0,
      });
      return;
    }

    reset({
      event_id: speaker.event_id,
      name: speaker.name,
      title: speaker.title ?? '',
      avatar_url: speaker.avatar_url ?? '',
      sort_order: speaker.sort_order,
    });
  }, [defaultEventId, reset, speaker]);

  return (
    <DialogUI.Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogUI.DialogContent
        className="max-w-2xl overflow-y-auto border-black/10 bg-[#F7F4EC] p-0 text-[#04090C]"
        style={{ maxHeight: '90vh' }}
      >
        <CardUI.Card tone="inverse" className="gap-0 border-0 bg-transparent">
          <CardUI.CardHeader className="pb-6">
            <LayoutUI.Row align="items-start" gap="gap-3">
              <LayoutUI.Container surface="accent" radius="xl" className="flex h-11 w-11 items-center justify-center">
                <Icons.Mic2 className="size-5 text-[#04090C]" />
              </LayoutUI.Container>
              <LayoutUI.Column gap="gap-1">
                <DialogUI.DialogTitle className="font-['Sora'] text-xl font-bold text-[#04090C]">
                  {isEdit ? 'Edit Speaker' : 'Add Speaker'}
                </DialogUI.DialogTitle>
                <DialogUI.DialogDescription className="text-sm text-black/60">
                  Assign and maintain speaker profiles for each event.
                </DialogUI.DialogDescription>
              </LayoutUI.Column>
            </LayoutUI.Row>
          </CardUI.CardHeader>

          <CardUI.CardContent spacing="lg" className="pb-6">
            <FormUI.FormRoot
              onSubmit={handleSubmit(handleValidSubmit)}
            >
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
                <FormUI.FormField id="name" label="Name" error={errors.name?.message} tone="inverse">
                  <Input id="name" {...register('name')} hasError={Boolean(errors.name)} tone="inverse" />
                </FormUI.FormField>
                <FormUI.FormField id="title" label="Title" error={errors.title?.message} tone="inverse">
                  <Input id="title" {...register('title')} tone="inverse" />
                </FormUI.FormField>
              </LayoutUI.Container>

              <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_120px]">
                <SpeakerAvatarField
                  value={watch('avatar_url') || ''}
                  error={errors.avatar_url?.message}
                  onChange={(nextValue) => setValue('avatar_url', nextValue, { shouldDirty: true, shouldValidate: true })}
                />
                <FormUI.FormField id="sort_order" label="Sort Order" error={errors.sort_order?.message} tone="inverse">
                  <Input id="sort_order" type="number" {...register('sort_order')} hasError={Boolean(errors.sort_order)} tone="inverse" />
                </FormUI.FormField>
              </LayoutUI.Container>

              <FormUI.FormFooter align="end" gap="md" flush className="border-t border-black/10">
                <Button type="button" onClick={onClose} variant="destructive" size="form">
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending} variant="accent" size="form">
                  <Icons.Save size={18} />
                  {isPending ? 'Saving...' : isEdit ? 'Update Speaker' : 'Add Speaker'}
                </Button>
              </FormUI.FormFooter>
            </FormUI.FormRoot>
          </CardUI.CardContent>
        </CardUI.Card>
      </DialogUI.DialogContent>
    </DialogUI.Dialog>
  );
}
