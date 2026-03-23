import { useState } from 'react';
import * as Icons from 'lucide-react';
import { useNavigate } from 'react-router';
import { useDeleteRole, useListRoles } from '@feature/role/hooks';
import type { PaginatedRoles, Role } from '@feature/role/types';
import { Button } from '@components/ui/button';
import * as CardUI from '@components/ui/card';
import * as LayoutUI from '@components/ui/layout';
import { DataPagination } from '@components/ui/pagination';
import { SearchField } from '@components/ui/search';
import * as SelectUI from '@components/ui/select';
import { Text } from '@components/ui/text';
import { DataTable } from '@components/ui/table';
import { CreateRoleModal } from '@pages/admin/roles/CreateRoleModal';
import { createRoleColumns } from '@pages/admin/roles/Columns';
import { DeleteRoleDialog } from '@pages/admin/roles/DeleteRoleDialog';
import { RolesQueryState } from '@pages/admin/roles/RolesQueryState';
import { PERMISSIONS, useHasPermission } from '@utils/permissions';

type RoleTypeFilterValue = 'all' | 'system' | 'custom';

const roleTypeFilterOptions = ['all', 'system', 'custom'] as const satisfies ReadonlyArray<RoleTypeFilterValue>;

function isRoleTypeFilterValue(value: string): value is RoleTypeFilterValue {
  return roleTypeFilterOptions.includes(value as RoleTypeFilterValue);
}

function toSystemRoleFilter(value: RoleTypeFilterValue): boolean | undefined {
  if (value === 'all') {
    return undefined;
  }

  return value === 'system';
}

export function AdminRoles() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [isSystemRole, setIsSystemRole] = useState<boolean | undefined>(undefined);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  const { mutate: deleteRole, isPending: isDeleting } = useDeleteRole();

  const canCreate = useHasPermission(PERMISSIONS.ROLES_CREATE);
  const canUpdate = useHasPermission(PERMISSIONS.ROLES_UPDATE);
  const canDelete = useHasPermission(PERMISSIONS.ROLES_DELETE);

  const { data, isLoading, error } = useListRoles({
    page,
    page_size: pageSize,
    search: search || undefined,
    is_system: isSystemRole,
  });

  const handleDeleteConfirm = () => {
    if (!roleToDelete) {
      return;
    }

    deleteRole(roleToDelete.id, {
      onSuccess: () => {
        setRoleToDelete(null);
      },
    });
  };

  const roleColumns = createRoleColumns({
    canUpdate,
    canDelete,
    onView: (role) => navigate(`/admin/roles/${role.id}`),
    onEdit: (role) => navigate(`/admin/roles/edit/${role.id}`),
    onDelete: setRoleToDelete,
  });

  const listRolesResponse: PaginatedRoles | null = data ?? null;
  const roles = listRolesResponse?.data ?? [];
  const hasRoles = roles.length > 0;

  return (
    <LayoutUI.Column gap="gap2">
      <LayoutUI.Column gap="gap-8">
        <LayoutUI.Row
          justify="justify-between"
          align="items-center"
          className="gap-4 max-md:flex-col max-md:items-start"
        >
          <LayoutUI.Column gap="gap-2">
            <Text as="h1" variant="inverse" className="font-['Sora'] text-3xl font-bold md:text-4xl">
              Roles & Permissions
            </Text>
            <Text variant="muted-inverse">
              Manage user roles and access control
            </Text>
          </LayoutUI.Column>

          {canCreate ? (
            <Button onClick={() => setIsCreateModalOpen(true)} variant="accent" size="form">
              <Icons.Plus />
              Create Role
            </Button>
          ) : null}
        </LayoutUI.Row>

        <LayoutUI.Row
          justify="justify-between"
          align="items-start"
          className="gap-4 max-xl:flex-col max-xl:items-start"
        >
          {typeof listRolesResponse?.total === 'number' ? (
            <Text variant="muted-inverse" className="shrink-0 md:pt-2">
              Showing {(page - 1) * (listRolesResponse?.page_size ?? pageSize) + 1} to{' '}
              {Math.min(page * (listRolesResponse?.page_size ?? pageSize), listRolesResponse.total)} of{' '}
              {listRolesResponse.total} roles
            </Text>
          ) : null}

          <CardUI.Card tone="inverse" border={false} className="w-full flex-1">
            <CardUI.CardContent>
              <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <LayoutUI.Container className="md:col-span-2">
                  <SearchField
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(1);
                    }}
                    placeholder="Search roles..."
                  />
                </LayoutUI.Container>

                <SelectUI.Select
                  value={isSystemRole === undefined ? 'all' : isSystemRole ? 'system' : 'custom'}
                  onValueChange={(value) => {
                    if (isRoleTypeFilterValue(value)) {
                      setIsSystemRole(toSystemRoleFilter(value));
                      setPage(1);
                    }
                  }}
                >
                  <SelectUI.SelectTrigger appearance="admin">
                    <SelectUI.SelectValue>
                      {isSystemRole === undefined ? 'All Roles' : isSystemRole ? 'System Roles' : 'Custom Roles'}
                    </SelectUI.SelectValue>
                  </SelectUI.SelectTrigger>
                  <SelectUI.SelectContent appearance="admin">
                    <SelectUI.SelectItem value="all">All Roles</SelectUI.SelectItem>
                    <SelectUI.SelectItem value="system">System Roles</SelectUI.SelectItem>
                    <SelectUI.SelectItem value="custom">Custom Roles</SelectUI.SelectItem>
                  </SelectUI.SelectContent>
                </SelectUI.Select>
              </LayoutUI.Container>
            </CardUI.CardContent>
          </CardUI.Card>
        </LayoutUI.Row>
      </LayoutUI.Column>

      {isLoading ? <RolesQueryState type="loading" search={search} /> : null}
      {!isLoading && error ? <RolesQueryState type="error" search={search} /> : null}
      {!isLoading && !error && !hasRoles ? <RolesQueryState type="empty" search={search} /> : null}

      {!isLoading && !error && listRolesResponse && hasRoles ? (
        <LayoutUI.Column>
          <CardUI.Card tone="inverse" className="overflow-hidden">
            <DataTable data={roles} columns={roleColumns} rowKey="id" emptyMessage="No roles found." />
          </CardUI.Card>

          <DataPagination
            pagination={listRolesResponse}
            onPageChange={setPage}
            onPageSizeChange={(value) => {
              setPageSize(value);
              setPage(1);
            }}
          />
        </LayoutUI.Column>
      ) : null}

      <CreateRoleModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      <DeleteRoleDialog
        role={roleToDelete}
        isDeleting={isDeleting}
        onClose={() => setRoleToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
    </LayoutUI.Column>
  );
}
