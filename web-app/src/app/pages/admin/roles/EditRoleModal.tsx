import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Icons from 'lucide-react';
import * as DialogUI from '@components/ui/dialog';
import * as CardUI from '@components/ui/card';
import * as FormUI from '@components/ui/form';
import * as LayoutUI from '@components/ui/layout';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Text } from '@components/ui/text';
import { Textarea } from '@components/ui/textarea';
import { updateRoleSchema, type UpdateRoleFormData, type Role } from '@feature/role/types';
import { useUpdateRole } from '@feature/role/hooks';
import { formatDate } from '@utility/date';

interface EditRoleModalProps {
  role: Role;
  isOpen: boolean;
  onClose: () => void;
}

export function EditRoleModal({ role, isOpen, onClose }: EditRoleModalProps) {
  const { mutate: updateRole, isPending } = useUpdateRole(role.id);
  const form = useForm<UpdateRoleFormData>({
    resolver: zodResolver(updateRoleSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      name: role.name,
      description: role.description,
      parent_role_id: role.parent_role_id,
    },
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = form;

  useEffect(() => {
    reset({
      name: role.name,
      description: role.description,
      parent_role_id: role.parent_role_id,
    });
  }, [reset, role]);

  const handleClose = () => {
    reset({
      name: role.name,
      description: role.description,
      parent_role_id: role.parent_role_id,
    });
    onClose();
  };

  const onSubmit = (data: UpdateRoleFormData) => {
    const payload: UpdateRoleFormData = {};

    if (data.name && data.name !== role.name) payload.name = data.name;
    if (data.description && data.description !== role.description) payload.description = data.description;
    if (data.parent_role_id !== role.parent_role_id) payload.parent_role_id = data.parent_role_id;

    if (Object.keys(payload).length === 0) {
      handleClose();
      return;
    }

    updateRole(payload, {
      onSuccess: () => {
        handleClose();
      },
    });
  };

  return (
    <DialogUI.Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          handleClose();
        }
      }}
    >
      <DialogUI.DialogContent
        className="max-w-2xl overflow-y-auto border-black/10 bg-[#F7F4EC] p-0 text-[#04090C]"
        style={{ maxHeight: '90vh' }}
      >
        <CardUI.Card tone="inverse" className="gap-0 border-0 bg-transparent">
          <CardUI.CardHeader className="pb-6">
            <LayoutUI.Row justify="between" align="start" gap="gap-4">
              <LayoutUI.Row align="center" gap="gap-3">
                <LayoutUI.Container surface="accent" radius="xl" className="flex h-11 w-11 items-center justify-center">
                  <Icons.ShieldCheck className="size-5 text-[#04090C]" />
                </LayoutUI.Container>
                <LayoutUI.Column gap="gap-1">
                  <DialogUI.DialogTitle className="font-['Sora'] text-xl font-bold text-[#04090C]">
                    Edit Role
                  </DialogUI.DialogTitle>
                  <DialogUI.DialogDescription className="text-sm text-black/60">
                    Update role details and metadata.
                  </DialogUI.DialogDescription>
                </LayoutUI.Column>
              </LayoutUI.Row>
            </LayoutUI.Row>
          </CardUI.CardHeader>

          <CardUI.CardContent spacing="lg" className="pb-6">
            <LayoutUI.Row gap="gap-4" className="grid grid-cols-1 md:grid-cols-3">
              <CardUI.Card tone="inverse">
                <CardUI.CardContent className="py-4">
                  <LayoutUI.Column gap="gap-1">
                    <Text variant="muted-inverse" size="sm">Role ID</Text>
                    <Text variant="inverse" size="xs" className="font-mono">{role.id}</Text>
                  </LayoutUI.Column>
                </CardUI.CardContent>
              </CardUI.Card>

              <CardUI.Card tone="inverse">
                <CardUI.CardContent className="py-4">
                  <LayoutUI.Column gap="gap-1">
                    <Text variant="muted-inverse" size="sm">Created At</Text>
                    <Text variant="inverse" className="font-medium">
                      {formatDate(role.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Text>
                  </LayoutUI.Column>
                </CardUI.CardContent>
              </CardUI.Card>

              <CardUI.Card tone="inverse">
                <CardUI.CardContent className="py-4">
                  <LayoutUI.Column gap="gap-1">
                    <Text variant="muted-inverse" size="sm">Permissions</Text>
                    <Text variant="inverse" className="font-medium">
                      {role.permissions?.length || 0}
                    </Text>
                  </LayoutUI.Column>
                </CardUI.CardContent>
              </CardUI.Card>
            </LayoutUI.Row>

            <CardUI.Card tone="inverse" className="border-[#29E68C]/30 bg-[#29E68C]/10">
              <CardUI.CardContent className="py-4">
                <LayoutUI.Row align="start" gap="gap-3">
                  <Icons.Info className="mt-0.5 size-5 text-[#29E68C]" />
                  <LayoutUI.Column gap="gap-1">
                    <Text variant="inverse" className="font-medium">
                      Note
                    </Text>
                    <Text variant="muted-inverse">
                      Permission assignment stays in role details. Save changes here, then reopen the role if you need to adjust access rules.
                    </Text>
                  </LayoutUI.Column>
                </LayoutUI.Row>
              </CardUI.CardContent>
            </CardUI.Card>

            <FormUI.FormRoot onSubmit={handleSubmit(onSubmit)}>
              <FormUI.FormField id="name" label="Role Name" error={errors.name?.message} tone="inverse">
                <Input
                  id="name"
                  type="text"
                  {...register('name')}
                  placeholder="e.g., content-editor"
                  icon={<Icons.Shield />}
                  hasError={Boolean(errors.name)}
                  tone="inverse"
                />
                <Text variant="muted-inverse" size="xs">
                  Use lowercase letters, numbers, and hyphens only
                </Text>
              </FormUI.FormField>

              <FormUI.FormField id="description" label="Description" error={errors.description?.message} tone="inverse">
                <Textarea
                  id="description"
                  {...register('description')}
                  rows={4}
                  className="min-h-28 rounded-xl border-black/10 bg-transparent text-[#04090C] placeholder:text-black/40 focus-visible:ring-[#29E68C]/40"
                  placeholder="Describe what this role can do..."
                />
              </FormUI.FormField>

              <FormUI.FormFooter align="end" gap="md" flush className="border-t border-black/10">
                <Button type="button" onClick={handleClose} variant="ghost-inverse" size="form">
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending || !isDirty} variant="accent" size="form">
                  <Icons.Save />
                  {isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </FormUI.FormFooter>
            </FormUI.FormRoot>
          </CardUI.CardContent>
        </CardUI.Card>
      </DialogUI.DialogContent>
    </DialogUI.Dialog>
  );
}
