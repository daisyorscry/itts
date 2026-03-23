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
import { pmbFacultySchema, type PMBFaculty, type PMBFacultyFormData } from '@feature/pmb/types';
import { useCreatePMBFaculty, useUpdatePMBFaculty } from '@feature/pmb/hooks';

interface FacultyFormModalProps {
  faculty: PMBFaculty | null;
  isOpen: boolean;
  onClose: () => void;
}

export function FacultyFormModal({ faculty, isOpen, onClose }: FacultyFormModalProps) {
  const isEdit = Boolean(faculty);
  const { mutate: createFaculty, isPending: creating } = useCreatePMBFaculty();
  const { mutate: updateFaculty, isPending: updating } = useUpdatePMBFaculty(faculty?.id ?? '');
  const form = useForm<PMBFacultyFormData>({
    resolver: zodResolver(pmbFacultySchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      code: '',
      name: '',
    },
  });
  const { register, handleSubmit, reset, formState: { errors } } = form;
  const isPending = creating || updating;

  useEffect(() => {
    reset({
      code: faculty?.code ?? '',
      name: faculty?.name ?? '',
    });
  }, [faculty, reset]);

  const handleClose = () => {
    reset({
      code: faculty?.code ?? '',
      name: faculty?.name ?? '',
    });
    onClose();
  };

  const onSubmit = (data: PMBFacultyFormData) => {
    if (isEdit && faculty) {
      updateFaculty(data, { onSuccess: handleClose });
      return;
    }

    createFaculty(data, { onSuccess: handleClose });
  };

  return (
    <DialogUI.Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogUI.DialogContent className="max-w-2xl overflow-y-auto border-black/10 bg-[#F7F4EC] p-0 text-[#04090C]" style={{ maxHeight: '90vh' }}>
        <CardUI.Card tone="inverse" className="gap-0 border-0 bg-transparent">
          <CardUI.CardHeader className="pb-6">
            <LayoutUI.Column gap="gap-1">
              <DialogUI.DialogTitle className="font-['Sora'] text-xl font-bold text-[#04090C]">
                {isEdit ? 'Edit Faculty' : 'Create Faculty'}
              </DialogUI.DialogTitle>
              <DialogUI.DialogDescription className="text-sm text-black/60">
                Manage faculty master data for PMB.
              </DialogUI.DialogDescription>
            </LayoutUI.Column>
          </CardUI.CardHeader>

          <CardUI.CardContent spacing="lg" className="pb-6">
            <FormUI.FormRoot onSubmit={handleSubmit(onSubmit)}>
              <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormUI.FormField id="code" label="Faculty Code" error={errors.code?.message} tone="inverse">
                  <Input id="code" {...register('code')} hasError={Boolean(errors.code)} tone="inverse" />
                </FormUI.FormField>
                <FormUI.FormField id="name" label="Faculty Name" error={errors.name?.message} tone="inverse">
                  <Input id="name" {...register('name')} hasError={Boolean(errors.name)} tone="inverse" />
                </FormUI.FormField>
              </LayoutUI.Container>

              <FormUI.FormFooter align="end" gap="md" flush className="border-t border-black/10">
                <Button type="button" onClick={handleClose} variant="destructive" size="form">Cancel</Button>
                <Button type="submit" disabled={isPending} variant="accent" size="form">
                  <Icons.Save size={18} />
                  {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Faculty'}
                </Button>
              </FormUI.FormFooter>
            </FormUI.FormRoot>
          </CardUI.CardContent>
        </CardUI.Card>
      </DialogUI.DialogContent>
    </DialogUI.Dialog>
  );
}
