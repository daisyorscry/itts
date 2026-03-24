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
import { pmbStudyProgramSchema, type PMBFaculty, type PMBStudyProgram, type PMBStudyProgramFormData } from '@feature/pmb/types';
import { useCreatePMBStudyProgram, useUpdatePMBStudyProgram } from '@feature/pmb/hooks';

interface StudyProgramFormModalProps {
  program: PMBStudyProgram | null;
  faculties: PMBFaculty[];
  isOpen: boolean;
  onClose: () => void;
}

const degreeOptions = ['D3', 'S1', 'S2', 'S3'] as const;

export function StudyProgramFormModal({ program, faculties, isOpen, onClose }: StudyProgramFormModalProps) {
  const isEdit = Boolean(program);
  const { mutate: createProgram, isPending: creating } = useCreatePMBStudyProgram();
  const { mutate: updateProgram, isPending: updating } = useUpdatePMBStudyProgram(program?.id ?? '');
  const form = useForm<PMBStudyProgramFormData>({
    resolver: zodResolver(pmbStudyProgramSchema) as Resolver<PMBStudyProgramFormData>,
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      faculty_id: '',
      code: '',
      name: '',
      degree_level: 'S1',
      quota: 1,
    },
  });
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = form;
  const isPending = creating || updating;

  useEffect(() => {
    reset({
      faculty_id: program?.faculty_id ?? '',
      code: program?.code ?? '',
      name: program?.name ?? '',
      degree_level: program?.degree_level ?? 'S1',
      quota: program?.quota ?? 1,
    });
  }, [program, reset]);

  const handleClose = () => {
    reset({
      faculty_id: program?.faculty_id ?? '',
      code: program?.code ?? '',
      name: program?.name ?? '',
      degree_level: program?.degree_level ?? 'S1',
      quota: program?.quota ?? 1,
    });
    onClose();
  };

  const onSubmit = (data: PMBStudyProgramFormData) => {
    if (isEdit && program) {
      updateProgram(data, { onSuccess: handleClose });
      return;
    }

    createProgram(data, { onSuccess: handleClose });
  };

  return (
    <DialogUI.Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogUI.DialogContent className="max-w-2xl overflow-y-auto border-black/10 bg-[#F7F4EC] p-0 text-[#04090C]" style={{ maxHeight: '90vh' }}>
        <CardUI.Card tone="inverse" className="gap-0 border-0 bg-transparent">
          <CardUI.CardHeader className="pb-6">
            <LayoutUI.Column gap="gap-1">
              <DialogUI.DialogTitle className="font-['Sora'] text-xl font-bold text-[#04090C]">
                {isEdit ? 'Edit Study Program' : 'Create Study Program'}
              </DialogUI.DialogTitle>
              <DialogUI.DialogDescription className="text-sm text-black/60">
                Manage PMB study program configuration and quota.
              </DialogUI.DialogDescription>
            </LayoutUI.Column>
          </CardUI.CardHeader>

          <CardUI.CardContent spacing="lg" className="pb-6">
            <FormUI.FormRoot onSubmit={handleSubmit(onSubmit)}>
              <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormUI.FormField id="faculty_id" label="Faculty" error={errors.faculty_id?.message} tone="inverse">
                  <SelectUI.Select value={watch('faculty_id') || '__empty__'} onValueChange={(value) => setValue('faculty_id', value === '__empty__' ? '' : value, { shouldDirty: true, shouldValidate: true })}>
                    <SelectUI.SelectTrigger appearance="admin">
                      <SelectUI.SelectValue placeholder="Select faculty" />
                    </SelectUI.SelectTrigger>
                    <SelectUI.SelectContent appearance="admin">
                      <SelectUI.SelectItem value="__empty__">Select faculty</SelectUI.SelectItem>
                      {faculties.map((faculty) => (
                        <SelectUI.SelectItem key={faculty.id} value={faculty.id}>
                          {faculty.name}
                        </SelectUI.SelectItem>
                      ))}
                    </SelectUI.SelectContent>
                  </SelectUI.Select>
                </FormUI.FormField>
                <FormUI.FormField id="degree_level" label="Degree Level" error={errors.degree_level?.message} tone="inverse">
                  <SelectUI.Select value={watch('degree_level')} onValueChange={(value) => setValue('degree_level', value as 'D3' | 'S1' | 'S2' | 'S3', { shouldDirty: true, shouldValidate: true })}>
                    <SelectUI.SelectTrigger appearance="admin">
                      <SelectUI.SelectValue placeholder="Select degree level" />
                    </SelectUI.SelectTrigger>
                    <SelectUI.SelectContent appearance="admin">
                      {degreeOptions.map((degree) => (
                        <SelectUI.SelectItem key={degree} value={degree}>
                          {degree}
                        </SelectUI.SelectItem>
                      ))}
                    </SelectUI.SelectContent>
                  </SelectUI.Select>
                </FormUI.FormField>
              </LayoutUI.Container>

              <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormUI.FormField id="code" label="Program Code" error={errors.code?.message} tone="inverse">
                  <Input id="code" {...register('code')} hasError={Boolean(errors.code)} tone="inverse" />
                </FormUI.FormField>
                <FormUI.FormField id="name" label="Program Name" error={errors.name?.message} tone="inverse">
                  <Input id="name" {...register('name')} hasError={Boolean(errors.name)} tone="inverse" />
                </FormUI.FormField>
              </LayoutUI.Container>

              <FormUI.FormField id="quota" label="Quota" error={errors.quota?.message} tone="inverse">
                <Input id="quota" type="number" {...register('quota')} hasError={Boolean(errors.quota)} tone="inverse" />
              </FormUI.FormField>

              <FormUI.FormFooter align="end" gap="md" flush className="border-t border-black/10">
                <Button type="button" onClick={handleClose} variant="destructive" size="form">Cancel</Button>
                <Button type="submit" disabled={isPending} variant="accent" size="form">
                  <Icons.Save size={18} />
                  {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Program'}
                </Button>
              </FormUI.FormFooter>
            </FormUI.FormRoot>
          </CardUI.CardContent>
        </CardUI.Card>
      </DialogUI.DialogContent>
    </DialogUI.Dialog>
  );
}
