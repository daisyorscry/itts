import { useState } from 'react';
import { useNavigate } from 'react-router';
import * as Icons from 'lucide-react';
import { Button } from '@components/ui/button';
import * as CardUI from '@components/ui/card';
import { DataPagination } from '@components/ui/pagination';
import * as LayoutUI from '@components/ui/layout';
import { SearchField } from '@components/ui/search';
import * as SelectUI from '@components/ui/select';
import { Text } from '@components/ui/text';
import { DataTable } from '@components/ui/table';
import { DeleteUserDialog } from '@pages/admin/users/DeleteUserDialog';
import { UsersQueryState } from '@pages/admin/users/UsersQueryState';
import { createUserColumns } from '@pages/admin/users/Columns';
import { useDeleteUser, useListUsers } from '@feature/user/hooks';
import type { ListUsersResponse, User } from '@feature/user/types';
import { PERMISSIONS, useHasPermission } from '@utils/permissions';

type UserFilterValue = 'all' | 'active' | 'inactive';
type UserRoleFilterValue = 'all' | 'super-admin' | 'regular';

const userFilterOptions = ['all', 'active', 'inactive'] as const satisfies ReadonlyArray<UserFilterValue>;
const userRoleFilterOptions = ['all', 'super-admin', 'regular'] as const satisfies ReadonlyArray<UserRoleFilterValue>;

function isUserFilterValue(value: string): value is UserFilterValue {
  return userFilterOptions.includes(value as UserFilterValue);
}

function isUserRoleFilterValue(value: string): value is UserRoleFilterValue {
  return userRoleFilterOptions.includes(value as UserRoleFilterValue);
}

function toStatusFilter(value: UserFilterValue): boolean | undefined {
  if (value === 'all') {
    return undefined;
  }

  return value === 'active';
}

function toRoleFilter(value: UserRoleFilterValue): boolean | undefined {
  if (value === 'all') {
    return undefined;
  }

  return value === 'super-admin';
}

