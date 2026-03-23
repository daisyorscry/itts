import { z } from 'zod';
import * as Icons from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import * as CardUI from '@components/ui/card';
import * as FormUI from '@components/ui/form';
import * as LayoutUI from '@components/ui/layout';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import * as SelectUI from '@components/ui/select';
import { Text } from '@components/ui/text';
import { Textarea } from '@components/ui/textarea';
import { useCreateMentor } from '@feature/mentor/hooks';
import { mentorSchema, type CreateMentorRequest, type MentorFormData, type ProgramType } from '@feature/mentor/types';

const programOptions: ProgramType[] = ['networking', 'devsecops', 'programming'];
const statusOptions = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
] as const;
type MentorFormInput = z.input<typeof mentorSchema>;

export function AdminMentorCreate() {
  const navigate = useNavigate();
  const { mutate: createMentor, isPending } = useCreateMentor();
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
  const { control, register, handleSubmit, formState: { errors } } = form;

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

    createMentor(payload, {
      onSuccess: (response) => {
        navigate(`/admin/mentors/${response.data.id}`);
      },
    });
  };

  return (
    <LayoutUI.Column gap="gap-6">
      <LayoutUI.Row justify="justify-between" align="items-start" className="gap-4 max-md:flex-col">
        <LayoutUI.Row gap="gap-4">
          <Button type="button" onClick={() => navigate('/admin/mentors')} variant="ghost-inverse" size="icon" className="rounded-xl border border-black/10 bg-black/5">
            <Icons.ArrowLeft size={20} />
          </Button>
          <LayoutUI.Column gap="gap-2">
            <Text as="h1" variant="inverse" className="font-['Sora'] text-3xl font-bold">Create Mentor</Text>
            <Text variant="muted-inverse">Manage mentor profile, expertise, and display priority.</Text>
          </LayoutUI.Column>
        </LayoutUI.Row>
      </LayoutUI.Row>

      <FormUI.FormRoot onSubmit={handleSubmit(handleValidSubmit)}>
        <CardUI.Card tone="inverse">
          <CardUI.CardContent padding="auth" spacing="lg">
            <LayoutUI.Row className="border-b border-black/10 pb-4" gap="gap-3">
              <Text variant="inverse" className="font-['Sora'] text-lg font-semibold">Mentor Profile</Text>
            </LayoutUI.Row>

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
              <Text variant="muted-inverse" size="xs">Select a program for this mentor.</Text>
            </FormUI.FormField>

            <FormUI.FormField id="bio" label="Bio" error={errors.bio?.message} tone="inverse">
              <Textarea id="bio" {...register('bio')} rows={4} />
            </FormUI.FormField>
          </CardUI.CardContent>
        </CardUI.Card>

        <CardUI.Card tone="inverse" border={false}>
          <CardUI.CardContent>
            <FormUI.FormFooter align="end" gap="md" flush>
              <Button type="button" onClick={() => navigate('/admin/mentors')} variant="destructive" size="form">
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} variant="accent" size="form">
                <Icons.Save size={18} />
                {isPending ? 'Saving...' : 'Create Mentor'}
              </Button>
            </FormUI.FormFooter>
          </CardUI.CardContent>
        </CardUI.Card>
      </FormUI.FormRoot>
    </LayoutUI.Column>
  );
}
