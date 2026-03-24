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
import { useCreatePMBApplication, useUpdatePMBApplication } from '@feature/pmb/hooks';
import {
  pmbApplicationSchema,
  type PMBAdmissionTrack,
  type PMBApplicant,
  type PMBApplication,
  type PMBApplicationFormData,
  type PMBApplicationStatus,
  type PMBStudyProgram,
} from '@feature/pmb/types';

interface ApplicationFormModalProps {
  application: PMBApplication | null;
  applicants: PMBApplicant[];
  tracks: PMBAdmissionTrack[];
  programs: PMBStudyProgram[];
  isOpen: boolean;
  onClose: () => void;
}

const statusOptions: Array<{ value: PMBApplicationStatus; label: string }> = [
  { value: 'draft', label: 'Draft' },
  { value: 'verified', label: 'Verified' },
  { value: 'passed', label: 'Passed' },
  { value: 'failed', label: 'Failed' },
  { value: 're_registered', label: 'Re-registered' },
];

const defaultValues: PMBApplicationFormData = {
  applicant_id: '',
  track_id: '',
  program_id: '',
  academic_year: '',
  status: 'draft',
};

export function ApplicationFormModal({
  application,
  applicants,
  tracks,
  programs,
  isOpen,
  onClose,
}: ApplicationFormModalProps) {
  const isEdit = Boolean(application);
  const { mutate: createApplication, isPending: creating } = useCreatePMBApplication();
  const { mutate: updateApplication, isPending: updating } = useUpdatePMBApplication(application?.id ?? '');
  const form = useForm<PMBApplicationFormData>({
    resolver: zodResolver(pmbApplicationSchema) as Resolver<PMBApplicationFormData>,
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues,
  });
  const { handleSubmit, reset, setValue, watch, formState: { errors } } = form;
  const isPending = creating || updating;

  useEffect(() => {
    reset(application ? {
      applicant_id: application.applicant_id,
      track_id: application.track_id,
      program_id: application.program_id,
      academic_year: application.academic_year,
      status: application.status,
    } : defaultValues);
  }, [application, reset]);

  const handleClose = () => {
    reset(application ? {
      applicant_id: application.applicant_id,
      track_id: application.track_id,
      program_id: application.program_id,
      academic_year: application.academic_year,
      status: application.status,
    } : defaultValues);
    onClose();
  };

  const onSubmit = (data: PMBApplicationFormData) => {
    if (isEdit && application) {
      updateApplication(data, { onSuccess: handleClose });
      return;
    }

    createApplication(data, { onSuccess: handleClose });
  };

  return (
    <DialogUI.Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogUI.DialogContent className="max-w-3xl overflow-y-auto border-black/10 bg-[#F7F4EC] p-0 text-[#04090C]" style={{ maxHeight: '90vh' }}>
        <CardUI.Card tone="inverse" className="gap-0 border-0 bg-transparent">
          <CardUI.CardHeader className="pb-6">
            <LayoutUI.Column gap="gap-1">
              <DialogUI.DialogTitle className="font-['Sora'] text-xl font-bold text-[#04090C]">
                {isEdit ? 'Edit Application' : 'Create Application'}
              </DialogUI.DialogTitle>
              <DialogUI.DialogDescription className="text-sm text-black/60">
                Manage PMB application assignment, program selection, and status.
              </DialogUI.DialogDescription>
            </LayoutUI.Column>
          </CardUI.CardHeader>

          <CardUI.CardContent spacing="lg" className="pb-6">
            <FormUI.FormRoot onSubmit={handleSubmit(onSubmit)}>
              <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormUI.FormField id="applicant_id" label="Applicant" error={errors.applicant_id?.message} tone="inverse">
                  <SelectUI.Select
                    value={watch('applicant_id') || '__empty__'}
                    onValueChange={(value) => setValue('applicant_id', value === '__empty__' ? '' : value, { shouldDirty: true, shouldValidate: true })}
                  >
                    <SelectUI.SelectTrigger appearance="admin">
                      <SelectUI.SelectValue placeholder="Select applicant" />
                    </SelectUI.SelectTrigger>
                    <SelectUI.SelectContent appearance="admin">
                      <SelectUI.SelectItem value="__empty__">Select applicant</SelectUI.SelectItem>
                      {applicants.map((applicant) => (
                        <SelectUI.SelectItem key={applicant.id} value={applicant.id}>
                          {applicant.full_name}
                        </SelectUI.SelectItem>
                      ))}
                    </SelectUI.SelectContent>
                  </SelectUI.Select>
                </FormUI.FormField>

                <FormUI.FormField id="status" label="Status" error={errors.status?.message} tone="inverse">
                  <SelectUI.Select
                    value={watch('status')}
                    onValueChange={(value) => setValue('status', value as PMBApplicationStatus, { shouldDirty: true, shouldValidate: true })}
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
                </FormUI.FormField>
              </LayoutUI.Container>

              <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormUI.FormField id="track_id" label="Admission Track" error={errors.track_id?.message} tone="inverse">
                  <SelectUI.Select
                    value={watch('track_id') || '__empty__'}
                    onValueChange={(value) => setValue('track_id', value === '__empty__' ? '' : value, { shouldDirty: true, shouldValidate: true })}
                  >
                    <SelectUI.SelectTrigger appearance="admin">
                      <SelectUI.SelectValue placeholder="Select track" />
                    </SelectUI.SelectTrigger>
                    <SelectUI.SelectContent appearance="admin">
                      <SelectUI.SelectItem value="__empty__">Select track</SelectUI.SelectItem>
                      {tracks.map((track) => (
                        <SelectUI.SelectItem key={track.id} value={track.id}>
                          {track.track_name}
                        </SelectUI.SelectItem>
                      ))}
                    </SelectUI.SelectContent>
                  </SelectUI.Select>
                </FormUI.FormField>

                <FormUI.FormField id="program_id" label="Study Program" error={errors.program_id?.message} tone="inverse">
                  <SelectUI.Select
                    value={watch('program_id') || '__empty__'}
                    onValueChange={(value) => setValue('program_id', value === '__empty__' ? '' : value, { shouldDirty: true, shouldValidate: true })}
                  >
                    <SelectUI.SelectTrigger appearance="admin">
                      <SelectUI.SelectValue placeholder="Select study program" />
                    </SelectUI.SelectTrigger>
                    <SelectUI.SelectContent appearance="admin">
                      <SelectUI.SelectItem value="__empty__">Select study program</SelectUI.SelectItem>
                      {programs.map((program) => (
                        <SelectUI.SelectItem key={program.id} value={program.id}>
                          {program.name}
                        </SelectUI.SelectItem>
                      ))}
                    </SelectUI.SelectContent>
                  </SelectUI.Select>
                </FormUI.FormField>
              </LayoutUI.Container>

              <FormUI.FormField id="academic_year" label="Academic Year" error={errors.academic_year?.message} tone="inverse">
                <Input
                  id="academic_year"
                  value={watch('academic_year')}
                  onChange={(event) => setValue('academic_year', event.target.value, { shouldDirty: true, shouldValidate: true })}
                  placeholder="2026/2027"
                  hasError={Boolean(errors.academic_year)}
                  tone="inverse"
                />
              </FormUI.FormField>

              <FormUI.FormFooter align="end" gap="md" flush className="border-t border-black/10">
                <Button type="button" onClick={handleClose} variant="destructive" size="form">Cancel</Button>
                <Button type="submit" disabled={isPending} variant="accent" size="form">
                  <Icons.Save size={18} />
                  {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Application'}
                </Button>
              </FormUI.FormFooter>
            </FormUI.FormRoot>
          </CardUI.CardContent>
        </CardUI.Card>
      </DialogUI.DialogContent>
    </DialogUI.Dialog>
  );
}
