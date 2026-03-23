import * as Icons from 'lucide-react';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import * as DropdownMenuUI from '@components/ui/dropdown-menu';
import * as LayoutUI from '@components/ui/layout';
import { Text } from '@components/ui/text';
import { type DataTableColumn } from '@components/ui/table';
import type { Role } from '@feature/role/types';

interface RoleActionsMenuProps {
  role: Role;
  canUpdate: boolean;
  canDelete: boolean;
  onView: (role: Role) => void;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
}

interface CreateRoleColumnsOptions {
  canUpdate: boolean;
  canDelete: boolean;
  onView: (role: Role) => void;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
}

function RoleActionsMenu({
  role,
  canUpdate,
  canDelete,
  onView,
  onEdit,
  onDelete,
}: RoleActionsMenuProps) {
  return (
    <LayoutUI.Row justify="justify-end" className="w-full">
      <DropdownMenuUI.DropdownMenu>
        <DropdownMenuUI.DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-lg text-black/60 hover:bg-black/10 hover:text-[#04090C]"
          >
            <Icons.MoreVertical className="size-4" />
          </Button>
        </DropdownMenuUI.DropdownMenuTrigger>

        <DropdownMenuUI.DropdownMenuContent
          align="end"
          className="w-48 rounded-xl border-black/10 bg-[#F7F4EC] p-1.5"
        >
          <DropdownMenuUI.DropdownMenuItem
            className="rounded-lg px-3 py-2.5 text-[#04090C] focus:bg-black/5 focus:text-[#04090C]"
            onClick={() => onView(role)}
          >
            <Icons.Eye className="text-black/70" />
            View Details
          </DropdownMenuUI.DropdownMenuItem>

          {!role.is_system && canUpdate ? (
            <DropdownMenuUI.DropdownMenuItem
              className="rounded-lg px-3 py-2.5 text-[#04090C] focus:bg-black/5 focus:text-[#04090C]"
              onClick={() => onEdit(role)}
            >
              <Icons.Edit className="text-black/70" />
              Edit Role
            </DropdownMenuUI.DropdownMenuItem>
          ) : null}

          {!role.is_system && canDelete ? (
            <>
              <DropdownMenuUI.DropdownMenuSeparator className="my-1.5 bg-black/10" />
              <DropdownMenuUI.DropdownMenuItem
                variant="destructive"
                className="rounded-lg px-3 py-2.5"
                onClick={() => onDelete(role)}
              >
                <Icons.Trash2 />
                Delete Role
              </DropdownMenuUI.DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuUI.DropdownMenuContent>
      </DropdownMenuUI.DropdownMenu>
    </LayoutUI.Row>
  );
}

export function createRoleColumns({
  canUpdate,
  canDelete,
  onView,
  onEdit,
  onDelete,
}: CreateRoleColumnsOptions): Array<DataTableColumn<Role>> {
  return [
    {
      id: 'name',
      header: 'Role Name',
      cell: ({ row }) => (
        <LayoutUI.Row gap="gap-2" className="flex-wrap">
          <Text variant="inverse" className="font-medium">
            {row.name}
          </Text>
          {row.is_system ? <Badge variant="success">System</Badge> : null}
        </LayoutUI.Row>
      ),
    },
    {
      id: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <Text variant="muted-inverse" className="max-w-lg line-clamp-2">
          {row.description}
        </Text>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      cell: ({ row }) => (
        <RoleActionsMenu
          role={row}
          canUpdate={canUpdate}
          canDelete={canDelete}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ),
    },
  ];
}
