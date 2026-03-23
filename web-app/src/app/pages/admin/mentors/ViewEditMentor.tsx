import { z } from 'zod';
import { useEffect, useRef, useState } from 'react';
import * as Icons from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { useLocation, useNavigate, useParams } from 'react-router';
import * as CardUI from '@components/ui/card';
import * as FormUI from '@components/ui/form';
import * as LayoutUI from '@components/ui/layout';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import * as SelectUI from '@components/ui/select';
import { Text } from '@components/ui/text';
import { Textarea } from '@components/ui/textarea';
import { useMentor, useUpdateMentor } from '@feature/mentor/hooks';
import { mentorSchema, type MentorFormData, type ProgramType, type UpdateMentorRequest } from '@feature/mentor/types';

const programOptions: ProgramType[] = ['networking', 'devsecops', 'programming'];
const statusOptions = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
] as const;
type MentorFormInput = z.input<typeof mentorSchema>;

export function AdminMentorEdit() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const isRouteEditMode = location.pathname.includes('/admin/mentors/edit/');
  const [isEditMode, setIsEditMode] = useState(isRouteEditMode);
  const { data: mentor, isLoading, error } = useMentor(id ?? '', Boolean(id));
  const { mutate: updateMentor, isPending } = useUpdateMentor(id ?? '');
  const hasInitialized = useRef(false);
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

  const resetFormWithMentor = () => {
    if (!mentor) return;
    reset({
      full_name: mentor.full_name,
      title: mentor.title ?? '',
      bio: mentor.bio ?? '',
      avatar_url: mentor.avatar_url ?? '',
      programs: mentor.programs ?? [],
      is_active: mentor.is_active,
      priority: mentor.priority,
    });
  };

  useEffect(() => {
    if (!id) navigate('/admin/mentors', { replace: true });
  }, [id, navigate]);

  useEffect(() => {
    setIsEditMode(isRouteEditMode);
  }, [isRouteEditMode]);

  useEffect(() => {
    if (mentor && !hasInitialized.current) {
      hasInitialized.current = true;
      resetFormWithMentor();
    }
  }, [mentor]);

  if (isLoading) {
    return <CardUI.Card tone="inverse"><CardUI.CardContent padding="auth"><div className="p-12 text-center"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-[#29E68C]" /><Text className="mt-4" style={{ color: 'rgba(4, 9, 12, 0.6)' }}>Loading mentor data...</Text></div></CardUI.CardContent></CardUI.Card>;
  }
  if (error || !mentor) {
    return <CardUI.Card tone="inverse"><CardUI.CardContent padding="auth"><div className="p-12 text-center"><Text className="font-medium" style={{ color: '#04090C' }}>{error ? 'Error loading mentor data' : 'Mentor not found'}</Text><Button onClick={() => navigate('/admin/mentors')} variant="accent" size="form" className="mt-4">Back to Mentors</Button></div></CardUI.CardContent></CardUI.Card>;
  }

  const handleEnableEdit = () => {
    resetFormWithMentor();
    setIsEditMode(true);
    navigate(`/admin/mentors/edit/${mentor.id}`);
  };
  const handleCancelEdit = () => {
    resetFormWithMentor();
    setIsEditMode(false);
    navigate(`/admin/mentors/${mentor.id}`);
  };

  const handleValidSubmit: SubmitHandler<MentorFormData> = (data) => {
    if (!isEditMode) return;
    const payload: UpdateMentorRequest = {
      full_name: data.full_name,
      title: data.title || undefined,
      bio: data.bio || undefined,
      avatar_url: data.avatar_url || undefined,
      programs: data.programs,
      is_active: data.is_active,
      priority: data.priority,
    };
    updateMentor(payload, { onSuccess: () => { setIsEditMode(false); navigate(`/admin/mentors/${mentor.id}`); } });
  };

  return (
    <LayoutUI.Column gap="gap-6">
      <LayoutUI.Row justify="justify-between" align="items-start" className="gap-4 max-md:flex-col">
        <LayoutUI.Row gap="gap-4">
          <Button type="button" onClick={() => navigate('/admin/mentors')} variant="ghost-inverse" size="icon" className="rounded-xl border border-black/10 bg-black/5"><Icons.ArrowLeft size={20} /></Button>
          <LayoutUI.Column gap="gap-2">
            <Text as="h1" variant="inverse" className="font-['Sora'] text-3xl font-bold">{isEditMode ? 'Edit Mentor' : 'Mentor Details'}</Text>
            <Text variant="muted-inverse">{isEditMode ? 'Update mentor profile, expertise, and display priority.' : 'Review mentor information before editing.'}</Text>
          </LayoutUI.Column>
        </LayoutUI.Row>
        {!isEditMode ? <Button type="button" onClick={handleEnableEdit} variant="accent" size="form"><Icons.Edit size={18} />Edit Mentor</Button> : null}
      </LayoutUI.Row>

      <FormUI.FormRoot onSubmit={handleSubmit(handleValidSubmit)}>
        <CardUI.Card tone="inverse">
          <CardUI.CardContent padding="auth" spacing="lg">
            <LayoutUI.Row className="border-b border-black/10 pb-4" gap="gap-3">
              <LayoutUI.Container surface="accent" radius="xl" className="flex h-10 w-10 items-center justify-center"><Icons.UserRound className="text-[#29E68C]" size={20} /></LayoutUI.Container>
              <Text variant="inverse" className="font-['Sora'] text-lg font-semibold">Mentor Profile</Text>
            </LayoutUI.Row>

            <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormUI.FormField id="full_name" label="Full Name" error={errors.full_name?.message} tone="inverse">
                <Input id="full_name" {...register('full_name')} disabled={!isEditMode} hasError={Boolean(errors.full_name)} tone="inverse" className={!isEditMode ? 'cursor-default opacity-80' : undefined} />
              </FormUI.FormField>
              <FormUI.FormField id="title" label="Title" error={errors.title?.message} tone="inverse">
                <Input id="title" {...register('title')} disabled={!isEditMode} tone="inverse" className={!isEditMode ? 'cursor-default opacity-80' : undefined} />
              </FormUI.FormField>
            </LayoutUI.Container>

            <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_120px]">
              <FormUI.FormField id="avatar_url" label="Avatar URL" error={errors.avatar_url?.message} tone="inverse">
                <Input id="avatar_url" {...register('avatar_url')} disabled={!isEditMode} hasError={Boolean(errors.avatar_url)} tone="inverse" className={!isEditMode ? 'cursor-default opacity-80' : undefined} />
              </FormUI.FormField>
              <FormUI.FormField id="priority" label="Priority" error={errors.priority?.message} tone="inverse">
                <Input id="priority" type="number" {...register('priority')} disabled={!isEditMode} hasError={Boolean(errors.priority)} tone="inverse" className={!isEditMode ? 'cursor-default opacity-80' : undefined} />
              </FormUI.FormField>
            </LayoutUI.Container>

            <FormUI.FormField id="is_active" label="Status" error={errors.is_active?.message} tone="inverse">
              <Controller
                control={control}
                name="is_active"
                render={({ field }) => (
                  <SelectUI.Select value={String(field.value)} onValueChange={(value) => field.onChange(value === 'true')} disabled={!isEditMode}>
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
                    disabled={!isEditMode}
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
              <Textarea id="bio" {...register('bio')} disabled={!isEditMode} rows={4} className={`rounded-xl border-black/10 bg-transparent text-[#04090C] ${!isEditMode ? 'cursor-default opacity-80' : ''}`} />
            </FormUI.FormField>
          </CardUI.CardContent>
        </CardUI.Card>

        {isEditMode ? (
          <CardUI.Card tone="inverse" border={false}>
            <CardUI.CardContent>
              <FormUI.FormFooter align="end" gap="md" flush>
                <Button type="button" onClick={handleCancelEdit} variant="destructive" size="form">
                  Cancel
                </Button>
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
