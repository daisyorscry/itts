import { z } from 'zod';
import * as Icons from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { Button } from '@components/ui/button';
import * as CardUI from '@components/ui/card';
import * as FormUI from '@components/ui/form';
import { Input } from '@components/ui/input';
import * as LayoutUI from '@components/ui/layout';
import * as SelectUI from '@components/ui/select';
import { Text } from '@components/ui/text';
import { Textarea } from '@components/ui/textarea';
import { useCreateRoadmap } from '@feature/roadmap/hooks';
import {
  roadmapSchema,
  type CreateRoadmapRequest,
  type RoadmapFormData,
} from '@feature/roadmap/types';

type RoadmapFormInput = z.input<typeof roadmapSchema>;

const programOptions = [
  { value: 'general', label: 'General' },
  { value: 'networking', label: 'Networking' },
  { value: 'devsecops', label: 'DevSecOps' },
  { value: 'programming', label: 'Programming' },
] as const;

const statusOptions = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
] as const;

export function AdminRoadmapCreate() {
  const navigate = useNavigate();
  const { mutate: createRoadmap, isPending } = useCreateRoadmap();
  const form = useForm<RoadmapFormInput, unknown, RoadmapFormData>({
    resolver: zodResolver(roadmapSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      month_number: 1,
      title: '',
      description: '',
      sort_order: 0,
      is_active: true,
    },
  });
  const { control, register, handleSubmit, formState: { errors } } = form;

  const handleValidSubmit: SubmitHandler<RoadmapFormData> = (data) => {
    const payload: CreateRoadmapRequest = {
      program: data.program || undefined,
      month_number: data.month_number,
      title: data.title,
      description: data.description || undefined,
      sort_order: data.sort_order,
      is_active: data.is_active,
    };

    createRoadmap(payload, {
      onSuccess: (response) => {
        navigate(`/admin/roadmaps?selectedRoadmapId=${response.data.id}`);
      },
    });
  };

  return (
    <LayoutUI.Column gap="gap-6">
      <LayoutUI.Row justify="justify-between" align="items-start" className="max-md:flex-col max-md:gap-4">
        <LayoutUI.Row gap="gap-4">
          <Button type="button" onClick={() => navigate('/admin/roadmaps')} variant="ghost-inverse" size="icon" className="rounded-xl border border-black/10 bg-black/5">
            <Icons.ArrowLeft size={20} />
          </Button>
          <LayoutUI.Column gap="gap-2">
            <Text as="h1" variant="inverse" className="font-['Sora'] text-3xl font-bold">
              Create Roadmap
            </Text>
            <Text variant="muted-inverse">
              Maintain roadmap milestones and ordering for each program.
            </Text>
          </LayoutUI.Column>
        </LayoutUI.Row>
      </LayoutUI.Row>

      <FormUI.FormRoot onSubmit={handleSubmit(handleValidSubmit)}>
        <CardUI.Card tone="inverse">
          <CardUI.CardContent padding="auth" spacing="lg">
            <LayoutUI.Row className="border-b border-black/10 pb-4" gap="gap-3">
              <LayoutUI.Container surface="accent" radius="xl" className="flex h-10 w-10 items-center justify-center">
                <Icons.Map className="text-[#29E68C]" size={20} />
              </LayoutUI.Container>
              <Text variant="inverse" className="font-['Sora'] text-lg font-semibold">
                Roadmap Details
              </Text>
            </LayoutUI.Row>

            <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormUI.FormField id="title" label="Title" error={errors.title?.message} tone="inverse">
                <Input id="title" {...register('title')} hasError={Boolean(errors.title)} tone="inverse" />
              </FormUI.FormField>
              <FormUI.FormField id="program" label="Program" error={errors.program?.message} tone="inverse">
                <Controller
                  control={control}
                  name="program"
                  render={({ field }) => (
                    <SelectUI.Select value={field.value || 'general'} onValueChange={(value) => field.onChange(value === 'general' ? '' : value)}>
                      <SelectUI.SelectTrigger appearance="admin">
                        <SelectUI.SelectValue placeholder="Select program" />
                      </SelectUI.SelectTrigger>
                      <SelectUI.SelectContent appearance="admin">
                        {programOptions.map((option) => (
                          <SelectUI.SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectUI.SelectItem>
                        ))}
                      </SelectUI.SelectContent>
                    </SelectUI.Select>
                  )}
                />
              </FormUI.FormField>
            </LayoutUI.Container>

            <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <FormUI.FormField id="month_number" label="Month Number" error={errors.month_number?.message} tone="inverse">
                <Input id="month_number" type="number" {...register('month_number')} hasError={Boolean(errors.month_number)} tone="inverse" />
              </FormUI.FormField>
              <FormUI.FormField id="sort_order" label="Sort Order" error={errors.sort_order?.message} tone="inverse">
                <Input id="sort_order" type="number" {...register('sort_order')} hasError={Boolean(errors.sort_order)} tone="inverse" />
              </FormUI.FormField>
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
            </LayoutUI.Container>

            <FormUI.FormField id="description" label="Description" error={errors.description?.message} tone="inverse">
              <Textarea id="description" {...register('description')} rows={5} className="rounded-xl border-black/10 bg-transparent text-[#04090C]" />
            </FormUI.FormField>
          </CardUI.CardContent>
        </CardUI.Card>

        <CardUI.Card tone="inverse">
          <CardUI.CardContent padding="auth">
            <FormUI.FormFooter align="end" gap="md" flush>
              <Button type="button" onClick={() => navigate('/admin/roadmaps')} variant="ghost-inverse" size="form">
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} variant="accent" size="form">
                <Icons.Save size={18} />
                {isPending ? 'Saving...' : 'Create Roadmap'}
              </Button>
            </FormUI.FormFooter>
          </CardUI.CardContent>
        </CardUI.Card>
      </FormUI.FormRoot>
    </LayoutUI.Column>
  );
}
