import * as Icons from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { useListRoles } from '@feature/role/hooks';
import { useCreateUser } from '@feature/user/hooks';
import { createUserSchema, type CreateUserFormData } from '@feature/user/types';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import * as CardUI from '@components/ui/card';
import { Checkbox } from '@components/ui/checkbox';
import * as FormUI from '@components/ui/form';
import { Input } from '@components/ui/input';
import * as LayoutUI from '@components/ui/layout';
import { PasswordField } from '@components/ui/password-field';
import { Text } from '@components/ui/text';

export function AdminUserCreate() {
  const navigate = useNavigate();
  const { mutate: createUser, isPending } = useCreateUser();
  const { data: rolesData } = useListRoles({ page_size: 100 });
  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      is_active: true,
      is_super_admin: false,
      role_ids: [],
    },
  });
  const { register, setValue, watch, handleSubmit, formState } = form;
  const { errors } = formState;
  const isActive = Boolean(watch('is_active'));
  const isSuperAdmin = Boolean(watch('is_super_admin'));
  const selectedRoleIds = watch('role_ids') ?? [];
  const roles = rolesData?.data ?? [];

  return (
    <LayoutUI.Column gap="gap-6">
      <LayoutUI.Row justify="justify-between" align="items-start" className="max-md:flex-col max-md:gap-4">
        <LayoutUI.Row gap="gap-4">
          <Button type="button" onClick={() => navigate('/admin/users')} variant="ghost-inverse" size="icon" className="rounded-xl border border-white/10 bg-white/5">
            <Icons.ArrowLeft size={20} />
          </Button>
          <LayoutUI.Column gap="gap-2">
            <Text as="h1" variant="inverse" className="font-['Sora'] text-3xl font-bold">
              Create New User
            </Text>
            <Text variant="muted-inverse">Add a new user to the system</Text>
          </LayoutUI.Column>
        </LayoutUI.Row>
      </LayoutUI.Row>

      <FormUI.FormRoot
        onSubmit={handleSubmit((data) =>
          createUser(data, {
            onSuccess: () => {
              navigate('/admin/users');
            },
          })
        )}
      >
        <CardUI.Card tone="inverse">
          <CardUI.CardContent padding="auth" spacing="lg">
            <LayoutUI.Row className="border-b border-white/10 pb-4" gap="gap-3">
              <LayoutUI.Container surface="accent" radius="xl" className="flex h-10 w-10 items-center justify-center">
                <Icons.UserPlus className="text-[#29E68C]" size={20} />
              </LayoutUI.Container>
              <Text variant="inverse" className="font-['Sora'] text-lg font-semibold">
                Basic Information
              </Text>
            </LayoutUI.Row>

            <FormUI.FormField id="full_name" label="Full Name *" error={errors.full_name?.message} tone="inverse">
              <Input id="full_name" type="text" {...register('full_name')} placeholder="e.g., John Doe" icon={<Icons.User />} hasError={Boolean(errors.full_name)} tone="inverse" />
            </FormUI.FormField>

            <FormUI.FormField id="email" label="Email Address *" error={errors.email?.message} tone="inverse">
              <Input id="email" type="email" {...register('email')} placeholder="e.g., john@example.com" icon={<Icons.Mail />} hasError={Boolean(errors.email)} tone="inverse" />
            </FormUI.FormField>

            <FormUI.FormField id="password" label="Password *" error={errors.password?.message} tone="inverse">
              <PasswordField id="password" {...register('password')} placeholder="Enter password" hasError={Boolean(errors.password)} tone="inverse" />
              <Text className="block" variant="muted-inverse" size="xs">
                Min 8 characters, 1 lowercase, 1 uppercase, 1 number
              </Text>
            </FormUI.FormField>
          </CardUI.CardContent>
        </CardUI.Card>

        <CardUI.Card tone="inverse">
          <CardUI.CardContent padding="auth" spacing="lg">
            <Text variant="inverse" className="font-['Sora'] text-lg font-semibold">
              Permissions & Status
            </Text>

            <LayoutUI.Row className="max-md:flex-col" gap="gap-4" align="items-stretch">
              <LayoutUI.Row surface="panel" padding="md" radius="xl" className="flex-1" gap="gap-3">
                <Checkbox checked={isActive} onCheckedChange={(checked) => setValue('is_active', Boolean(checked), { shouldDirty: true, shouldValidate: true })} />
                <LayoutUI.Column className="flex-1" gap="gap-1">
                  <Text variant="inverse" className="font-medium">Active Account</Text>
                  <Text variant="muted-inverse" size="xs">User can access the platform</Text>
                </LayoutUI.Column>
              </LayoutUI.Row>

              <LayoutUI.Row surface="panel" padding="md" radius="xl" className="flex-1" gap="gap-3">
                <Checkbox checked={isSuperAdmin} onCheckedChange={(checked) => setValue('is_super_admin', Boolean(checked), { shouldDirty: true, shouldValidate: true })} />
                <LayoutUI.Column className="flex-1" gap="gap-1">
                  <Text variant="inverse" className="font-medium">Super Admin</Text>
                  <Text variant="muted-inverse" size="xs">Full system access</Text>
                </LayoutUI.Column>
              </LayoutUI.Row>
            </LayoutUI.Row>

            <FormUI.FormField id="role_ids" label="Assign Roles (Optional)" tone="inverse">
              {roles.length === 0 ? (
                <LayoutUI.Container surface="panel" padding="lg" radius="xl" className="text-center">
                  <Text variant="muted-inverse" size="sm">No roles available</Text>
                </LayoutUI.Container>
              ) : (
                <LayoutUI.Column surface="panel" padding="md" radius="xl" gap="gap-2">
                  {roles.map((role) => {
                    const isSelected = selectedRoleIds.includes(role.id);
                    return (
                      <LayoutUI.Row key={role.id} surface="panel-soft" padding="sm" radius="lg" justify="justify-between">
                        <LayoutUI.Row className="flex-1" gap="gap-3">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() =>
                              setValue(
                                'role_ids',
                                isSelected ? selectedRoleIds.filter((id) => id !== role.id) : [...selectedRoleIds, role.id],
                                { shouldDirty: true, shouldValidate: true }
                              )
                            }
                          />
                          <LayoutUI.Column className="flex-1" gap="gap-1">
                            <Text variant="inverse" className="font-medium">{role.name}</Text>
                            {role.description ? <Text variant="muted-inverse" size="xs">{role.description}</Text> : null}
                          </LayoutUI.Column>
                        </LayoutUI.Row>
                        {role.is_system ? <Badge variant="success">System</Badge> : null}
                      </LayoutUI.Row>
                    );
                  })}
                </LayoutUI.Column>
              )}
              {selectedRoleIds.length > 0 ? (
                <Text variant="muted-inverse" size="sm">
                  {selectedRoleIds.length} role{selectedRoleIds.length > 1 ? 's' : ''} selected
                </Text>
              ) : null}
            </FormUI.FormField>
          </CardUI.CardContent>
        </CardUI.Card>

        <CardUI.Card tone="inverse">
          <CardUI.CardContent padding="auth">
            <FormUI.FormFooter align="end" gap="md" flush>
              <Button type="button" onClick={() => navigate('/admin/users')} variant="ghost-inverse" size="form">
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} variant="accent" size="form">
                <Icons.Save size={18} />
                {isPending ? 'Creating...' : 'Create User'}
              </Button>
            </FormUI.FormFooter>
          </CardUI.CardContent>
        </CardUI.Card>
      </FormUI.FormRoot>
    </LayoutUI.Column>
  );
}
