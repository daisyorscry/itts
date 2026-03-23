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
import { Textarea } from '@components/ui/textarea';
import { useCreatePMBEvaluation, useUpdatePMBEvaluation } from '@feature/pmb/hooks';
import { pmbEvaluationSchema, type PMBEvaluation, type PMBEvaluationFormData, type PMBEvaluationType } from '@feature/pmb/types';

interface EvaluationFormModalProps {
  applicationId: string;
  evaluation: PMBEvaluation | null;
  isOpen: boolean;
  onClose: () => void;
}

const evaluationTypeOptions: Array<{ value: PMBEvaluationType; label: string }> = [
  { value: 'written_test', label: 'Written Test' },
  { value: 'interview', label: 'Interview' },
  { value: 'academic_score', label: 'Academic Score' },
  { value: 'other', label: 'Other' },
];

const defaultValues: PMBEvaluationFormData = {
  evaluation_type: 'written_test',
  score: undefined,
  notes: '',
};

export function EvaluationFormModal({ applicationId, evaluation, isOpen, onClose }: EvaluationFormModalProps) {
  const isEdit = Boolean(evaluation);
  const { mutate: createEvaluation, isPending: creating } = useCreatePMBEvaluation(applicationId);
  const { mutate: updateEvaluation, isPending: updating } = useUpdatePMBEvaluation(evaluation?.id ?? '', applicationId);
  const form = useForm<PMBEvaluationFormData>({
    resolver: zodResolver(pmbEvaluationSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues,
  });
  const { handleSubmit, register, reset, setValue, watch, formState: { errors } } = form;
  const isPending = creating || updating;

  useEffect(() => {
    reset(evaluation ? {
      evaluation_type: evaluation.evaluation_type as PMBEvaluationType,
      score: evaluation.score ?? undefined,
      notes: evaluation.notes ?? '',
    } : defaultValues);
  }, [evaluation, reset]);

  const handleClose = () => {
    reset(evaluation ? {
      evaluation_type: evaluation.evaluation_type as PMBEvaluationType,
      score: evaluation.score ?? undefined,
      notes: evaluation.notes ?? '',
    } : defaultValues);
    onClose();
  };

  const onSubmit = (data: PMBEvaluationFormData) => {
    if (isEdit && evaluation) {
      updateEvaluation(data, { onSuccess: handleClose });
      return;
    }

    createEvaluation({ application_id: applicationId, ...data }, { onSuccess: handleClose });
  };

  return (
    <DialogUI.Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogUI.DialogContent className="max-w-2xl overflow-y-auto border-black/10 bg-[#F7F4EC] p-0 text-[#04090C]" style={{ maxHeight: '90vh' }}>
        <CardUI.Card tone="inverse" className="gap-0 border-0 bg-transparent">
          <CardUI.CardHeader className="pb-6">
            <LayoutUI.Column gap="gap-1">
              <DialogUI.DialogTitle className="font-['Sora'] text-xl font-bold text-[#04090C]">
                {isEdit ? 'Edit Evaluation' : 'Add Evaluation'}
              </DialogUI.DialogTitle>
              <DialogUI.DialogDescription className="text-sm text-black/60">
                Record academic review or interview results for this application.
              </DialogUI.DialogDescription>
            </LayoutUI.Column>
          </CardUI.CardHeader>

          <CardUI.CardContent spacing="lg" className="pb-6">
            <FormUI.FormRoot onSubmit={handleSubmit(onSubmit)}>
              <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormUI.FormField id="evaluation_type" label="Evaluation Type" error={errors.evaluation_type?.message} tone="inverse">
                  <SelectUI.Select
                    value={watch('evaluation_type')}
                    onValueChange={(value) => setValue('evaluation_type', value as PMBEvaluationType, { shouldDirty: true, shouldValidate: true })}
                  >
                    <SelectUI.SelectTrigger appearance="admin">
                      <SelectUI.SelectValue placeholder="Select evaluation type" />
                    </SelectUI.SelectTrigger>
                    <SelectUI.SelectContent appearance="admin">
                      {evaluationTypeOptions.map((option) => (
                        <SelectUI.SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectUI.SelectItem>
                      ))}
                    </SelectUI.SelectContent>
                  </SelectUI.Select>
                </FormUI.FormField>

                <FormUI.FormField id="score" label="Score" error={errors.score?.message} tone="inverse">
                  <Input id="score" type="number" step="0.01" {...register('score')} hasError={Boolean(errors.score)} tone="inverse" />
                </FormUI.FormField>
              </LayoutUI.Container>

              <FormUI.FormField id="notes" label="Notes" error={errors.notes?.message} tone="inverse">
                <Textarea id="notes" {...register('notes')} rows={5} />
              </FormUI.FormField>

              <FormUI.FormFooter align="end" gap="md" flush className="border-t border-black/10">
                <Button type="button" onClick={handleClose} variant="destructive" size="form">Cancel</Button>
                <Button type="submit" disabled={isPending} variant="accent" size="form">
                  <Icons.Save size={18} />
                  {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Evaluation'}
                </Button>
              </FormUI.FormFooter>
            </FormUI.FormRoot>
          </CardUI.CardContent>
        </CardUI.Card>
      </DialogUI.DialogContent>
    </DialogUI.Dialog>
  );
}
