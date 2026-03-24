import { useEffect } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Icons from 'lucide-react';
import * as CardUI from '@components/ui/card';
import * as DialogUI from '@components/ui/dialog';
import * as FormUI from '@components/ui/form';
import * as LayoutUI from '@components/ui/layout';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import * as SelectUI from '@components/ui/select';
import { pmbTrackSchema, type PMBAdmissionTrack, type PMBTrackFormData } from '@feature/pmb/types';
import { useCreatePMBAdmissionTrack, useUpdatePMBAdmissionTrack } from '@feature/pmb/hooks';

interface TrackFormModalProps {
  track: PMBAdmissionTrack | null;
  isOpen: boolean;
  onClose: () => void;
}

const statusOptions = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
] as const;

const testOptions = [
  { value: 'true', label: 'Required' },
  { value: 'false', label: 'No test' },
] as const;

export function TrackFormModal({ track, isOpen, onClose }: TrackFormModalProps) {
  const isEdit = Boolean(track);
  const { mutate: createTrack, isPending: creating } = useCreatePMBAdmissionTrack();
  const { mutate: updateTrack, isPending: updating } = useUpdatePMBAdmissionTrack(track?.id ?? '');
  const form = useForm<PMBTrackFormData>({
    resolver: zodResolver(pmbTrackSchema) as Resolver<PMBTrackFormData>,
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      track_code: '',
      track_name: '',
      requires_test: false,
      is_active: true,
    },
  });
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = form;
  const isPending = creating || updating;

  useEffect(() => {
    reset({
      track_code: track?.track_code ?? '',
      track_name: track?.track_name ?? '',
      requires_test: track?.requires_test ?? false,
      is_active: track?.is_active ?? true,
    });
  }, [reset, track]);

  const handleClose = () => {
    reset({
      track_code: track?.track_code ?? '',
      track_name: track?.track_name ?? '',
      requires_test: track?.requires_test ?? false,
      is_active: track?.is_active ?? true,
    });
    onClose();
  };

  const onSubmit = (data: PMBTrackFormData) => {
    if (isEdit && track) {
      updateTrack(data, { onSuccess: handleClose });
      return;
    }

    createTrack(data, { onSuccess: handleClose });
  };

  return (
    <DialogUI.Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogUI.DialogContent className="max-w-2xl overflow-y-auto border-black/10 bg-[#F7F4EC] p-0 text-[#04090C]" style={{ maxHeight: '90vh' }}>
        <CardUI.Card tone="inverse" className="gap-0 border-0 bg-transparent">
          <CardUI.CardHeader className="pb-6">
            <LayoutUI.Column gap="gap-1">
              <DialogUI.DialogTitle className="font-['Sora'] text-xl font-bold text-[#04090C]">
                {isEdit ? 'Edit Track' : 'Create Track'}
              </DialogUI.DialogTitle>
              <DialogUI.DialogDescription className="text-sm text-black/60">
                Manage PMB admission track settings.
              </DialogUI.DialogDescription>
            </LayoutUI.Column>
          </CardUI.CardHeader>

          <CardUI.CardContent spacing="lg" className="pb-6">
            <FormUI.FormRoot onSubmit={handleSubmit(onSubmit)}>
              <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormUI.FormField id="track_code" label="Track Code" error={errors.track_code?.message} tone="inverse">
                  <Input id="track_code" {...register('track_code')} hasError={Boolean(errors.track_code)} tone="inverse" />
                </FormUI.FormField>
                <FormUI.FormField id="track_name" label="Track Name" error={errors.track_name?.message} tone="inverse">
                  <Input id="track_name" {...register('track_name')} hasError={Boolean(errors.track_name)} tone="inverse" />
                </FormUI.FormField>
              </LayoutUI.Container>

              <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormUI.FormField id="requires_test" label="Test Requirement" error={errors.requires_test?.message} tone="inverse">
                  <SelectUI.Select value={String(watch('requires_test'))} onValueChange={(value) => setValue('requires_test', value === 'true', { shouldDirty: true, shouldValidate: true })}>
                    <SelectUI.SelectTrigger appearance="admin">
                      <SelectUI.SelectValue placeholder="Select test requirement" />
                    </SelectUI.SelectTrigger>
                    <SelectUI.SelectContent appearance="admin">
                      {testOptions.map((option) => (
                        <SelectUI.SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectUI.SelectItem>
                      ))}
                    </SelectUI.SelectContent>
                  </SelectUI.Select>
                </FormUI.FormField>
                <FormUI.FormField id="is_active" label="Status" error={errors.is_active?.message} tone="inverse">
                  <SelectUI.Select value={String(watch('is_active'))} onValueChange={(value) => setValue('is_active', value === 'true', { shouldDirty: true, shouldValidate: true })}>
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
                </FormUI.FormField>
              </LayoutUI.Container>

              <FormUI.FormFooter align="end" gap="md" flush className="border-t border-black/10">
                <Button type="button" onClick={handleClose} variant="destructive" size="form">Cancel</Button>
                <Button type="submit" disabled={isPending} variant="accent" size="form">
                  <Icons.Save size={18} />
                  {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Track'}
                </Button>
              </FormUI.FormFooter>
            </FormUI.FormRoot>
          </CardUI.CardContent>
        </CardUI.Card>
      </DialogUI.DialogContent>
    </DialogUI.Dialog>
  );
}
