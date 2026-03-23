import { useEffect, useRef, useState } from 'react';
import * as Icons from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate, useParams } from 'react-router';
import * as CardUI from '@components/ui/card';
import * as FormUI from '@components/ui/form';
import * as LayoutUI from '@components/ui/layout';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Text } from '@components/ui/text';
import { Textarea } from '@components/ui/textarea';
import { useRole, useRolePermissions, useUpdateRole } from '@feature/role/hooks';
import { updateRoleSchema, type UpdateRoleFormData } from '@feature/role/types';
import { formatDate } from '@utility/date';

export function AdminRoleEdit() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const isRouteEditMode = location.pathname.includes('/admin/roles/edit/');
  const [isEditMode, setIsEditMode] = useState(isRouteEditMode);
  const { data: role, isLoading, error } = useRole(id ?? '', Boolean(id));
  const { data: permissions } = useRolePermissions(id ?? '', Boolean(id));
  const { mutate: updateRole, isPending } = useUpdateRole(id ?? '');
  const hasInitialized = useRef(false);
  const form = useForm<UpdateRoleFormData>({
    resolver: zodResolver(updateRoleSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: { name: '', description: '', parent_role_id: null },
  });
  const { register, handleSubmit, reset, formState: { errors } } = form;

  const resetFormWithRole = () => {
    if (!role) return;
    reset({ name: role.name, description: role.description, parent_role_id: role.parent_role_id });
  };
  useEffect(() => { if (!id) navigate('/admin/roles', { replace: true }); }, [id, navigate]);
  useEffect(() => { setIsEditMode(isRouteEditMode); }, [isRouteEditMode]);
  useEffect(() => { if (role && !hasInitialized.current) { hasInitialized.current = true; resetFormWithRole(); } }, [role, reset]);

  if (isLoading) return <CardUI.Card tone="inverse"><CardUI.CardContent padding="auth"><div className="p-12 text-center"><div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-white/20 border-t-[#29E68C]" /><Text className="mt-4" style={{ color: 'rgba(4, 9, 12, 0.6)' }}>Loading role data...</Text></div></CardUI.CardContent></CardUI.Card>;
  if (error || !role) return <CardUI.Card tone="inverse"><CardUI.CardContent padding="auth"><div className="p-12 text-center"><Text className="font-medium" style={{ color: '#04090C' }}>{error ? 'Error loading role data' : 'Role not found'}</Text><Button onClick={() => navigate('/admin/roles')} variant="accent" size="form" className="mt-4">Back to Roles</Button></div></CardUI.CardContent></CardUI.Card>;

  const handleEnableEdit = () => { resetFormWithRole(); setIsEditMode(true); navigate(`/admin/roles/edit/${role.id}`); };
  const handleCancelEdit = () => { resetFormWithRole(); setIsEditMode(false); navigate(`/admin/roles/${role.id}`); };
  const onSubmit = (data: UpdateRoleFormData) => {
    if (!isEditMode) return;
    const payload: UpdateRoleFormData = {};
    if (data.name && data.name !== role.name) payload.name = data.name;
    if (data.description && data.description !== role.description) payload.description = data.description;
    if (data.parent_role_id !== role.parent_role_id) payload.parent_role_id = data.parent_role_id;
    if (Object.keys(payload).length === 0) { handleCancelEdit(); return; }
    updateRole(payload, { onSuccess: () => { setIsEditMode(false); navigate(`/admin/roles/${role.id}`); } });
  };

  return (
    <LayoutUI.Column gap="gap-6">
      <LayoutUI.Row justify="justify-between" align="items-start" className="gap-4 max-md:flex-col">
        <LayoutUI.Row gap="gap-4">
          <Button type="button" onClick={() => navigate('/admin/roles')} variant="ghost-inverse" size="icon" className="rounded-xl border border-black/10 bg-black/5"><Icons.ArrowLeft size={20} /></Button>
          <LayoutUI.Column gap="gap-2">
            <Text as="h1" variant="inverse" className="font-['Sora'] text-3xl font-bold">{isEditMode ? 'Edit Role' : 'Role Details'}</Text>
            <Text variant="muted-inverse">{isEditMode ? 'Update role details and metadata.' : 'Review role details and permissions before editing.'}</Text>
          </LayoutUI.Column>
        </LayoutUI.Row>
        {!isEditMode && !role.is_system ? <Button type="button" onClick={handleEnableEdit} variant="accent" size="form"><Icons.Edit size={18} />Edit Role</Button> : null}
      </LayoutUI.Row>

      <LayoutUI.Row gap="gap-4" className="grid grid-cols-1 md:grid-cols-3">
        <CardUI.Card tone="inverse"><CardUI.CardContent className="py-4"><LayoutUI.Column gap="gap-1"><Text variant="muted-inverse" size="sm">Created At</Text><Text variant="inverse" className="font-medium">{formatDate(role.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}</Text></LayoutUI.Column></CardUI.CardContent></CardUI.Card>
        <CardUI.Card tone="inverse"><CardUI.CardContent className="py-4"><LayoutUI.Column gap="gap-1"><Text variant="muted-inverse" size="sm">Permissions</Text><Text variant="inverse" className="font-medium">{permissions?.length || 0}</Text></LayoutUI.Column></CardUI.CardContent></CardUI.Card>
        <CardUI.Card tone="inverse"><CardUI.CardContent className="py-4"><LayoutUI.Column gap="gap-1"><Text variant="muted-inverse" size="sm">Type</Text><Text variant="inverse" className="font-medium">{role.is_system ? 'System' : 'Custom'}</Text></LayoutUI.Column></CardUI.CardContent></CardUI.Card>
      </LayoutUI.Row>

      <FormUI.FormRoot onSubmit={handleSubmit(onSubmit)}>
        <CardUI.Card tone="inverse"><CardUI.CardContent padding="auth" spacing="lg">
          <FormUI.FormField id="name" label="Role Name" error={errors.name?.message} tone="inverse">
            <Input id="name" type="text" {...register('name')} disabled={!isEditMode || role.is_system} placeholder="e.g., content-editor" icon={<Icons.Shield />} hasError={Boolean(errors.name)} tone="inverse" className={!isEditMode || role.is_system ? 'cursor-default opacity-80' : undefined} />
            <Text variant="muted-inverse" size="xs">Use lowercase letters, numbers, and hyphens only</Text>
          </FormUI.FormField>
          <FormUI.FormField id="description" label="Description" error={errors.description?.message} tone="inverse">
            <Textarea id="description" {...register('description')} disabled={!isEditMode || role.is_system} rows={4} className={`min-h-28 rounded-xl border-black/10 bg-transparent text-[#04090C] ${!isEditMode || role.is_system ? 'cursor-default opacity-80' : ''}`} placeholder="Describe what this role can do..." />
          </FormUI.FormField>
        </CardUI.CardContent></CardUI.Card>

        <CardUI.Card tone="inverse"><CardUI.CardHeader className="border-b border-black/10 pb-5"><LayoutUI.Row justify="justify-between" align="items-center" className="gap-3 max-sm:flex-col max-sm:items-start"><LayoutUI.Row align="center" gap="gap-2"><Icons.KeyRound className="size-5 text-[#29E68C]" /><Text as="h3" variant="inverse" size="lg" className="font-semibold">Permissions</Text></LayoutUI.Row><Text variant="muted-inverse" size="sm">{permissions?.length || 0} total</Text></LayoutUI.Row></CardUI.CardHeader><CardUI.CardContent className="py-4">{!permissions || permissions.length === 0 ? <LayoutUI.Column gap="gap-3" className="py-4 text-center"><Icons.Shield className="size-10 text-black/20" /><Text variant="muted-inverse">No permissions assigned</Text></LayoutUI.Column> : <LayoutUI.Column gap="gap-3">{permissions.map((permission) => <LayoutUI.Container key={permission.id} className="rounded-xl border border-black/10 bg-black/5 px-4 py-3"><LayoutUI.Row justify="justify-between" align="items-start" className="gap-3 max-sm:flex-col"><LayoutUI.Column gap="gap-1" className="min-w-0 flex-1"><Text variant="inverse" className="font-medium">{permission.name}</Text><Text variant="muted-inverse" className="break-words">{permission.description}</Text></LayoutUI.Column><LayoutUI.Row gap="gap-2" className="flex-wrap"><Button type="button" variant="ghost-inverse" size="sm" className="pointer-events-none rounded-full border border-black/10 bg-white/40 text-black/70">{permission.resource.name}</Button><Button type="button" variant="ghost-inverse" size="sm" className="pointer-events-none rounded-full border border-black/10 bg-white/40 text-black/70">{permission.action.name}</Button></LayoutUI.Row></LayoutUI.Row></LayoutUI.Container>)}</LayoutUI.Column>}</CardUI.CardContent></CardUI.Card>

        {isEditMode && !role.is_system ? <CardUI.Card tone="inverse"><CardUI.CardContent padding="auth"><FormUI.FormFooter align="end" gap="md" flush><Button type="button" onClick={handleCancelEdit} variant="ghost-inverse" size="form">Cancel</Button><Button type="submit" disabled={isPending} variant="accent" size="form"><Icons.Save />{isPending ? 'Saving...' : 'Save Changes'}</Button></FormUI.FormFooter></CardUI.CardContent></CardUI.Card> : null}
      </FormUI.FormRoot>
    </LayoutUI.Column>
  );
}
