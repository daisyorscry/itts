import * as Icons from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate, useParams } from 'react-router';
import { useListRoles } from '@feature/role/hooks';
import { useGetUser, useUpdateUser } from '@feature/user/hooks';
import { type UpdateUserFormData, updateUserSchema } from '@feature/user/types';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import * as CardUI from '@components/ui/card';
import { Checkbox } from '@components/ui/checkbox';
import * as FormUI from '@components/ui/form';
import { Input } from '@components/ui/input';
import * as LayoutUI from '@components/ui/layout';
import { Text } from '@components/ui/text';
import { ResetPasswordModal } from '@pages/admin/users/ResetPasswordModal';
import { formatDate, formatLastLoginDate } from '@utility/date';

export function AdminUserEdit() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const isRouteEditMode = location.pathname.includes('/admin/users/edit/');
  const [isEditMode, setIsEditMode] = useState(isRouteEditMode);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const { data: userData, isLoading, error } = useGetUser(id ?? '', Boolean(id));
  const { mutate: updateUser, isPending } = useUpdateUser(id ?? '');
  const { data: rolesData } = useListRoles({ page_size: 100 });
  const form = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      is_active: true,
      is_super_admin: false,
      role_ids: [],
    },
  });
  const hasInitialized = useRef(false);
  const user = userData;
  const { register, setValue, watch, handleSubmit, formState } = form;
  const { errors } = formState;

  const resetFormWithUser = () => {
    if (!user) {
      return;
    }

    form.reset({
      full_name: user.full_name,
      email: user.email,
      is_active: user.is_active,
      is_super_admin: user.is_super_admin,
      role_ids: user.roles?.map((role) => role.id) ?? [],
    });
  };

  useEffect(() => {
    if (!id) {
      navigate('/admin/users', { replace: true });
    }
  }, [id, navigate]);

  useEffect(() => {
    setIsEditMode(isRouteEditMode);
  }, [isRouteEditMode]);

  useEffect(() => {
    if (user && !hasInitialized.current) {
      hasInitialized.current = true;
      resetFormWithUser();
    }
  }, [form, user]);

  if (isLoading) {
    return (
      <CardUI.Card tone="inverse">
        <CardUI.CardContent padding="auth">
          <div className="p-12 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-[#29E68C]" />
            <Text className="mt-4" style={{ color: 'rgba(4, 9, 12, 0.6)' }}>
              Loading user data...
            </Text>
          </div>
        </CardUI.CardContent>
      </CardUI.Card>
    );
  }

  if (error || !user) {
    return (
      <CardUI.Card tone="inverse">
        <CardUI.CardContent padding="auth">
          <div className="p-12 text-center">
            <Text className="font-medium" style={{ color: '#04090C' }}>
              {error ? 'Error loading user data' : 'User not found'}
            </Text>
            <Button onClick={() => navigate('/admin/users')} variant="accent" size="form" className="mt-4">
              Back to Users
            </Button>
          </div>
        </CardUI.CardContent>
      </CardUI.Card>
    );
  }

  const roles = rolesData?.data ?? [];
  const isActive = Boolean(watch('is_active'));
  const isSuperAdmin = Boolean(watch('is_super_admin'));
  const selectedRoleIds = watch('role_ids') ?? [];

  const handleEnableEdit = () => {
    resetFormWithUser();
    setIsEditMode(true);
    navigate(`/admin/users/edit/${user.id}`);
  };

  const handleCancelEdit = () => {
    resetFormWithUser();
    setIsEditMode(false);
    navigate(`/admin/users/${user.id}`);
  };

  return (
    <>
      <LayoutUI.Column gap="gap-6">
        <LayoutUI.Row justify="justify-between"  className="">
          <LayoutUI.Row gap="gap-4">
            <Button type="button" onClick={() => navigate('/admin/users')} variant="ghost-inverse" size="icon" className="rounded-xl border border-black/10 bg-black/5">
              <Icons.ArrowLeft size={20} />
            </Button>
            <LayoutUI.Column gap="gap-2">
              <Text as="h1" variant="inverse" className="font-['Sora'] text-3xl font-bold">
                {isEditMode ? 'Edit User' : 'User Details'}
              </Text>
              <Text variant="muted-inverse">
                {isEditMode ? 'Update user information and permissions' : 'Review user information before making changes'}
              </Text>
            </LayoutUI.Column>
          </LayoutUI.Row>
          <LayoutUI.Row gap="gap-3" className="max-sm:w-full max-sm:flex-col">
            {isEditMode ? (
              <Button
                type="button"
                onClick={() => setIsResetPasswordOpen(true)}
                variant="outline"
                size="form"
                className="border-white/20 bg-black/5 text-[#04090C] hover:bg-white/10 hover:text-[#04090C]"
              >
                <Icons.Key size={18} />
                Reset Password
              </Button>
            ) : (
              <Button type="button" onClick={handleEnableEdit} variant="accent" size="form">
                <Icons.Edit size={18} />
                Edit User
              </Button>
            )}
          </LayoutUI.Row>
        </LayoutUI.Row>

        <FormUI.FormRoot
          onSubmit={handleSubmit((data) => {
            if (!isEditMode) {
              return;
            }

            const payload: UpdateUserFormData = {};

            if (data.full_name && data.full_name !== user.full_name) payload.full_name = data.full_name;
            if (data.email && data.email !== user.email) payload.email = data.email;
            if (data.is_active !== user.is_active) payload.is_active = data.is_active;
            if (data.is_super_admin !== user.is_super_admin) payload.is_super_admin = data.is_super_admin;

            const originalRoleIds = user.roles?.map((role) => role.id).sort() ?? [];
            const nextRoleIds = [...(data.role_ids ?? [])].sort();
            if (JSON.stringify(originalRoleIds) !== JSON.stringify(nextRoleIds)) payload.role_ids = data.role_ids;

            if (Object.keys(payload).length === 0) {
              handleCancelEdit();
              return;
            }

            updateUser(payload, {
              onSuccess: () => {
                setIsEditMode(false);
                navigate(`/admin/users/${user.id}`);
              },
            });
          })}
        >
          <CardUI.Card tone="inverse">
            <CardUI.CardContent padding="auth" spacing="lg">
              <LayoutUI.Row className="border-b border-black/10 pb-4" gap="gap-3">
                <Text variant="inverse" className="font-['Sora'] text-lg font-semibold">
                  Basic Information
                </Text>
              </LayoutUI.Row>

              <FormUI.FormField id="full_name" label="Full Name" error={errors.full_name?.message} tone="inverse">
                <Input
                  id="full_name"
                  type="text"
                  {...register('full_name')}
                  disabled={!isEditMode}
                  placeholder="e.g., John Doe"
                  icon={<Icons.User />}
                  hasError={Boolean(errors.full_name)}
                  tone="inverse"
                  className={!isEditMode ? 'cursor-default opacity-80' : undefined}
                />
              </FormUI.FormField>

              <FormUI.FormField id="email" label="Email Address" error={errors.email?.message} tone="inverse">
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  disabled={!isEditMode}
                  placeholder="e.g., john@example.com"
                  icon={<Icons.Mail />}
                  hasError={Boolean(errors.email)}
                  tone="inverse"
                  className={!isEditMode ? 'cursor-default opacity-80' : undefined}
                />
              </FormUI.FormField>

              <LayoutUI.Column className="border-t border-black/10 pt-4" gap="gap-4">
                <LayoutUI.Row className="max-md:flex-col max-md:gap-4" gap="gap-4" align="items-start">
                  <LayoutUI.Column className="flex-1" gap="gap-1">
                    <Text variant="muted-inverse" className="text-xs font-medium">Created At</Text>
                    <Text variant="inverse" className="text-sm">
                      {formatDate(user.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </Text>
                  </LayoutUI.Column>
                  <LayoutUI.Column className="flex-1" gap="gap-1">
                    <Text variant="muted-inverse" className="text-xs font-medium">Last Login</Text>
                    <Text variant="inverse" className="text-sm">
                      {formatLastLoginDate(user.last_login_at)}
                    </Text>
                  </LayoutUI.Column>
                </LayoutUI.Row>
              </LayoutUI.Column>
            </CardUI.CardContent>
          </CardUI.Card>

          <CardUI.Card tone="inverse">
            <CardUI.CardContent padding="auth" spacing="lg">
              <LayoutUI.Row justify="justify-between" align="items-center" className="gap-3 max-sm:flex-col max-sm:items-start">
                <Text variant="inverse" className="font-['Sora'] text-lg font-semibold">
                  Permissions & Status
                </Text>
                {!isEditMode ? (
                  <Badge className="rounded-full border border-black/10 bg-black/5 text-black/70">
                    Read only
                  </Badge>
                ) : null}
              </LayoutUI.Row>

              <LayoutUI.Row className="max-md:flex-col" gap="gap-4" align="items-stretch">
                <LayoutUI.Row surface="panel" padding="md" radius="xl" className="flex-1" gap="gap-3">
                  <Checkbox
                    checked={isActive}
                    disabled={!isEditMode}
                    onCheckedChange={(checked) => setValue('is_active', Boolean(checked), { shouldDirty: true, shouldValidate: true })}
                  />
                  <LayoutUI.Column className="flex-1" gap="gap-1">
                    <Text variant="inverse" className="font-medium">Active Account</Text>
                    <Text variant="muted-inverse" size="xs">User can access the platform</Text>
                  </LayoutUI.Column>
                </LayoutUI.Row>

                <LayoutUI.Row surface="panel" padding="md" radius="xl" className="flex-1" gap="gap-3">
                  <Checkbox
                    checked={isSuperAdmin}
                    disabled={!isEditMode}
                    onCheckedChange={(checked) => setValue('is_super_admin', Boolean(checked), { shouldDirty: true, shouldValidate: true })}
                  />
                  <LayoutUI.Column className="flex-1" gap="gap-1">
                    <Text variant="inverse" className="font-medium">Super Admin</Text>
                    <Text variant="muted-inverse" size="xs">Full system access</Text>
                  </LayoutUI.Column>
                </LayoutUI.Row>
              </LayoutUI.Row>

              <FormUI.FormField id="role_ids" label="Assigned Roles" tone="inverse">
                {roles.length === 0 ? (
                  <LayoutUI.Container surface="none" padding="lg" radius="xl" className="text-center">
                    <Text variant="muted-inverse" size="sm">No roles available</Text>
                  </LayoutUI.Container>
                ) : (
                  <LayoutUI.Column surface="none" padding="md" radius="xl" gap="gap-2">
                    {roles.map((role) => {
                      const isSelected = selectedRoleIds.includes(role.id);
                      return (
                        <LayoutUI.Row key={role.id} surface="panel" padding="sm" radius="lg" justify="justify-between">
                          <LayoutUI.Row className="flex-1" gap="gap-3">
                            <Checkbox
                              checked={isSelected}
                              disabled={!isEditMode}
                              onCheckedChange={() =>
                                setValue(
                                  'role_ids',
                                  isSelected ? selectedRoleIds.filter((item) => item !== role.id) : [...selectedRoleIds, role.id],
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

          {isEditMode ? (
            <CardUI.Card tone="inverse" border={false}>
              <CardUI.CardContent>
                <FormUI.FormFooter align="end" gap="md" flush>
                  <Button type="button" onClick={handleCancelEdit} variant="destructive"  size="form">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending} variant="accent" size="form">
                    <Icons.Save size={18} />
                    {isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </FormUI.FormFooter>
              </CardUI.CardContent>
            </CardUI.Card>
          ) : null}
        </FormUI.FormRoot>
      </LayoutUI.Column>

      <ResetPasswordModal
        user={user}
        isOpen={isEditMode && isResetPasswordOpen}
        onClose={() => setIsResetPasswordOpen(false)}
      />
    </>
  );
}
