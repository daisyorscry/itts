import * as Icons from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as FormUI from '@components/ui/form';
import * as DialogUI from '@components/ui/dialog';
import * as CardUI from '@components/ui/card';
import * as LayoutUI from '@components/ui/layout';
import { Button } from '@components/ui/button';
import { PasswordField } from '@components/ui/password-field';
import { Text } from '@components/ui/text';
import { resetPasswordSchema, type ResetPasswordFormData } from '@feature/user/types';
import { useResetPassword } from '@feature/user/hooks';
import type { User } from '@feature/user/types';

interface ResetPasswordModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

const passwordRequirements = [
  'Minimum 8 characters',
  'At least one lowercase letter',
  'At least one uppercase letter',
  'At least one number',
] as const;

export function ResetPasswordModal({ user, isOpen, onClose }: ResetPasswordModalProps) {
  const { mutate: resetPassword, isPending } = useResetPassword(user.id);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: ResetPasswordFormData) => {
    resetPassword(data, {
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
      <DialogUI.DialogContent className="max-w-lg border-black/10 bg-[#F7F4EC] p-0 text-[#04090C] sm:max-w-lg">
        <CardUI.Card tone="inverse" className="gap-0 border-0 bg-transparent">
          <CardUI.CardHeader className="pb-6">
            <LayoutUI.Row justify="between" align="start" gap="gap-4">
              <LayoutUI.Row align="center" gap="gap-3">
                <LayoutUI.Container surface="accent" radius="xl" className="flex h-11 w-11 items-center justify-center">
                  <Icons.Key className="size-5 text-[#04090C]" />
                </LayoutUI.Container>
                <LayoutUI.Column gap="gap-1">
                  <DialogUI.DialogTitle className="font-['Sora'] text-xl font-bold text-[#04090C]">
                    Reset Password
                  </DialogUI.DialogTitle>
                  <DialogUI.DialogDescription className="text-sm text-black/60">
                    Set a new password for {user.full_name}
                  </DialogUI.DialogDescription>
                </LayoutUI.Column>
              </LayoutUI.Row>
            </LayoutUI.Row>
          </CardUI.CardHeader>

          <CardUI.CardContent spacing="lg" className="pb-6">
            <CardUI.Card tone="inverse" className="border-red-500/30 bg-red-500/10">
              <CardUI.CardContent className="py-4">
                <LayoutUI.Row align="start" gap="gap-3">
                  <Icons.AlertTriangle className="mt-0.5 size-5 text-red-400" />
                  <LayoutUI.Column gap="gap-1">
                    <Text variant="inverse" className="font-medium">
                      Warning
                    </Text>
                    <Text variant="muted-inverse">
                      This will revoke all active sessions and the user will need to login again with the new password.
                    </Text>
                  </LayoutUI.Column>
                </LayoutUI.Row>
              </CardUI.CardContent>
            </CardUI.Card>

            <CardUI.Card tone="inverse">
              <CardUI.CardContent className="py-4">
                <LayoutUI.Column gap="gap-3">
                  <LayoutUI.Row justify="between" gap="gap-4">
                    <Text variant="muted-inverse">User</Text>
                    <Text variant="inverse" className="font-medium">
                      {user.full_name}
                    </Text>
                  </LayoutUI.Row>
                  <LayoutUI.Row justify="between" gap="gap-4">
                    <Text variant="muted-inverse">Email</Text>
                    <Text variant="inverse">{user.email}</Text>
                  </LayoutUI.Row>
                </LayoutUI.Column>
              </CardUI.CardContent>
            </CardUI.Card>

            <FormUI.FormRoot onSubmit={handleSubmit(onSubmit)}>
              <FormUI.FormField
                id="new_password"
                label="New Password"
                error={errors.new_password?.message}
                tone="inverse"
              >
                <PasswordField
                  id="new_password"
                  {...register('new_password')}
                  placeholder="Enter new password"
                  hasError={Boolean(errors.new_password)}
                  tone="inverse"
                />
              </FormUI.FormField>

              <LayoutUI.Column gap="gap-2">
                <Text variant="muted-inverse" size="xs">
                  Password requirements
                </Text>
                <LayoutUI.List className="list-disc pl-4 text-black/50">
                  {passwordRequirements.map((requirement) => (
                    <LayoutUI.ListItem key={requirement}>
                      <Text variant="muted-inverse" size="xs">
                        {requirement}
                      </Text>
                    </LayoutUI.ListItem>
                  ))}
                </LayoutUI.List>
              </LayoutUI.Column>

              <FormUI.FormFooter align="end" gap="md" flush className="border-t border-black/10">
                <Button type="button" onClick={handleClose} variant="ghost-inverse" size="form">
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending} variant="destructive" size="form">
                  <Icons.Key />
                  {isPending ? 'Resetting...' : 'Reset Password'}
                </Button>
              </FormUI.FormFooter>
            </FormUI.FormRoot>
          </CardUI.CardContent>
        </CardUI.Card>
      </DialogUI.DialogContent>
    </DialogUI.Dialog>
  );
}
