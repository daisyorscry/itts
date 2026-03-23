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
import { usePartner, useUpdatePartner } from '@feature/partner/hooks';
import { partnerSchema, type PartnerFormData, type UpdatePartnerRequest } from '@feature/partner/types';

type PartnerFormInput = z.input<typeof partnerSchema>;
const kindOptions = [
  { value: 'lab', label: 'Lab' },
  { value: 'partner_academic', label: 'Academic' },
  { value: 'partner_industry', label: 'Industry' },
] as const;
const statusOptions = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
] as const;

export function AdminPartnerEdit() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const isRouteEditMode = location.pathname.includes('/admin/partners/edit/');
  const [isEditMode, setIsEditMode] = useState(isRouteEditMode);
  const { data: partner, isLoading, error } = usePartner(id ?? '', Boolean(id));
  const { mutate: updatePartner, isPending } = useUpdatePartner(id ?? '');
  const hasInitialized = useRef(false);
  const form = useForm<PartnerFormInput, unknown, PartnerFormData>({
    resolver: zodResolver(partnerSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: { name: '', kind: 'lab', subtitle: '', description: '', logo_url: '', website_url: '', is_active: true, priority: 0 },
  });
  const { control, register, handleSubmit, reset, formState: { errors } } = form;

  const resetFormWithPartner = () => {
    if (!partner) return;
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
  };
  useEffect(() => { if (!id) navigate('/admin/partners', { replace: true }); }, [id, navigate]);
  useEffect(() => { setIsEditMode(isRouteEditMode); }, [isRouteEditMode]);
  useEffect(() => { if (partner && !hasInitialized.current) { hasInitialized.current = true; resetFormWithPartner(); } }, [partner]);

  if (isLoading) return <CardUI.Card tone="inverse"><CardUI.CardContent padding="auth"><div className="p-12 text-center"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-[#29E68C]" /><Text className="mt-4" style={{ color: 'rgba(4, 9, 12, 0.6)' }}>Loading partner data...</Text></div></CardUI.CardContent></CardUI.Card>;
  if (error || !partner) return <CardUI.Card tone="inverse"><CardUI.CardContent padding="auth"><div className="p-12 text-center"><Text className="font-medium" style={{ color: '#04090C' }}>{error ? 'Error loading partner data' : 'Partner not found'}</Text><Button onClick={() => navigate('/admin/partners')} variant="accent" size="form" className="mt-4">Back to Partners</Button></div></CardUI.CardContent></CardUI.Card>;

  const handleEnableEdit = () => { resetFormWithPartner(); setIsEditMode(true); navigate(`/admin/partners/edit/${partner.id}`); };
  const handleCancelEdit = () => { resetFormWithPartner(); setIsEditMode(false); navigate(`/admin/partners/${partner.id}`); };
  const handleValidSubmit: SubmitHandler<PartnerFormData> = (data) => {
    if (!isEditMode) return;
    const payload: UpdatePartnerRequest = {
      name: data.name,
      kind: data.kind,
      subtitle: data.subtitle || undefined,
      description: data.description || undefined,
      logo_url: data.logo_url || undefined,
      website_url: data.website_url || undefined,
      is_active: data.is_active,
      priority: data.priority,
    };
    updatePartner(payload, { onSuccess: () => { setIsEditMode(false); navigate(`/admin/partners/${partner.id}`); } });
  };

  return (
    <LayoutUI.Column gap="gap-6">
      <LayoutUI.Row justify="justify-between" align="items-start" className="gap-4 max-md:flex-col">
        <LayoutUI.Row gap="gap-4">
          <Button type="button" onClick={() => navigate('/admin/partners')} variant="ghost-inverse" size="icon" className="rounded-xl border border-black/10 bg-black/5"><Icons.ArrowLeft size={20} /></Button>
          <LayoutUI.Column gap="gap-2">
            <Text as="h1" variant="inverse" className="font-['Sora'] text-3xl font-bold">{isEditMode ? 'Edit Partner' : 'Partner Details'}</Text>
            <Text variant="muted-inverse">{isEditMode ? 'Update partner profile and metadata.' : 'Review partner information before editing.'}</Text>
          </LayoutUI.Column>
        </LayoutUI.Row>
        {!isEditMode ? <Button type="button" onClick={handleEnableEdit} variant="accent" size="form"><Icons.Edit size={18} />Edit Partner</Button> : null}
      </LayoutUI.Row>

      <FormUI.FormRoot onSubmit={handleSubmit(handleValidSubmit)}>
        <CardUI.Card tone="inverse"><CardUI.CardContent padding="auth" spacing="lg">
          <LayoutUI.Row className="border-b border-black/10 pb-4" gap="gap-3">
            <Text variant="inverse" className="font-['Sora'] text-lg font-semibold">Partner Profile</Text>
          </LayoutUI.Row>

          <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormUI.FormField id="name" label="Name" error={errors.name?.message} tone="inverse"><Input id="name" {...register('name')} disabled={!isEditMode} hasError={Boolean(errors.name)} tone="inverse" className={!isEditMode ? 'cursor-default opacity-80' : undefined} /></FormUI.FormField>
            <FormUI.FormField id="kind" label="Kind" error={errors.kind?.message} tone="inverse">
              <Controller
                control={control}
                name="kind"
                render={({ field }) => (
                  <SelectUI.Select value={field.value} onValueChange={field.onChange} disabled={!isEditMode}>
                    <SelectUI.SelectTrigger appearance="admin">
                      <SelectUI.SelectValue placeholder="Select kind" />
                    </SelectUI.SelectTrigger>
                    <SelectUI.SelectContent appearance="admin">
                      {kindOptions.map((option) => (
                        <SelectUI.SelectItem key={option.value} value={option.value}>{option.label}</SelectUI.SelectItem>
                      ))}
                    </SelectUI.SelectContent>
                  </SelectUI.Select>
                )}
              />
            </FormUI.FormField>
          </LayoutUI.Container>

          <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormUI.FormField id="logo_url" label="Logo URL" error={errors.logo_url?.message} tone="inverse"><Input id="logo_url" {...register('logo_url')} disabled={!isEditMode} hasError={Boolean(errors.logo_url)} tone="inverse" className={!isEditMode ? 'cursor-default opacity-80' : undefined} /></FormUI.FormField>
            <FormUI.FormField id="website_url" label="Website URL" error={errors.website_url?.message} tone="inverse"><Input id="website_url" {...register('website_url')} disabled={!isEditMode} hasError={Boolean(errors.website_url)} tone="inverse" className={!isEditMode ? 'cursor-default opacity-80' : undefined} /></FormUI.FormField>
          </LayoutUI.Container>

          <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_120px]">
            <FormUI.FormField id="subtitle" label="Subtitle" error={errors.subtitle?.message} tone="inverse"><Input id="subtitle" {...register('subtitle')} disabled={!isEditMode} tone="inverse" className={!isEditMode ? 'cursor-default opacity-80' : undefined} /></FormUI.FormField>
            <FormUI.FormField id="priority" label="Priority" error={errors.priority?.message} tone="inverse"><Input id="priority" type="number" {...register('priority')} disabled={!isEditMode} hasError={Boolean(errors.priority)} tone="inverse" className={!isEditMode ? 'cursor-default opacity-80' : undefined} /></FormUI.FormField>
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

          <FormUI.FormField id="description" label="Description" error={errors.description?.message} tone="inverse"><Textarea id="description" {...register('description')} disabled={!isEditMode} rows={4} className={!isEditMode ? 'cursor-default opacity-80' : undefined} /></FormUI.FormField>
        </CardUI.CardContent></CardUI.Card>

        {isEditMode ? <CardUI.Card tone="inverse" border={false}><CardUI.CardContent><FormUI.FormFooter align="end" gap="md" flush><Button type="button" onClick={handleCancelEdit} variant="destructive" size="form">Cancel</Button><Button type="submit" disabled={isPending} variant="accent" size="form"><Icons.Save size={18} />{isPending ? 'Saving...' : 'Save Changes'}</Button></FormUI.FormFooter></CardUI.CardContent></CardUI.Card> : null}
      </FormUI.FormRoot>
    </LayoutUI.Column>
  );
}
