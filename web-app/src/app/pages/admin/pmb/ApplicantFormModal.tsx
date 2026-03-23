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
import { pmbApplicantSchema, type PMBApplicant, type PMBApplicantFormData } from '@feature/pmb/types';
import { useCreatePMBApplicant, useUpdatePMBApplicant } from '@feature/pmb/hooks';

interface ApplicantFormModalProps {
  applicant: PMBApplicant | null;
  isOpen: boolean;
  onClose: () => void;
}

const genderOptions = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
] as const;

export function ApplicantFormModal({ applicant, isOpen, onClose }: ApplicantFormModalProps) {
  const isEdit = Boolean(applicant);
  const { mutate: createApplicant, isPending: creating } = useCreatePMBApplicant();
  const { mutate: updateApplicant, isPending: updating } = useUpdatePMBApplicant(applicant?.id ?? '');
  const form = useForm<PMBApplicantFormData>({
    resolver: zodResolver(pmbApplicantSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      user_id: '',
      full_name: '',
      national_id: '',
      place_of_birth: '',
      date_of_birth: '',
      gender: 'male',
      address: '',
      phone_number: '',
      school_origin: '',
      graduation_year: '',
    },
  });
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = form;
  const isPending = creating || updating;

  useEffect(() => {
    reset({
      user_id: applicant?.user_id ?? '',
      full_name: applicant?.full_name ?? '',
      national_id: applicant?.national_id ?? '',
      place_of_birth: applicant?.place_of_birth ?? '',
      date_of_birth: applicant?.date_of_birth ? applicant.date_of_birth.slice(0, 10) : '',
      gender: (applicant?.gender as 'male' | 'female') ?? 'male',
      address: applicant?.address ?? '',
      phone_number: applicant?.phone_number ?? '',
      school_origin: applicant?.school_origin ?? '',
      graduation_year: applicant?.graduation_year ?? '',
    });
  }, [applicant, reset]);

  const handleClose = () => {
    reset({
      user_id: applicant?.user_id ?? '',
      full_name: applicant?.full_name ?? '',
      national_id: applicant?.national_id ?? '',
      place_of_birth: applicant?.place_of_birth ?? '',
      date_of_birth: applicant?.date_of_birth ? applicant.date_of_birth.slice(0, 10) : '',
      gender: (applicant?.gender as 'male' | 'female') ?? 'male',
      address: applicant?.address ?? '',
      phone_number: applicant?.phone_number ?? '',
      school_origin: applicant?.school_origin ?? '',
      graduation_year: applicant?.graduation_year ?? '',
    });
    onClose();
  };

  const onSubmit = (data: PMBApplicantFormData) => {
    if (isEdit && applicant) {
      updateApplicant({
        full_name: data.full_name,
        place_of_birth: data.place_of_birth,
        date_of_birth: data.date_of_birth,
        gender: data.gender,
        address: data.address,
        phone_number: data.phone_number,
        school_origin: data.school_origin,
        graduation_year: data.graduation_year,
      }, { onSuccess: handleClose });
      return;
    }

    createApplicant(data, { onSuccess: handleClose });
  };

  return (
    <DialogUI.Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogUI.DialogContent className="max-w-4xl overflow-y-auto border-black/10 bg-[#F7F4EC] p-0 text-[#04090C]" style={{ maxHeight: '90vh' }}>
        <CardUI.Card tone="inverse" className="gap-0 border-0 bg-transparent">
          <CardUI.CardHeader className="pb-6">
            <LayoutUI.Column gap="gap-1">
              <DialogUI.DialogTitle className="font-['Sora'] text-xl font-bold text-[#04090C]">
                {isEdit ? 'Edit Applicant' : 'Create Applicant'}
              </DialogUI.DialogTitle>
              <DialogUI.DialogDescription className="text-sm text-black/60">
                Manage PMB applicant biodata and academic background.
              </DialogUI.DialogDescription>
            </LayoutUI.Column>
          </CardUI.CardHeader>

          <CardUI.CardContent spacing="lg" className="pb-6">
            <FormUI.FormRoot onSubmit={handleSubmit(onSubmit)}>
              <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormUI.FormField id="user_id" label="User ID" error={errors.user_id?.message} tone="inverse">
                  <Input id="user_id" {...register('user_id')} hasError={Boolean(errors.user_id)} tone="inverse" readOnly={isEdit} className={isEdit ? 'cursor-default opacity-80' : undefined} />
                </FormUI.FormField>
                <FormUI.FormField id="national_id" label="National ID" error={errors.national_id?.message} tone="inverse">
                  <Input id="national_id" {...register('national_id')} hasError={Boolean(errors.national_id)} tone="inverse" readOnly={isEdit} className={isEdit ? 'cursor-default opacity-80' : undefined} />
                </FormUI.FormField>
              </LayoutUI.Container>

              <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormUI.FormField id="full_name" label="Full Name" error={errors.full_name?.message} tone="inverse">
                  <Input id="full_name" {...register('full_name')} hasError={Boolean(errors.full_name)} tone="inverse" />
                </FormUI.FormField>
                <FormUI.FormField id="phone_number" label="Phone Number" error={errors.phone_number?.message} tone="inverse">
                  <Input id="phone_number" {...register('phone_number')} hasError={Boolean(errors.phone_number)} tone="inverse" />
                </FormUI.FormField>
              </LayoutUI.Container>

              <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <FormUI.FormField id="place_of_birth" label="Place of Birth" error={errors.place_of_birth?.message} tone="inverse">
                  <Input id="place_of_birth" {...register('place_of_birth')} hasError={Boolean(errors.place_of_birth)} tone="inverse" />
                </FormUI.FormField>
                <FormUI.FormField id="date_of_birth" label="Date of Birth" error={errors.date_of_birth?.message} tone="inverse">
                  <Input id="date_of_birth" type="date" {...register('date_of_birth')} hasError={Boolean(errors.date_of_birth)} tone="inverse" />
                </FormUI.FormField>
                <FormUI.FormField id="gender" label="Gender" error={errors.gender?.message} tone="inverse">
                  <SelectUI.Select value={watch('gender')} onValueChange={(value) => setValue('gender', value as 'male' | 'female', { shouldDirty: true, shouldValidate: true })}>
                    <SelectUI.SelectTrigger appearance="admin">
                      <SelectUI.SelectValue placeholder="Select gender" />
                    </SelectUI.SelectTrigger>
                    <SelectUI.SelectContent appearance="admin">
                      {genderOptions.map((option) => (
                        <SelectUI.SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectUI.SelectItem>
                      ))}
                    </SelectUI.SelectContent>
                  </SelectUI.Select>
                </FormUI.FormField>
              </LayoutUI.Container>

              <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormUI.FormField id="school_origin" label="School Origin" error={errors.school_origin?.message} tone="inverse">
                  <Input id="school_origin" {...register('school_origin')} hasError={Boolean(errors.school_origin)} tone="inverse" />
                </FormUI.FormField>
                <FormUI.FormField id="graduation_year" label="Graduation Year" error={errors.graduation_year?.message} tone="inverse">
                  <Input id="graduation_year" {...register('graduation_year')} hasError={Boolean(errors.graduation_year)} tone="inverse" />
                </FormUI.FormField>
              </LayoutUI.Container>

              <FormUI.FormField id="address" label="Address" error={errors.address?.message} tone="inverse">
                <Input id="address" {...register('address')} hasError={Boolean(errors.address)} tone="inverse" />
              </FormUI.FormField>

              <FormUI.FormFooter align="end" gap="md" flush className="border-t border-black/10">
                <Button type="button" onClick={handleClose} variant="destructive" size="form">Cancel</Button>
                <Button type="submit" disabled={isPending} variant="accent" size="form">
                  <Icons.Save size={18} />
                  {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Applicant'}
                </Button>
              </FormUI.FormFooter>
            </FormUI.FormRoot>
          </CardUI.CardContent>
        </CardUI.Card>
      </DialogUI.DialogContent>
    </DialogUI.Dialog>
  );
}
