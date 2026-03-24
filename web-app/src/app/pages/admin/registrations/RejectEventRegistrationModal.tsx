import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as Icons from 'lucide-react';
import * as CardUI from '@components/ui/card';
import * as DialogUI from '@components/ui/dialog';
import * as FormUI from '@components/ui/form';
import * as LayoutUI from '@components/ui/layout';
import { Button } from '@components/ui/button';
import { Textarea } from '@components/ui/textarea';
import { useRejectEventRegistration } from '@feature/event/hooks';
import {
  rejectEventRegistrationSchema,
  type EventRegistration,
  type RejectEventRegistrationFormData,
} from '@feature/event/types';

interface RejectEventRegistrationModalProps {
  registration: EventRegistration | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RejectEventRegistrationModal({
  registration,
  isOpen,
  onClose,
}: RejectEventRegistrationModalProps) {
  const { mutate: rejectEventRegistration, isPending } = useRejectEventRegistration();
  const form = useForm<RejectEventRegistrationFormData>({
    resolver: zodResolver(rejectEventRegistrationSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      reason: '',
    },
  });
  const { register, handleSubmit, reset, formState: { errors } } = form;

  useEffect(() => {
    if (!isOpen) {
      reset({ reason: '' });
    }
  }, [isOpen, reset]);

  return (
    <DialogUI.Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogUI.DialogContent className="max-w-xl border-black/10 bg-[#F7F4EC] p-0 text-[#04090C]">
        <CardUI.Card tone="inverse" className="gap-0 border-0 bg-transparent">
          <CardUI.CardHeader className="pb-6">
            <LayoutUI.Row align="items-start" gap="gap-3">
              <LayoutUI.Container surface="accent" radius="xl" className="flex h-11 w-11 items-center justify-center">
                <Icons.XCircle className="size-5 text-[#04090C]" />
              </LayoutUI.Container>
              <LayoutUI.Column gap="gap-1">
                <DialogUI.DialogTitle className="font-['Sora'] text-xl font-bold text-[#04090C]">
                  Reject Event Registration
                </DialogUI.DialogTitle>
                <DialogUI.DialogDescription className="text-sm text-black/60">
                  Provide a reason for rejecting {registration?.full_name ?? 'this registration'}.
                </DialogUI.DialogDescription>
              </LayoutUI.Column>
            </LayoutUI.Row>
          </CardUI.CardHeader>

          <CardUI.CardContent spacing="lg" className="pb-6">
            <FormUI.FormRoot
              onSubmit={handleSubmit((data) => {
                if (!registration) {
                  return;
                }

                rejectEventRegistration(
                  { id: registration.id, payload: data },
                  {
                    onSuccess: () => {
                      reset({ reason: '' });
                      onClose();
                    },
                  },
                );
              })}
            >
              <FormUI.FormField id="reason" label="Reason" error={errors.reason?.message} tone="inverse">
                <Textarea
                  id="reason"
                  {...register('reason')}
                  rows={5}
                  className="rounded-xl border-black/10 bg-transparent text-[#04090C]"
                />
              </FormUI.FormField>

              <FormUI.FormFooter align="end" gap="md" flush className="border-t border-black/10">
                <Button type="button" onClick={onClose} variant="ghost-inverse" size="form">
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending || !registration} variant="destructive" size="form">
                  <Icons.XCircle />
                  {isPending ? 'Rejecting...' : 'Reject Registration'}
                </Button>
              </FormUI.FormFooter>
            </FormUI.FormRoot>
          </CardUI.CardContent>
        </CardUI.Card>
      </DialogUI.DialogContent>
    </DialogUI.Dialog>
  );
}
