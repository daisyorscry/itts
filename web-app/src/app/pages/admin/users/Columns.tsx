import * as Icons from 'lucide-react';
import { Badge } from '@components/ui/badge';
import { Button } from '@components/ui/button';
import * as DropdownMenuUI from '@components/ui/dropdown-menu';
import * as LayoutUI from '@components/ui/layout';
import { Text } from '@components/ui/text';
import { type DataTableColumn } from '@components/ui/table';
import { formatLastLoginDate } from '@utility/date';
import type { User } from '@feature/user/types';


interface UserActionsMenuProps {
  user: User;
  canUpdate: boolean;
  canDelete: boolean;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

interface CreateUserColumnsOptions {
  canUpdate: boolean;
  canDelete: boolean;
  onView: (user: User) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

function UserActionsMenu({
  user,
  canUpdate,
  canDelete,
  onView,
  onEdit,
  onDelete,
}: UserActionsMenuProps) {
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
            onClick={() => onView(user)}
          >
            <Icons.Eye className="text-black/70" />
            View Details
          </DropdownMenuUI.DropdownMenuItem>

          {canUpdate ? (
            <DropdownMenuUI.DropdownMenuItem
              className="rounded-lg px-3 py-2.5 text-[#04090C] focus:bg-black/5 focus:text-[#04090C]"
              onClick={() => onEdit(user)}
            >
              <Icons.Edit className="text-black/70" />
              Edit User
            </DropdownMenuUI.DropdownMenuItem>
          ) : null}

          {!user.is_super_admin && canDelete ? (
            <>
              <DropdownMenuUI.DropdownMenuSeparator className="my-1.5 bg-black/10" />
              <DropdownMenuUI.DropdownMenuItem
                variant="destructive"
                className="rounded-lg px-3 py-2.5"
                onClick={() => onDelete(user)}
              >
                <Icons.Trash2 />
                Delete User
              </DropdownMenuUI.DropdownMenuItem>
            </>
          ) : null}
        </DropdownMenuUI.DropdownMenuContent>
      </DropdownMenuUI.DropdownMenu>
    </LayoutUI.Row>
  );
}

export function createUserColumns({
  canUpdate,
  canDelete,
  onView,
  onEdit,
  onDelete,
}: CreateUserColumnsOptions): Array<DataTableColumn<User>> {
  return [
    {
      id: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <LayoutUI.Column gap="gap-1">
          <Text variant="inverse" className="font-medium">
            {row.full_name}
          </Text>
        </LayoutUI.Column>
      ),
    },
    {
      id: 'email',
      header: 'Email',
      cell: ({ row }) => <Text variant="muted-inverse">{row.email}</Text>,
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge
          variant={row.is_active ? 'success' : 'destructive'}
          className="rounded-full px-2 py-1 [&>svg]:size-3.5"
        >
          {row.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      id: 'roles',
      header: 'Roles',
      cell: ({ row }) => (
        <Text variant="muted-inverse">
          {row.roles && row.roles.length > 0
            ? `${row.roles.length} role${row.roles.length > 1 ? 's' : ''}`
            : 'No roles'}
        </Text>
      ),
    },
    {
      id: 'last_login',
      header: 'Last Login',
      cell: ({ row }) => <Text variant="muted-inverse">{formatLastLoginDate(row.last_login_at)}</Text>,
    },
    {
      id: 'actions',
      header: 'Actions',
      align: 'right',
      cell: ({ row }) => (
        <UserActionsMenu
          user={row}
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
