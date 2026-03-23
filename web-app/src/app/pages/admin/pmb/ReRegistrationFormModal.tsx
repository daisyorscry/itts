import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Icons from 'lucide-react';
import * as CardUI from '@components/ui/card';
import * as DialogUI from '@components/ui/dialog';
import * as FormUI from '@components/ui/form';
import * as LayoutUI from '@components/ui/layout';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import * as SelectUI from '@components/ui/select';
import { useCreatePMBReRegistration, useUpdatePMBPaymentStatus } from '@feature/pmb/hooks';
import { pmbReRegistrationSchema, type PMBPaymentStatus, type PMBReRegistration, type PMBReRegistrationFormData } from '@feature/pmb/types';

interface ReRegistrationFormModalProps {
  applicationId: string;
  reRegistration: PMBReRegistration | null;
  isOpen: boolean;
  onClose: () => void;
}

const paymentOptions: Array<{ value: PMBPaymentStatus; label: string }> = [
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'paid', label: 'Paid' },
];

const defaultValues: PMBReRegistrationFormData = {
  re_registration_date: '',
  payment_status: 'unpaid',
  payment_proof: '',
};

export function ReRegistrationFormModal({ applicationId, reRegistration, isOpen, onClose }: ReRegistrationFormModalProps) {
  const isEdit = Boolean(reRegistration);
  const { mutate: createReRegistration, isPending: creating } = useCreatePMBReRegistration(applicationId);
  const { mutate: updatePaymentStatus, isPending: updating } = useUpdatePMBPaymentStatus(reRegistration?.id ?? '', applicationId);
  const form = useForm<PMBReRegistrationFormData>({
    resolver: zodResolver(pmbReRegistrationSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues,
  });
  const { handleSubmit, register, reset, setValue, watch, formState: { errors } } = form;
  const isPending = creating || updating;

  useEffect(() => {
    reset(reRegistration ? {
      re_registration_date: reRegistration.re_registration_date.slice(0, 10),
      payment_status: reRegistration.payment_status as PMBPaymentStatus,
      payment_proof: reRegistration.payment_proof ?? '',
    } : defaultValues);
  }, [reRegistration, reset]);

  const handleClose = () => {
    reset(reRegistration ? {
      re_registration_date: reRegistration.re_registration_date.slice(0, 10),
      payment_status: reRegistration.payment_status as PMBPaymentStatus,
      payment_proof: reRegistration.payment_proof ?? '',
    } : defaultValues);
    onClose();
  };

  const onSubmit = (data: PMBReRegistrationFormData) => {
    if (isEdit && reRegistration) {
      updatePaymentStatus({
        payment_status: data.payment_status,
        payment_proof: data.payment_proof || undefined,
      }, { onSuccess: handleClose });
      return;
    }

    createReRegistration({
      application_id: applicationId,
      re_registration_date: data.re_registration_date,
      payment_status: data.payment_status,
      payment_proof: data.payment_proof || undefined,
    }, { onSuccess: handleClose });
  };

  return (
    <DialogUI.Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogUI.DialogContent className="max-w-2xl overflow-y-auto border-black/10 bg-[#F7F4EC] p-0 text-[#04090C]" style={{ maxHeight: '90vh' }}>
        <CardUI.Card tone="inverse" className="gap-0 border-0 bg-transparent">
          <CardUI.CardHeader className="pb-6">
            <LayoutUI.Column gap="gap-1">
              <DialogUI.DialogTitle className="font-['Sora'] text-xl font-bold text-[#04090C]">
                {isEdit ? 'Update Payment Status' : 'Add Re-registration'}
              </DialogUI.DialogTitle>
              <DialogUI.DialogDescription className="text-sm text-black/60">
                Manage re-registration schedule and payment proof.
              </DialogUI.DialogDescription>
            </LayoutUI.Column>
          </CardUI.CardHeader>

          <CardUI.CardContent spacing="lg" className="pb-6">
            <FormUI.FormRoot onSubmit={handleSubmit(onSubmit)}>
              {!isEdit ? (
                <FormUI.FormField id="re_registration_date" label="Re-registration Date" error={errors.re_registration_date?.message} tone="inverse">
                  <Input id="re_registration_date" type="date" {...register('re_registration_date')} hasError={Boolean(errors.re_registration_date)} tone="inverse" />
                </FormUI.FormField>
              ) : null}

              <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormUI.FormField id="payment_status" label="Payment Status" error={errors.payment_status?.message} tone="inverse">
                  <SelectUI.Select
                    value={watch('payment_status')}
                    onValueChange={(value) => setValue('payment_status', value as PMBPaymentStatus, { shouldDirty: true, shouldValidate: true })}
                  >
                    <SelectUI.SelectTrigger appearance="admin">
                      <SelectUI.SelectValue placeholder="Select payment status" />
                    </SelectUI.SelectTrigger>
                    <SelectUI.SelectContent appearance="admin">
                      {paymentOptions.map((option) => (
                        <SelectUI.SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectUI.SelectItem>
                      ))}
                    </SelectUI.SelectContent>
                  </SelectUI.Select>
                </FormUI.FormField>

                <FormUI.FormField id="payment_proof" label="Payment Proof" error={errors.payment_proof?.message} tone="inverse">
                  <Input id="payment_proof" {...register('payment_proof')} hasError={Boolean(errors.payment_proof)} tone="inverse" placeholder="Receipt URL or note" />
                </FormUI.FormField>
              </LayoutUI.Container>

              <FormUI.FormFooter align="end" gap="md" flush className="border-t border-black/10">
                <Button type="button" onClick={handleClose} variant="destructive" size="form">Cancel</Button>
                <Button type="submit" disabled={isPending} variant="accent" size="form">
                  <Icons.Save size={18} />
                  {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Re-registration'}
                </Button>
              </FormUI.FormFooter>
            </FormUI.FormRoot>
          </CardUI.CardContent>
        </CardUI.Card>
      </DialogUI.DialogContent>
    </DialogUI.Dialog>
  );
}
