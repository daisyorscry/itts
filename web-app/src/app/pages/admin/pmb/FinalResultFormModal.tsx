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
import { useCreatePMBFinalResult, useUpdatePMBFinalResult } from '@feature/pmb/hooks';
import { pmbFinalResultSchema, type PMBFinalResult, type PMBFinalResultFormData, type PMBFinalResultStatus } from '@feature/pmb/types';

interface FinalResultFormModalProps {
  applicationId: string;
  finalResult: PMBFinalResult | null;
  isOpen: boolean;
  onClose: () => void;
}

const resultOptions: Array<{ value: PMBFinalResultStatus; label: string }> = [
  { value: 'passed', label: 'Passed' },
  { value: 'failed', label: 'Failed' },
  { value: 'waiting_list', label: 'Waiting List' },
];

const defaultValues: PMBFinalResultFormData = {
  result_status: 'passed',
  final_score: undefined,
};

export function FinalResultFormModal({ applicationId, finalResult, isOpen, onClose }: FinalResultFormModalProps) {
  const isEdit = Boolean(finalResult);
  const { mutate: createFinalResult, isPending: creating } = useCreatePMBFinalResult(applicationId);
  const { mutate: updateFinalResult, isPending: updating } = useUpdatePMBFinalResult(finalResult?.id ?? '', applicationId);
  const form = useForm<PMBFinalResultFormData>({
    resolver: zodResolver(pmbFinalResultSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues,
  });
  const { handleSubmit, register, reset, setValue, watch, formState: { errors } } = form;
  const isPending = creating || updating;

  useEffect(() => {
    reset(finalResult ? {
      result_status: finalResult.result_status as PMBFinalResultStatus,
      final_score: finalResult.final_score ?? undefined,
    } : defaultValues);
  }, [finalResult, reset]);

  const handleClose = () => {
    reset(finalResult ? {
      result_status: finalResult.result_status as PMBFinalResultStatus,
      final_score: finalResult.final_score ?? undefined,
    } : defaultValues);
    onClose();
  };

  const onSubmit = (data: PMBFinalResultFormData) => {
    if (isEdit && finalResult) {
      updateFinalResult(data, { onSuccess: handleClose });
      return;
    }

    createFinalResult({ application_id: applicationId, ...data }, { onSuccess: handleClose });
  };

  return (
    <DialogUI.Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogUI.DialogContent className="max-w-2xl overflow-y-auto border-black/10 bg-[#F7F4EC] p-0 text-[#04090C]" style={{ maxHeight: '90vh' }}>
        <CardUI.Card tone="inverse" className="gap-0 border-0 bg-transparent">
          <CardUI.CardHeader className="pb-6">
            <LayoutUI.Column gap="gap-1">
              <DialogUI.DialogTitle className="font-['Sora'] text-xl font-bold text-[#04090C]">
                {isEdit ? 'Edit Final Result' : 'Add Final Result'}
              </DialogUI.DialogTitle>
              <DialogUI.DialogDescription className="text-sm text-black/60">
                Save the admission decision for this application.
              </DialogUI.DialogDescription>
            </LayoutUI.Column>
          </CardUI.CardHeader>

          <CardUI.CardContent spacing="lg" className="pb-6">
            <FormUI.FormRoot onSubmit={handleSubmit(onSubmit)}>
              <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormUI.FormField id="result_status" label="Result Status" error={errors.result_status?.message} tone="inverse">
                  <SelectUI.Select
                    value={watch('result_status')}
                    onValueChange={(value) => setValue('result_status', value as PMBFinalResultStatus, { shouldDirty: true, shouldValidate: true })}
                  >
                    <SelectUI.SelectTrigger appearance="admin">
                      <SelectUI.SelectValue placeholder="Select result status" />
                    </SelectUI.SelectTrigger>
                    <SelectUI.SelectContent appearance="admin">
                      {resultOptions.map((option) => (
                        <SelectUI.SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectUI.SelectItem>
                      ))}
                    </SelectUI.SelectContent>
                  </SelectUI.Select>
                </FormUI.FormField>

                <FormUI.FormField id="final_score" label="Final Score" error={errors.final_score?.message} tone="inverse">
                  <Input id="final_score" type="number" step="0.01" {...register('final_score')} hasError={Boolean(errors.final_score)} tone="inverse" />
                </FormUI.FormField>
              </LayoutUI.Container>

              <FormUI.FormFooter align="end" gap="md" flush className="border-t border-black/10">
                <Button type="button" onClick={handleClose} variant="destructive" size="form">Cancel</Button>
                <Button type="submit" disabled={isPending} variant="accent" size="form">
                  <Icons.Save size={18} />
                  {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Result'}
                </Button>
              </FormUI.FormFooter>
            </FormUI.FormRoot>
          </CardUI.CardContent>
        </CardUI.Card>
      </DialogUI.DialogContent>
    </DialogUI.Dialog>
  );
}
