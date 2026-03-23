import * as Icons from 'lucide-react';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import * as LayoutUI from '@components/ui/layout';
import { Text } from '@components/ui/text';
import { type DataTableColumn } from '@components/ui/table';
import type { Permission } from '@feature/permission/types';

interface CreatePermissionColumnsOptions {
  onView: (permission: Permission) => void;
}

export function createPermissionColumns({
  onView,
}: CreatePermissionColumnsOptions): Array<DataTableColumn<Permission>> {
  return [
    {
      id: 'permission',
      header: 'Permission',
      cell: ({ row }) => (
        <Text variant="inverse" className="font-mono text-sm font-semibold">
          {row.name}
        </Text>
      ),
    },
    {
      id: 'resource',
      header: 'Resource',
      cell: ({ row }) => (
        <Badge className="border border-blue-500/30 bg-blue-500/10 text-blue-500">
          {row.resource.name}
        </Badge>
      ),
    },
    {
      id: 'action',
      header: 'Action',
      cell: ({ row }) => (
        <Badge className="border border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-500">
          {row.action.name}
        </Badge>
      ),
    },
    {
      id: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <Text variant="muted-inverse">
          {row.description}
        </Text>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      cell: ({ row }) => (
        <LayoutUI.Row justify="justify-end" className="w-full">
          <Button onClick={() => onView(row)} variant="ghost-inverse" size="sm" className="rounded-lg">
            <Icons.Eye className="size-4" />
            View
          </Button>
        </LayoutUI.Row>
      ),
    },
  ];
}
