import * as Icons from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useUpdateProfile } from '@feature/auth/hooks';
import { updateProfileSchema, type UpdateProfileFormData } from '@feature/auth/types';
import { useAuthStore } from '@store/auth.store';
import { Button } from '@components/ui/button';
import * as CardUI from '@components/ui/card';
import * as FormUI from '@components/ui/form';
import { Input } from '@components/ui/input';
import * as LayoutUI from '@components/ui/layout';
import { Text } from '@components/ui/text';
import { formatDate, formatDateTime } from '@utility/date';

type ProfileField = {
  id: 'full_name' | 'email';
  label: string;
  placeholder: string;
  error?: string;
  type: 'text' | 'email';
  icon: React.ElementType;
  description?: string;
};

export function ProfileSettings() {
  const { user } = useAuthStore();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      full_name: user?.full_name ?? '',
      email: user?.email ?? '',
    },
  });

  const onSubmit = (data: UpdateProfileFormData) => {
    const payload: UpdateProfileFormData = {};

    if (data.full_name && data.full_name !== user?.full_name) {
      payload.full_name = data.full_name;
    }

    if (data.email && data.email !== user?.email) {
      payload.email = data.email;
    }

    if (Object.keys(payload).length === 0) {
      return;
    }

    updateProfile(payload, {
      onSuccess: (response) => {
        reset({
          full_name: response.data.full_name,
          email: response.data.email,
        });
      },
    });
  };

  const profileFields: ProfileField[] = [
    {
      id: 'full_name',
      label: 'Full Name',
      placeholder: 'Enter your full name',
      error: errors.full_name?.message,
      type: 'text',
      icon: Icons.User,
    },
    {
      id: 'email',
      label: 'Email Address',
      placeholder: 'Enter your email',
      error: errors.email?.message,
      type: 'email',
      icon: Icons.Mail,
      description: 'If you change your email, you may need to verify the new email address',
    },
  ];

  const accountDetails = [
    {
      label: 'Account Status',
      value: user?.is_active ? 'Active' : 'Inactive',
      tone: user?.is_active ? 'text-[#29E68C]' : 'text-red-500',
    },
    ...(user?.is_super_admin
      ? [
          {
            label: 'Role',
            value: 'Super Admin',
            tone: 'text-[#29E68C]',
          },
        ]
      : []),
    ...(user?.last_login_at
      ? [
          {
            label: 'Last Login',
            value: formatDateTime(user.last_login_at, {
              dateStyle: 'medium',
              timeStyle: 'short',
            }),
            tone: 'text-[#04090C]',
          },
        ]
      : []),
    {
      label: 'Member Since',
      value: user?.created_at
        ? formatDate(user.created_at, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
        : '-',
      tone: 'text-[#04090C]',
    },
  ] as const;

  return (
    <CardUI.Card tone="inverse" width="2xl">
      <CardUI.CardHeader>
        <CardUI.CardTitle tone="inverse">Profile Information</CardUI.CardTitle>
        <CardUI.CardDescription tone="inverse">
          Update your account profile information and email address
        </CardUI.CardDescription>
      </CardUI.CardHeader>

      <CardUI.CardContent spacing="lg">
        <FormUI.FormRoot onSubmit={handleSubmit(onSubmit)}>
          {profileFields.map((field) => (
            <FormUI.FormField
              key={field.id}
              id={field.id}
              label={field.label}
              error={field.error}
              tone="inverse"
            >
              <Input
                id={field.id}
                type={field.type}
                {...register(field.id)}
                placeholder={field.placeholder}
                icon={<field.icon />}
                hasError={Boolean(field.error)}
                tone="inverse"
              />
              {field.description ? (
                <Text variant="muted-inverse" size="xs" className="block">
                  {field.description}
                </Text>
              ) : null}
            </FormUI.FormField>
          ))}

          <CardUI.Card tone="inverse">
            <CardUI.CardContent className="py-4">
              <LayoutUI.Column gap="gap-3">
                {accountDetails.map((detail) => (
                  <LayoutUI.Row key={detail.label} justify="justify-between" className="text-sm">
                    <Text variant="muted-inverse">{detail.label}</Text>
                    <Text variant="inverse" className={detail.tone}>{detail.value}</Text>
                  </LayoutUI.Row>
                ))}
              </LayoutUI.Column>
            </CardUI.CardContent>
          </CardUI.Card>

          <FormUI.FormFooter align="end" gap="md" flush>
            {isDirty ? (
              <Button type="button" onClick={() => reset()} variant="ghost-inverse" size="form">
                Cancel
              </Button>
            ) : null}
            <Button type="submit" disabled={isPending || !isDirty} variant="accent" size="form">
              <Icons.Save size={18} />
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </FormUI.FormFooter>
        </FormUI.FormRoot>
      </CardUI.CardContent>
    </CardUI.Card>
  );
}
