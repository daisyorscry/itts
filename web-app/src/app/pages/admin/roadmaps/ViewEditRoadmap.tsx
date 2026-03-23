import { z } from 'zod';
import { useEffect, useRef, useState } from 'react';
import * as Icons from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { useLocation, useNavigate, useParams } from 'react-router';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import * as CardUI from '@components/ui/card';
import * as FormUI from '@components/ui/form';
import { Input } from '@components/ui/input';
import * as LayoutUI from '@components/ui/layout';
import * as SelectUI from '@components/ui/select';
import { Text } from '@components/ui/text';
import { Textarea } from '@components/ui/textarea';
import { useListRoadmapItems, useRoadmap, useUpdateRoadmap } from '@feature/roadmap/hooks';
import {
  roadmapSchema,
  type RoadmapFormData,
  type UpdateRoadmapRequest,
} from '@feature/roadmap/types';
import { formatDate } from '@utility/date';

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

export function AdminRoadmapEdit() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const isRouteEditMode = location.pathname.includes('/admin/roadmaps/edit/');
  const [isEditMode, setIsEditMode] = useState(isRouteEditMode);
  const { data: roadmap, isLoading, error } = useRoadmap(id ?? '', Boolean(id));
  const { data: roadmapItemsResponse } = useListRoadmapItems({
    roadmap_id: id || undefined,
    page: 1,
    page_size: 100,
  });
  const { mutate: updateRoadmap, isPending } = useUpdateRoadmap(id ?? '');
  const hasInitialized = useRef(false);
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
  const { control, register, handleSubmit, reset, formState: { errors } } = form;
  const roadmapItems = roadmapItemsResponse?.data ?? [];

  const resetFormWithRoadmap = () => {
    if (!roadmap) {
      return;
    }

    reset({
      program: roadmap.program || undefined,
      month_number: roadmap.month_number,
      title: roadmap.title,
      description: roadmap.description || '',
      sort_order: roadmap.sort_order,
      is_active: roadmap.is_active,
    });
  };

  useEffect(() => {
    setIsEditMode(isRouteEditMode);
  }, [isRouteEditMode]);

  useEffect(() => {
    if (!roadmap || hasInitialized.current) {
      return;
    }

    hasInitialized.current = true;
    resetFormWithRoadmap();
  }, [roadmap, reset]);

  const backToRoadmaps = () => {
    if (!id) {
      navigate('/admin/roadmaps');
      return;
    }

    navigate(`/admin/roadmaps?selectedRoadmapId=${id}`);
  };

  const handleEnableEdit = () => {
    resetFormWithRoadmap();
    setIsEditMode(true);
    navigate(`/admin/roadmaps/edit/${roadmap?.id}`);
  };

  const handleCancelEdit = () => {
    resetFormWithRoadmap();
    setIsEditMode(false);
    navigate(`/admin/roadmaps/${roadmap?.id}`);
  };

  const handleValidSubmit: SubmitHandler<RoadmapFormData> = (data) => {
    if (!isEditMode) {
      return;
    }

    const payload: UpdateRoadmapRequest = {
      program: data.program || undefined,
      month_number: data.month_number,
      title: data.title,
      description: data.description || undefined,
      sort_order: data.sort_order,
      is_active: data.is_active,
    };

    updateRoadmap(payload, {
      onSuccess: () => {
        setIsEditMode(false);
        navigate(`/admin/roadmaps/${id}`);
      },
    });
  };

  if (!id) {
    return (
      <CardUI.Card tone="inverse">
        <CardUI.CardContent padding="auth">
          <LayoutUI.Column gap="gap-4" className="p-6 text-center">
            <Text variant="inverse" className="font-medium">Roadmap not found</Text>
            <Button onClick={() => navigate('/admin/roadmaps')} variant="accent" size="form">
              Back to Roadmaps
            </Button>
          </LayoutUI.Column>
        </CardUI.CardContent>
      </CardUI.Card>
    );
  }

  if (isLoading) {
    return (
      <CardUI.Card tone="inverse">
        <CardUI.CardContent padding="auth">
          <div className="p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-[#29E68C]" />
            <Text className="mt-4" variant="muted-inverse">Loading roadmap...</Text>
          </div>
        </CardUI.CardContent>
      </CardUI.Card>
    );
  }

  if (error || !roadmap) {
    return (
      <CardUI.Card tone="inverse">
        <CardUI.CardContent padding="auth">
          <LayoutUI.Column gap="gap-4" className="p-6 text-center">
            <Text variant="inverse" className="font-medium">
              {error ? 'Error loading roadmap' : 'Roadmap not found'}
            </Text>
            <Button onClick={() => navigate('/admin/roadmaps')} variant="accent" size="form">
              Back to Roadmaps
            </Button>
          </LayoutUI.Column>
        </CardUI.CardContent>
      </CardUI.Card>
    );
  }

  return (
    <LayoutUI.Column gap="gap-6">
      <LayoutUI.Row justify="justify-between" align="items-start" className="max-md:flex-col max-md:gap-4">
        <LayoutUI.Row gap="gap-4">
          <Button type="button" onClick={backToRoadmaps} variant="ghost-inverse" size="icon" className="rounded-xl border border-black/10 bg-black/5">
            <Icons.ArrowLeft size={20} />
          </Button>
          <LayoutUI.Column gap="gap-2">
            <Text as="h1" variant="inverse" className="font-['Sora'] text-3xl font-bold">
              {isEditMode ? 'Edit Roadmap' : 'Roadmap Details'}
            </Text>
            <Text variant="muted-inverse">
              {isEditMode ? 'Update roadmap milestones and ordering.' : 'Review roadmap details and all milestone items.'}
            </Text>
          </LayoutUI.Column>
        </LayoutUI.Row>
        {!isEditMode ? (
          <Button type="button" onClick={handleEnableEdit} variant="soft-action" size="form">
            <Icons.Edit size={18} />
            Edit Roadmap
          </Button>
        ) : null}
      </LayoutUI.Row>

      <FormUI.FormRoot onSubmit={handleSubmit(handleValidSubmit)}>
        <LayoutUI.Column gap="gap-6">
          <CardUI.Card tone="inverse">
            <CardUI.CardContent padding="auth" spacing="lg">
              <LayoutUI.Row justify="justify-between" align="items-center" className="gap-3 border-b border-black/10 pb-4 max-sm:flex-col max-sm:items-start">
                <Text variant="inverse" className="font-['Sora'] text-lg font-semibold">
                  Roadmap Details
                </Text>
                <Button type="button" onClick={() => navigate(`/admin/roadmaps/${roadmap.id}/items`)} variant="ghost-inverse" size="sm">
                  <Icons.ListTodo size={16} />
                  View Items
                </Button>
              </LayoutUI.Row>

              <LayoutUI.Container surface="panel" padding="md" radius="xl">
                <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <LayoutUI.Column gap="gap-1">
                    <Text variant="muted-inverse" className="text-xs font-medium">Updated</Text>
                    <Text variant="inverse" className="text-sm font-medium">{formatDate(roadmap.updated_at)}</Text>
                  </LayoutUI.Column>
                  <LayoutUI.Column gap="gap-1">
                    <Text variant="muted-inverse" className="text-xs font-medium">Items</Text>
                    <Text variant="inverse" className="text-sm font-medium">{roadmapItems.length} milestone{roadmapItems.length === 1 ? '' : 's'}</Text>
                  </LayoutUI.Column>
                </LayoutUI.Container>
              </LayoutUI.Container>

              <LayoutUI.Container className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)] xl:items-start">
                <LayoutUI.Column gap="gap-4">
                  <FormUI.FormField id="title" label="Title" error={errors.title?.message} tone="inverse">
                    <Input id="title" {...register('title')} disabled={!isEditMode} hasError={Boolean(errors.title)} tone="inverse" />
                  </FormUI.FormField>

                  <FormUI.FormField id="description" label="Description" error={errors.description?.message} tone="inverse">
                    <Textarea id="description" {...register('description')} disabled={!isEditMode} rows={5} />
                  </FormUI.FormField>
                </LayoutUI.Column>

                <LayoutUI.Column gap="gap-4">
                  <FormUI.FormField id="program" label="Program" error={errors.program?.message} tone="inverse">
                    <Controller
                      control={control}
                      name="program"
                      render={({ field }) => (
                        <SelectUI.Select
                          value={field.value || 'general'}
                          onValueChange={(value) => field.onChange(value === 'general' ? '' : value)}
                          disabled={!isEditMode}
                        >
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

                  <LayoutUI.Container className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormUI.FormField id="month_number" label="Month Number" error={errors.month_number?.message} tone="inverse">
                      <Input id="month_number" type="number" {...register('month_number')} disabled={!isEditMode} hasError={Boolean(errors.month_number)} tone="inverse" />
                    </FormUI.FormField>
                    <FormUI.FormField id="sort_order" label="Sort Order" error={errors.sort_order?.message} tone="inverse">
                      <Input id="sort_order" type="number" {...register('sort_order')} disabled={!isEditMode} hasError={Boolean(errors.sort_order)} tone="inverse" />
                    </FormUI.FormField>
                  </LayoutUI.Container>

                  <FormUI.FormField id="is_active" label="Status" error={errors.is_active?.message} tone="inverse">
                    <Controller
                      control={control}
                      name="is_active"
                      render={({ field }) => (
                        <SelectUI.Select
                          value={String(field.value)}
                          onValueChange={(value) => field.onChange(value === 'true')}
                          disabled={!isEditMode}
                        >
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
                </LayoutUI.Column>
              </LayoutUI.Container>
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
        </LayoutUI.Column>
      </FormUI.FormRoot>
    </LayoutUI.Column>
  );
}
