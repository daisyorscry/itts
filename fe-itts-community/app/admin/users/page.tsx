"use client";

/**
 * User Management Page
 *
 * Admin page for managing users, roles, and permissions
 */

import { useState } from "react";
import { ProtectedRoute, PERMISSIONS, useListUsers, useDeleteUser, RoleBadge, UserAvatar } from "@/feature/auth";
import type { User } from "@/feature/auth/adapter";
import { HiPlus, HiPencil, HiTrash, HiShieldCheck } from "react-icons/hi2";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { CreateUserModal, EditUserModal } from "./_components";

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const pageSize = 10;

  const { data, isLoading } = useListUsers({ page, page_size: pageSize, search: search || undefined });
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

  return (
    <ProtectedRoute anyPermissions={[PERMISSIONS.USERS_LIST, PERMISSIONS.USERS_READ]}>
      <div className="space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Users Management</h1>
            <p className="mt-1 text-foreground/60">
              Manage admin users, roles, and permissions
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            <HiPlus className="h-4 w-4" />
            <span>Add User</span>
          </button>
        </header>

        {/* Search */}
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-md border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Users Table */}
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full">
            <thead className="bg-surface">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground/80">
                  User
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground/80">
                  Roles
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground/80">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground/80">
                  Last Login
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-foreground/80">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-foreground/60">
                    Loading users...
                  </td>
                </tr>
              ) : data?.data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-foreground/60">
                    No users found
                  </td>
                </tr>
              ) : (
                data?.data.map((user) => (
                  <tr key={user.id} className="hover:bg-surface/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <UserAvatar user={user} size="sm" />
                        <div>
                          <p className="text-sm font-medium">{user.full_name}</p>
                          <p className="text-xs text-foreground/60">{user.email}</p>
                        </div>
                        {user.is_super_admin && (
                          <HiShieldCheck className="h-5 w-5 text-red-500" title="Super Admin" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {user.roles && user.roles.length > 0 ? (
                          user.roles.map((role) => (
                            <RoleBadge key={role.id} roleName={role.name} />
                          ))
                        ) : (
                          <span className="text-xs text-foreground/40">No roles</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          user.is_active
                            ? "bg-green-500/10 text-green-600 dark:text-green-400"
                            : "bg-red-500/10 text-red-600 dark:text-red-400"
                        }`}
                      >
                        {user.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground/60">
                      {user.last_login_at
                        ? new Date(user.last_login_at).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(user)}
                          className="rounded p-1.5 hover:bg-surface"
                          title="Edit user"
                        >
                          <HiPencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(user)}
                          disabled={user.is_super_admin}
                          className="rounded p-1.5 text-red-600 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                          title={user.is_super_admin ? "Cannot delete super admin" : "Delete user"}
                        >
                          <HiTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.total_pages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-foreground/60">
              Showing {(page - 1) * pageSize + 1} to{" "}
              {Math.min(page * pageSize, data.total)} of {data.total} users
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 text-sm">
                Page {page} of {data.total_pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
                disabled={page === data.total_pages}
                className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
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
          message={`Are you sure you want to delete "${selectedUser?.full_name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          isLoading={deleteMutation.isPending}
        />
      </div>
    </ProtectedRoute>
  );
}