export function AdminUsers() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
  const [isSuperAdmin, setIsSuperAdmin] = useState<boolean | undefined>(undefined);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();

  const canCreate = useHasPermission(PERMISSIONS.USERS_CREATE);
  const canUpdate = useHasPermission(PERMISSIONS.USERS_UPDATE);
  const canDelete = useHasPermission(PERMISSIONS.USERS_DELETE);

  const { data, isLoading, error } = useListUsers({
    page,
    page_size: pageSize,
    search: search || undefined,
    is_active: isActive,
    is_super_admin: isSuperAdmin,
  });

  const handleViewUser = (user: User) => {
    navigate(`/admin/users/${user.id}`);
  };

  const handleEditUser = (user: User) => {
    navigate(`/admin/users/edit/${user.id}`);
  };

  const handleDeleteConfirm = () => {
    if (!userToDelete) {
      return;
    }

    deleteUser(userToDelete.id, {
      onSuccess: () => {
        setUserToDelete(null);
      },
    });
  };

  const userColumns = createUserColumns({
    canUpdate,
    canDelete,
    onView: handleViewUser,
    onEdit: handleEditUser,
    onDelete: setUserToDelete,
  });

  const listUsersResponse: ListUsersResponse | null = data ?? null;
  const users = listUsersResponse?.data ?? [];
  const hasUsers = users.length > 0;

  return (
    <LayoutUI.Column gap='gap-2'>
      <LayoutUI.Column gap='gap-8'>
        <LayoutUI.Row
          justify="justify-between"
          align="items-center"
          className="gap-4 max-md:flex-col max-md:items-start"
        >
          <Text as="h1" variant="inverse" className="font-['Sora'] text-3xl font-bold md:text-4xl">
            Users Management
          </Text>
          {canCreate ? (
            <Button onClick={() => navigate('/admin/users/create')} variant="accent" size="form">
              <Icons.Plus />
              Add User
            </Button>
          ) : null}
        </LayoutUI.Row>
        <LayoutUI.Row
          justify="justify-between"
          align="items-start"
          className="gap-4 max-xl:flex-col max-xl:items-start"
        >
          {typeof listUsersResponse?.total === 'number' ? (
            <Text variant="muted-inverse" className="shrink-0 md:pt-2">
              Showing {(page - 1) * (listUsersResponse?.page_size ?? pageSize) + 1} to{' '}
              {Math.min(page * (listUsersResponse?.page_size ?? pageSize), listUsersResponse.total)} of{' '}
              {listUsersResponse.total} users
            </Text>
          ) : null}

          <CardUI.Card tone="inverse" border={false} className="w-full flex-1">
            <CardUI.CardContent>
              <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-4">
                <LayoutUI.Container className="md:col-span-2">
                  <SearchField
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(1);
                    }}
                    placeholder="Search users..."
                  />
                </LayoutUI.Container>

                <SelectUI.Select
                  value={isActive === undefined ? 'all' : isActive ? 'active' : 'inactive'}
                  onValueChange={(value) => {
                    if (isUserFilterValue(value)) {
                      setIsActive(toStatusFilter(value));
                      setPage(1);
                    }
                  }}
                >
                  <SelectUI.SelectTrigger appearance="admin">
                    <SelectUI.SelectValue>
                      {isActive === undefined ? 'All Status' : isActive ? 'Active Only' : 'Inactive Only'}
                    </SelectUI.SelectValue>
                  </SelectUI.SelectTrigger>
                  <SelectUI.SelectContent appearance="admin">
                    <SelectUI.SelectItem value="all">All Status</SelectUI.SelectItem>
                    <SelectUI.SelectItem value="active">Active Only</SelectUI.SelectItem>
                    <SelectUI.SelectItem value="inactive">Inactive Only</SelectUI.SelectItem>
                  </SelectUI.SelectContent>
                </SelectUI.Select>

                <SelectUI.Select
                  value={isSuperAdmin === undefined ? 'all' : isSuperAdmin ? 'super-admin' : 'regular'}
                  onValueChange={(value) => {
                    if (isUserRoleFilterValue(value)) {
                      setIsSuperAdmin(toRoleFilter(value));
                      setPage(1);
                    }
                  }}
                >
                  <SelectUI.SelectTrigger appearance="admin">
                    <SelectUI.SelectValue>
                      {isSuperAdmin === undefined ? 'All Users' : isSuperAdmin ? 'Super Admins' : 'Regular Users'}
                    </SelectUI.SelectValue>
                  </SelectUI.SelectTrigger>
                  <SelectUI.SelectContent appearance="admin">
                    <SelectUI.SelectItem value="all">All Users</SelectUI.SelectItem>
                    <SelectUI.SelectItem value="super-admin">Super Admins</SelectUI.SelectItem>
                    <SelectUI.SelectItem value="regular">Regular Users</SelectUI.SelectItem>
                  </SelectUI.SelectContent>
                </SelectUI.Select>
              </LayoutUI.Container>
            </CardUI.CardContent>
          </CardUI.Card>
        </LayoutUI.Row>
      </LayoutUI.Column>

      {isLoading ? <UsersQueryState type="loading" search={search} /> : null}
      {!isLoading && error ? <UsersQueryState type="error" search={search} /> : null}
      {!isLoading && !error && !hasUsers ? <UsersQueryState type="empty" search={search} /> : null}

      {!isLoading && !error && listUsersResponse && hasUsers ? (
        <LayoutUI.Column>
          <CardUI.Card tone="inverse" className="overflow-hidden">
            <DataTable data={users} columns={userColumns} rowKey="id" emptyMessage="No users found." />
          </CardUI.Card>

          <DataPagination
            pagination={listUsersResponse}
            onPageChange={setPage}
            onPageSizeChange={(value) => {
              setPageSize(value);
              setPage(1);
            }}
          />
        </LayoutUI.Column>
      ) : null}

      <DeleteUserDialog
        user={userToDelete}
        isDeleting={isDeleting}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDeleteConfirm}
      />
    </LayoutUI.Column>

  );
}
