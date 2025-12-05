"use client";

/**
 * User Management Page
 *
 * Admin page for managing users, roles, and permissions
 */

import { useMemo, useState } from "react";
import {
  ProtectedRoute,
  PERMISSIONS,
  useListUsers,
  useDeleteUser,
  RoleBadge,
  UserAvatar,
} from "@/feature/auth";
import type { User } from "@/feature/auth/adapter";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { CreateUserModal, EditUserModal } from "./_components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table-shadcn";
import { Loader2, Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const pageSize = 10;

  const { data, isLoading } = useListUsers({
    page,
    page_size: pageSize,
    search: search || undefined,
  });
  const deleteMutation = useDeleteUser();

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedUser) {
      deleteMutation.mutate(selectedUser.id);
      setShowDeleteDialog(false);
      setSelectedUser(null);
    }
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const users = data?.data ?? [];
  const totalUsers = data?.total ?? 0;
  const totalPages = data?.total_pages ?? 1;
  const pageStart = useMemo(() => (page - 1) * pageSize + 1, [page, pageSize]);
  const pageEnd = useMemo(
    () => Math.min(page * pageSize, totalUsers),
    [page, pageSize, totalUsers]
  );

  return (
    <ProtectedRoute anyPermissions={[PERMISSIONS.USERS_LIST, PERMISSIONS.USERS_READ]}>
      <div className="space-y-6 p-8">
        {/* Header */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Users Management</h1>
            <p className="mt-1 text-foreground/60">Manage admin users, roles, and permissions</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4" />
            Add User
          </Button>
        </header>

        {/* Search */}
        <div className="rounded-lg border border-border bg-background p-4">
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Users Table */}
        <div className="rounded-lg border border-border bg-background">
          <Table>
            <TableHeader className="bg-surface/60">
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-foreground/60">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading users...
                    </div>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-foreground/60">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <UserAvatar user={user} size="sm" />
                        <div>
                          <p className="font-medium">{user.full_name}</p>
                          <p className="text-sm text-foreground/60">{user.email}</p>
                        </div>
                        {user.is_super_admin && (
                          <ShieldCheck className="h-4 w-4 text-red-500" aria-label="Super Admin" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles && user.roles.length > 0 ? (
                          user.roles.map((role) => <RoleBadge key={role.id} roleName={role.name} />)
                        ) : (
                          <span className="text-xs text-foreground/40">No roles</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge active={user.is_active} />
                    </TableCell>
                    <TableCell className="text-sm text-foreground/60">
                      {formatLastLogin(user.last_login_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(user)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit user</span>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteClick(user)}
                          disabled={user.is_super_admin}
                          title={user.is_super_admin ? "Cannot delete super admin" : undefined}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete user</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col gap-3 text-sm text-foreground/60 md:flex-row md:items-center md:justify-between">
            <p>
              Showing {pageStart} to {pageEnd} of {totalUsers} users
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                Previous
              </Button>
              <span>
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Modals */}
        <CreateUserModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />

        {selectedUser && (
          <EditUserModal
            user={selectedUser}
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setSelectedUser(null);
            }}
          />
        )}

        <ConfirmDialog
          isOpen={showDeleteDialog}
          onClose={() => {
            setShowDeleteDialog(false);
            setSelectedUser(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Delete User"
          message={
            selectedUser
              ? `Are you sure you want to delete "${selectedUser.full_name}"? This action cannot be undone.`
              : "Are you sure you want to delete this user?"
          }
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          isLoading={deleteMutation.isPending}
        />
      </div>
    </ProtectedRoute>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        active ? "bg-green-500/10 text-green-700" : "bg-red-500/10 text-red-700"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </span>
  );
}

function formatLastLogin(value?: string | null) {
  if (!value) return "Never";
  try {
    const date = new Date(value);
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date);
  } catch {
    return "Never";
  }
}
