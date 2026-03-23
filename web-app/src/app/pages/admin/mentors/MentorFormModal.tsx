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
import { Text } from '@components/ui/text';
import { Textarea } from '@components/ui/textarea';
import { useCreateMentor, useUpdateMentor } from '@feature/mentor/hooks';
import {
  mentorSchema,
  type CreateMentorRequest,
  type Mentor,
  type MentorFormData,
  type ProgramType,
  type UpdateMentorRequest,
} from '@feature/mentor/types';

interface MentorFormModalProps {
  mentor: Mentor | null;
  isOpen: boolean;
  onClose: () => void;
}

const programOptions: ProgramType[] = ['networking', 'devsecops', 'programming'];
const statusOptions = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
] as const;
type MentorFormInput = z.input<typeof mentorSchema>;

export function MentorFormModal({ mentor, isOpen, onClose }: MentorFormModalProps) {
  const isEdit = Boolean(mentor);
  const { mutate: createMentor, isPending: creating } = useCreateMentor();
  const { mutate: updateMentor, isPending: updating } = useUpdateMentor(mentor?.id ?? '');
  const form = useForm<MentorFormInput, unknown, MentorFormData>({
    resolver: zodResolver(mentorSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      full_name: '',
      title: '',
      bio: '',
      avatar_url: '',
      programs: [],
      is_active: true,
      priority: 0,
    },
  });
  const { control, register, handleSubmit, reset, formState: { errors } } = form;
  const isPending = creating || updating;

  const handleValidSubmit: SubmitHandler<MentorFormData> = (data) => {
    const payload: CreateMentorRequest = {
      full_name: data.full_name,
      title: data.title || undefined,
      bio: data.bio || undefined,
      avatar_url: data.avatar_url || undefined,
      programs: data.programs,
      is_active: data.is_active,
      priority: data.priority,
    };

    if (isEdit && mentor) {
      const updatePayload: UpdateMentorRequest = {
        full_name: payload.full_name,
        title: payload.title,
        bio: payload.bio,
        avatar_url: payload.avatar_url,
        programs: payload.programs,
        is_active: payload.is_active,
        priority: payload.priority,
      };

      updateMentor(updatePayload, { onSuccess: onClose });
      return;
    }

    createMentor(payload, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  useEffect(() => {
    if (!mentor) {
      reset({
        full_name: '',
        title: '',
        bio: '',
        avatar_url: '',
        programs: [],
        is_active: true,
        priority: 0,
      });
      return;
    }

    reset({
      full_name: mentor.full_name,
      title: mentor.title ?? '',
      bio: mentor.bio ?? '',
      avatar_url: mentor.avatar_url ?? '',
      programs: mentor.programs ?? [],
      is_active: mentor.is_active,
      priority: mentor.priority,
    });
  }, [mentor, reset]);

  return (
    <DialogUI.Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogUI.DialogContent
        className="max-w-2xl overflow-y-auto border-black/10 bg-[#F7F4EC] p-0 text-[#04090C]"
        style={{ maxHeight: '90vh' }}
      >
        <CardUI.Card tone="inverse" className="gap-0 border-0 bg-transparent">
          <CardUI.CardHeader className="pb-6">
            <LayoutUI.Row justify="between" align="start" gap="gap-4">
              <LayoutUI.Row align="center" gap="gap-3">
                <LayoutUI.Container surface="accent" radius="xl" className="flex h-11 w-11 items-center justify-center">
                  <Icons.UserRound className="size-5 text-[#04090C]" />
                </LayoutUI.Container>
                <LayoutUI.Column gap="gap-1">
                  <DialogUI.DialogTitle className="font-['Sora'] text-xl font-bold text-[#04090C]">
                    {isEdit ? 'Edit Mentor' : 'Create Mentor'}
                  </DialogUI.DialogTitle>
                  <DialogUI.DialogDescription className="text-sm text-black/60">
                    Manage mentor profile, expertise, and display priority.
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
                <FormUI.FormField id="full_name" label="Full Name" error={errors.full_name?.message} tone="inverse">
                  <Input id="full_name" {...register('full_name')} hasError={Boolean(errors.full_name)} tone="inverse" />
                </FormUI.FormField>
                <FormUI.FormField id="title" label="Title" error={errors.title?.message} tone="inverse">
                  <Input id="title" {...register('title')} tone="inverse" />
                </FormUI.FormField>
              </LayoutUI.Container>

              <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_120px]">
                <FormUI.FormField id="avatar_url" label="Avatar URL" error={errors.avatar_url?.message} tone="inverse">
                  <Input id="avatar_url" {...register('avatar_url')} hasError={Boolean(errors.avatar_url)} tone="inverse" />
                </FormUI.FormField>
                <FormUI.FormField id="priority" label="Priority" error={errors.priority?.message} tone="inverse">
                  <Input id="priority" type="number" {...register('priority')} hasError={Boolean(errors.priority)} tone="inverse" />
                </FormUI.FormField>
              </LayoutUI.Container>
              <FormUI.FormField id="is_active" label="Status" error={errors.is_active?.message} tone="inverse">
                <Controller
                  control={control}
                  name="is_active"
                  render={({ field }) => (
                    <SelectUI.Select value={String(field.value)} onValueChange={(value) => field.onChange(value === 'true')}>
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

              <FormUI.FormField id="programs" label="Programs" error={errors.programs?.message as string | undefined} tone="inverse">
                <Controller
                  control={control}
                  name="programs"
                  render={({ field }) => (
                    <SelectUI.Select
                      value={field.value?.[0] || '__empty__'}
                      onValueChange={(value) => field.onChange(value === '__empty__' ? [] : [value])}
                    >
                      <SelectUI.SelectTrigger appearance="admin">
                        <SelectUI.SelectValue placeholder="Select program" />
                      </SelectUI.SelectTrigger>
                      <SelectUI.SelectContent appearance="admin">
                        <SelectUI.SelectItem value="__empty__">Select program</SelectUI.SelectItem>
                        {programOptions.map((program) => (
                          <SelectUI.SelectItem key={program} value={program}>
                            {program.charAt(0).toUpperCase() + program.slice(1)}
                          </SelectUI.SelectItem>
                        ))}
                      </SelectUI.SelectContent>
                    </SelectUI.Select>
                  )}
                />
                <Text variant="muted-inverse" size="xs">
                  Select a program for this mentor.
                </Text>
              </FormUI.FormField>

              <FormUI.FormField id="bio" label="Bio" error={errors.bio?.message} tone="inverse">
                <Textarea id="bio" {...register('bio')} rows={4} className="rounded-xl border-black/10 bg-transparent text-[#04090C]" />
              </FormUI.FormField>

              <FormUI.FormFooter align="end" gap="md" flush className="border-t border-black/10">
                <Button type="button" onClick={onClose} variant="destructive" size="form">
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending} variant="accent" size="form">
                  <Icons.Save size={18} />
                  {isPending ? 'Saving...' : isEdit ? 'Update Mentor' : 'Create Mentor'}
                </Button>
              </FormUI.FormFooter>
            </FormUI.FormRoot>
          </CardUI.CardContent>
        </CardUI.Card>
      </DialogUI.DialogContent>
    </DialogUI.Dialog>
  );
}
