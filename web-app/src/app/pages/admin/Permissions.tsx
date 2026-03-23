import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useGetPermission, useListActions, useListPermissions, useListResources } from '@feature/permission/hooks';
import type { PermissionListResponse } from '@feature/permission/types';
import * as CardUI from '@components/ui/card';
import { Button } from '@components/ui/button';
import * as LayoutUI from '@components/ui/layout';
import { DataPagination } from '@components/ui/pagination';
import { SearchField } from '@components/ui/search';
import * as SelectUI from '@components/ui/select';
import { Text } from '@components/ui/text';
import { DataTable } from '@components/ui/table';
import { createPermissionColumns } from '@pages/admin/permissions/Columns';
import { PermissionsQueryState } from '@pages/admin/permissions/PermissionsQueryState';
import { PERMISSIONS, useHasPermission } from '@utils/permissions';

export function AdminPermissions() {
  const navigate = useNavigate();
  const canListPermissions = useHasPermission(PERMISSIONS.PERMISSIONS_LIST);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [resourceFilter, setResourceFilter] = useState<string | undefined>(undefined);
  const [actionFilter, setActionFilter] = useState<string | undefined>(undefined);

  const { data, isLoading, error } = useListPermissions({
    page,
    page_size: pageSize,
    search: search || undefined,
    resource_id: resourceFilter,
    action_id: actionFilter,
  });
  const { data: resourcesData } = useListResources();
  const { data: actionsData } = useListActions();

  const clearFilters = () => {
    setSearch('');
    setResourceFilter(undefined);
    setActionFilter(undefined);
    setPage(1);
  };

  const permissionColumns = createPermissionColumns({
    onView: (permission) => navigate(`/admin/permissions/${permission.id}`),
  });

  const listPermissionsResponse: PermissionListResponse | null = data ?? null;
  const permissions = listPermissionsResponse?.data ?? [];
  const hasPermissions = permissions.length > 0;
  const hasActiveFilters = Boolean(search || resourceFilter || actionFilter);

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
              Permissions Management
            </Text>
            <Text variant="muted-inverse">
              View and manage system permissions
            </Text>
          </LayoutUI.Column>
        </LayoutUI.Row>

        <LayoutUI.Row
          justify="justify-between"
          align="items-start"
          className="gap-4 max-xl:flex-col max-xl:items-start"
        >
          {typeof listPermissionsResponse?.total === 'number' ? (
            <Text variant="muted-inverse" className="shrink-0 md:pt-2">
              Showing {(page - 1) * (listPermissionsResponse?.page_size ?? pageSize) + 1} to{' '}
              {Math.min(page * (listPermissionsResponse?.page_size ?? pageSize), listPermissionsResponse.total)} of{' '}
              {listPermissionsResponse.total} permissions
            </Text>
          ) : null}

          <CardUI.Card tone="inverse" border={false} className="w-full flex-1">
            <CardUI.CardContent>
              <LayoutUI.Column gap="gap-4">
                <LayoutUI.Row justify="justify-between" align="items-center" className="gap-4 max-md:flex-col max-md:items-start">
                  <Text variant="inverse" className="font-medium">
                    Filters
                  </Text>
                  {hasActiveFilters ? (
                    <Button onClick={clearFilters} variant="ghost-inverse" size="sm" className="rounded-lg">
                      Clear Filters
                    </Button>
                  ) : null}
                </LayoutUI.Row>

                <LayoutUI.Container className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <SearchField
                    value={search}
                    onChange={(event) => {
                      setSearch(event.target.value);
                      setPage(1);
                    }}
                    placeholder="Search permissions..."
                  />

                  <SelectUI.Select
                    value={resourceFilter || 'all'}
                    onValueChange={(value) => {
                      setResourceFilter(value === 'all' ? undefined : value);
                      setPage(1);
                    }}
                  >
                    <SelectUI.SelectTrigger appearance="admin">
                      <SelectUI.SelectValue>
                        {resourceFilter
                          ? resourcesData?.find((resource) => resource.id === resourceFilter)?.name || 'All Resources'
                          : 'All Resources'}
                      </SelectUI.SelectValue>
                    </SelectUI.SelectTrigger>
                    <SelectUI.SelectContent appearance="admin" className="max-h-[300px]">
                      <SelectUI.SelectItem value="all">All Resources</SelectUI.SelectItem>
                      {resourcesData?.map((resource) => (
                        <SelectUI.SelectItem key={resource.id} value={resource.id}>
                          {resource.name}
                        </SelectUI.SelectItem>
                      ))}
                    </SelectUI.SelectContent>
                  </SelectUI.Select>

                  <SelectUI.Select
                    value={actionFilter || 'all'}
                    onValueChange={(value) => {
                      setActionFilter(value === 'all' ? undefined : value);
                      setPage(1);
                    }}
                  >
                    <SelectUI.SelectTrigger appearance="admin">
                      <SelectUI.SelectValue>
                        {actionFilter
                          ? actionsData?.find((action) => action.id === actionFilter)?.name || 'All Actions'
                          : 'All Actions'}
                      </SelectUI.SelectValue>
                    </SelectUI.SelectTrigger>
                    <SelectUI.SelectContent appearance="admin" className="max-h-[300px]">
                      <SelectUI.SelectItem value="all">All Actions</SelectUI.SelectItem>
                      {actionsData?.map((action) => (
                        <SelectUI.SelectItem key={action.id} value={action.id}>
                          {action.name}
                        </SelectUI.SelectItem>
                      ))}
                    </SelectUI.SelectContent>
                  </SelectUI.Select>
                </LayoutUI.Container>
              </LayoutUI.Column>
            </CardUI.CardContent>
          </CardUI.Card>
        </LayoutUI.Row>
      </LayoutUI.Column>

      {!canListPermissions ? (
        <PermissionsQueryState type="empty" hasActiveFilters={false} />
      ) : null}
      {canListPermissions && isLoading ? <PermissionsQueryState type="loading" hasActiveFilters={hasActiveFilters} /> : null}
      {canListPermissions && !isLoading && error ? <PermissionsQueryState type="error" hasActiveFilters={hasActiveFilters} /> : null}
      {canListPermissions && !isLoading && !error && !hasPermissions ? (
        <PermissionsQueryState type="empty" hasActiveFilters={hasActiveFilters} />
      ) : null}

      {canListPermissions && !isLoading && !error && listPermissionsResponse && hasPermissions ? (
        <LayoutUI.Column>
          <CardUI.Card tone="inverse" className="overflow-hidden">
            <DataTable
              data={permissions}
              columns={permissionColumns}
              rowKey="id"
              emptyMessage="No permissions found."
            />
          </CardUI.Card>

          <DataPagination
            pagination={listPermissionsResponse}
            onPageChange={setPage}
            onPageSizeChange={(value) => {
              setPageSize(value);
              setPage(1);
            }}
          />
        </LayoutUI.Column>
      ) : null}
    </LayoutUI.Column>
  );
}
