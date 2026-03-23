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
import { Textarea } from '@components/ui/textarea';
import { useCreatePartner, useUpdatePartner } from '@feature/partner/hooks';
import {
  partnerSchema,
  type CreatePartnerRequest,
  type Partner,
  type PartnerFormData,
  type UpdatePartnerRequest,
} from '@feature/partner/types';

interface PartnerFormModalProps {
  partner: Partner | null;
  isOpen: boolean;
  onClose: () => void;
}

type PartnerFormInput = z.input<typeof partnerSchema>;
const modalKindOptions = [
  { value: 'lab', label: 'Lab' },
  { value: 'partner_academic', label: 'Academic' },
  { value: 'partner_industry', label: 'Industry' },
] as const;
const statusOptions = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
] as const;

export function PartnerFormModal({ partner, isOpen, onClose }: PartnerFormModalProps) {
  const isEdit = Boolean(partner);
  const { mutate: createPartner, isPending: creating } = useCreatePartner();
  const { mutate: updatePartner, isPending: updating } = useUpdatePartner(partner?.id ?? '');
  const form = useForm<PartnerFormInput, unknown, PartnerFormData>({
    resolver: zodResolver(partnerSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      name: '',
      kind: 'lab',
      subtitle: '',
      description: '',
      logo_url: '',
      website_url: '',
      is_active: true,
      priority: 0,
    },
  });
  const { control, register, handleSubmit, reset, formState: { errors } } = form;
  const isPending = creating || updating;

  const handleValidSubmit: SubmitHandler<PartnerFormData> = (data) => {
    const payload: CreatePartnerRequest = {
      name: data.name,
      kind: data.kind,
      subtitle: data.subtitle || undefined,
      description: data.description || undefined,
      logo_url: data.logo_url || undefined,
      website_url: data.website_url || undefined,
      is_active: data.is_active,
      priority: data.priority,
    };

    if (isEdit && partner) {
      const updatePayload: UpdatePartnerRequest = {
        name: payload.name,
        kind: payload.kind,
        subtitle: payload.subtitle,
        description: payload.description,
        logo_url: payload.logo_url,
        website_url: payload.website_url,
        is_active: payload.is_active,
        priority: payload.priority,
      };

      updatePartner(updatePayload, { onSuccess: onClose });
      return;
    }

    createPartner(payload, {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  };

  useEffect(() => {
    if (!partner) {
      reset({
        name: '',
        kind: 'lab',
        subtitle: '',
        description: '',
        logo_url: '',
        website_url: '',
        is_active: true,
        priority: 0,
      });
      return;
    }

    reset({
      name: partner.name,
      kind: partner.kind,
      subtitle: partner.subtitle ?? '',
      description: partner.description ?? '',
      logo_url: partner.logo_url ?? '',
      website_url: partner.website_url ?? '',
      is_active: partner.is_active,
      priority: partner.priority,
    });
  }, [partner, reset]);

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
                  <Icons.Handshake className="size-5 text-[#04090C]" />
                </LayoutUI.Container>
                <LayoutUI.Column gap="gap-1">
                  <DialogUI.DialogTitle className="font-['Sora'] text-xl font-bold text-[#04090C]">
                    {isEdit ? 'Edit Partner' : 'Create Partner'}
                  </DialogUI.DialogTitle>
                  <DialogUI.DialogDescription className="text-sm text-black/60">
                    Manage labs, academic partners, and industry partners.
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
                <FormUI.FormField id="name" label="Name" error={errors.name?.message} tone="inverse">
                  <Input id="name" {...register('name')} hasError={Boolean(errors.name)} tone="inverse" />
                </FormUI.FormField>
                <FormUI.FormField id="kind" label="Kind" error={errors.kind?.message} tone="inverse">
                  <Controller control={control} name="kind" render={({ field }) => (
                    <SelectUI.Select value={field.value} onValueChange={field.onChange}>
                      <SelectUI.SelectTrigger appearance="admin"><SelectUI.SelectValue placeholder="Select kind" /></SelectUI.SelectTrigger>
                      <SelectUI.SelectContent appearance="admin">
                        {modalKindOptions.map((option) => <SelectUI.SelectItem key={option.value} value={option.value}>{option.label}</SelectUI.SelectItem>)}
                      </SelectUI.SelectContent>
                    </SelectUI.Select>
                  )} />
                </FormUI.FormField>
              </LayoutUI.Container>

              <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormUI.FormField id="logo_url" label="Logo URL" error={errors.logo_url?.message} tone="inverse">
                  <Input id="logo_url" {...register('logo_url')} hasError={Boolean(errors.logo_url)} tone="inverse" />
                </FormUI.FormField>
                <FormUI.FormField id="website_url" label="Website URL" error={errors.website_url?.message} tone="inverse">
                  <Input id="website_url" {...register('website_url')} hasError={Boolean(errors.website_url)} tone="inverse" />
                </FormUI.FormField>
              </LayoutUI.Container>

              <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_120px]">
                <FormUI.FormField id="subtitle" label="Subtitle" error={errors.subtitle?.message} tone="inverse">
                  <Input id="subtitle" {...register('subtitle')} tone="inverse" />
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

              <FormUI.FormField id="description" label="Description" error={errors.description?.message} tone="inverse">
                <Textarea id="description" {...register('description')} rows={4} />
              </FormUI.FormField>

              <FormUI.FormFooter align="end" gap="md" flush className="border-t border-black/10">
                <Button type="button" onClick={onClose} variant="destructive" size="form">
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending} variant="accent" size="form">
                  <Icons.Save size={18} />
                  {isPending ? 'Saving...' : isEdit ? 'Update Partner' : 'Create Partner'}
                </Button>
              </FormUI.FormFooter>
            </FormUI.FormRoot>
          </CardUI.CardContent>
        </CardUI.Card>
      </DialogUI.DialogContent>
    </DialogUI.Dialog>
  );
}
