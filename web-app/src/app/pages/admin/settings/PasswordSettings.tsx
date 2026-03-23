import * as Icons from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { changePasswordSchema, type ChangePasswordFormData } from '@feature/auth/types';
import { useChangePassword } from '@feature/auth/hooks';
import { Button } from '@components/ui/button';
import * as CardUI from '@components/ui/card';
import * as LayoutUI from '@components/ui/layout';
import * as FormUI from '@components/ui/form';
import { PasswordField } from '@components/ui/password-field';
import { Text } from '@components/ui/text';

const passwordRequirements = [
  'Minimum 8 characters',
  'At least one lowercase letter',
  'At least one uppercase letter',
  'At least one number',
] as const;

export function PasswordSettings() {
  const { mutate: changePassword, isPending } = useChangePassword();
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      old_password: '',
      new_password: '',
      confirm_password: '',
    },
  });

  const onSubmit = (data: ChangePasswordFormData) => {
    changePassword(
      {
        old_password: data.old_password,
        new_password: data.new_password,
      },
      {
        onSuccess: () => {
          reset();
        },
      }
    );
  };

  const passwordFields = [
    {
      id: 'old_password',
      label: 'Current Password',
      placeholder: 'Enter your current password',
      error: errors.old_password?.message,
    },
    {
      id: 'new_password',
      label: 'New Password',
      placeholder: 'Enter your new password',
      error: errors.new_password?.message,
    },
    {
      id: 'confirm_password',
      label: 'Confirm New Password',
      placeholder: 'Confirm your new password',
      error: errors.confirm_password?.message,
    },
  ] as const;

  return (
    <CardUI.Card tone="inverse" width="2xl">
      <CardUI.CardHeader>
        <CardUI.CardTitle tone="inverse">Change Password</CardUI.CardTitle>
        <CardUI.CardDescription tone="inverse">
          Ensure your account is using a long, random password to stay secure
        </CardUI.CardDescription>
      </CardUI.CardHeader>

      <CardUI.CardContent spacing="lg">
        <CardUI.Card tone="inverse" className="border-[#29E68C]/30 bg-[#29E68C]/10">
          <CardUI.CardContent className="py-4">
            <LayoutUI.Row align="start" gap="gap-3">
              <Icons.AlertCircle className="mt-0.5 size-5 text-[#29E68C]" />
              <LayoutUI.Column gap="gap-2">
                <Text variant="inverse" className="font-medium">
                  Password Requirements
                </Text>
                <LayoutUI.List>
                  {passwordRequirements.map((requirement) => (
                    <LayoutUI.ListItem key={requirement}>
                      <Text variant="muted-inverse" size="sm">{requirement}</Text>
                    </LayoutUI.ListItem>
                  ))}
                </LayoutUI.List>
              </LayoutUI.Column>
            </LayoutUI.Row>
          </CardUI.CardContent>
        </CardUI.Card>

        <FormUI.FormRoot onSubmit={handleSubmit(onSubmit)}>
          {passwordFields.map((field) => (
            <FormUI.FormField
              key={field.id}
              id={field.id}
              label={field.label}
              error={field.error}
              tone="inverse"
            >
              <PasswordField
                id={field.id}
                {...register(field.id)}
                placeholder={field.placeholder}
                hasError={Boolean(field.error)}
                tone="inverse"
              />
            </FormUI.FormField>
          ))}

          <FormUI.FormFooter align="end" gap="md" flush>
            {isDirty ? (
              <Button type="button" onClick={() => reset()} variant="ghost-inverse" size="form">
                Clear
              </Button>
            ) : null}
            <Button type="submit" disabled={isPending || !isDirty} variant="accent" size="form">
              <Icons.Lock size={18} />
              {isPending ? 'Updating...' : 'Update Password'}
            </Button>
          </FormUI.FormFooter>
        </FormUI.FormRoot>
      </CardUI.CardContent>
    </CardUI.Card>
  );
}
