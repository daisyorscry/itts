"use client";

/**
 * Role Management Page
 *
 * Admin page for managing roles and permissions
 */

import { useState } from "react";
import {
  ProtectedRoute,
  PERMISSIONS,
  useListRoles,
  useDeleteRole,
  useListPermissions,
  useGetRolePermissions,
  useAssignPermissions,
  useCreateRole,
  useUpdateRole,
} from "@/feature/auth";
import type { Role, PermissionEntity } from "@/feature/auth/adapter";
import { HiPlus, HiPencil, HiTrash, HiShieldCheck, HiXMark } from "react-icons/hi2";

export default function AdminRolesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const pageSize = 10;

  const { data, isLoading } = useListRoles({ page, page_size: pageSize, search: search || undefined });
  const deleteMutation = useDeleteRole();

  const handleDelete = (roleId: string, roleName: string) => {
    if (confirm(`Are you sure you want to delete role "${roleName}"?`)) {
      deleteMutation.mutate(roleId);
    }
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setShowEditModal(true);
  };

  const handleManagePermissions = (role: Role) => {
    setSelectedRole(role);
    setShowPermissionsModal(true);
  };

  return (
    <ProtectedRoute anyPermissions={[PERMISSIONS.ROLES_LIST, PERMISSIONS.ROLES_READ]}>
      <div className="space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Roles Management</h1>
            <p className="mt-1 text-foreground/60">
              Manage roles and their permissions
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
          >
            <HiPlus className="h-4 w-4" />
            <span>Add Role</span>
          </button>
        </header>

        {/* Search */}
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search roles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 rounded-md border border-border bg-background px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Roles Table */}
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full">
            <thead className="bg-surface">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground/80">
                  Role Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground/80">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground/80">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground/80">
                  Created At
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
                    Loading roles...
                  </td>
                </tr>
              ) : data?.data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-foreground/60">
                    No roles found
                  </td>
                </tr>
              ) : (
                data?.data.map((role) => (
                  <tr key={role.id} className="hover:bg-surface/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{role.name}</span>
                        {role.is_system && (
                          <HiShieldCheck className="h-4 w-4 text-blue-500" title="System Role" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-foreground/60">
                        {role.description || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          role.is_system
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            : "bg-green-500/10 text-green-600 dark:text-green-400"
                        }`}
                      >
                        {role.is_system ? "System" : "Custom"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground/60">
                      {new Date(role.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleManagePermissions(role)}
                          className="rounded p-1.5 text-blue-600 hover:bg-blue-500/10"
                          title="Manage permissions"
                        >
                          <HiShieldCheck className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(role)}
                          disabled={role.is_system}
                          className="rounded p-1.5 hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
                          title={role.is_system ? "Cannot edit system role" : "Edit role"}
                        >
                          <HiPencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(role.id, role.name)}
                          disabled={role.is_system || deleteMutation.isPending}
                          className="rounded p-1.5 text-red-600 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                          title={role.is_system ? "Cannot delete system role" : "Delete role"}
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
              {Math.min(page * pageSize, data.total)} of {data.total} roles
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
        {showCreateModal && (
          <CreateRoleModal onClose={() => setShowCreateModal(false)} />
        )}
        {showEditModal && selectedRole && (
          <EditRoleModal role={selectedRole} onClose={() => setShowEditModal(false)} />
        )}
        {showPermissionsModal && selectedRole && (
          <ManagePermissionsModal
            role={selectedRole}
            onClose={() => setShowPermissionsModal(false)}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}

// ============================================================================
// CREATE ROLE MODAL
// ============================================================================

function CreateRoleModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const createMutation = useCreateRole();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await createMutation.mutateAsync({
      name: name.trim(),
      description: description.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Create New Role</h2>
          <button onClick={onClose} className="rounded p-1 hover:bg-surface">
            <HiXMark className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Role Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Content Manager"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the role..."
              rows={3}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-4 py-2 text-sm hover:bg-surface"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isPending || !name.trim()}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createMutation.isPending ? "Creating..." : "Create Role"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// EDIT ROLE MODAL
// ============================================================================

function EditRoleModal({ role, onClose }: { role: Role; onClose: () => void }) {
  const [name, setName] = useState(role.name);
  const [description, setDescription] = useState(role.description || "");
  const updateMutation = useUpdateRole();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await updateMutation.mutateAsync({
      roleId: role.id,
      data: {
        name: name.trim(),
        description: description.trim() || undefined,
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Edit Role</h2>
          <button onClick={onClose} className="rounded p-1 hover:bg-surface">
            <HiXMark className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Role Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Content Manager"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the role..."
              rows={3}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-4 py-2 text-sm hover:bg-surface"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending || !name.trim()}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updateMutation.isPending ? "Updating..." : "Update Role"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// MANAGE PERMISSIONS MODAL
// ============================================================================

function ManagePermissionsModal({ role, onClose }: { role: Role; onClose: () => void }) {
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  const { data: allPermissions, isLoading: loadingAll } = useListPermissions({ page: 1, page_size: 1000 });
  const { data: rolePermissions, isLoading: loadingRole } = useGetRolePermissions(role.id);
  const assignMutation = useAssignPermissions();

  // Initialize selected permissions when role permissions load
  useState(() => {
    if (rolePermissions) {
      setSelectedPermissions(new Set(rolePermissions.map((p) => p.id)));
    }
  });

  const handleTogglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(permissionId)) {
        next.delete(permissionId);
      } else {
        next.add(permissionId);
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    await assignMutation.mutateAsync({
      roleId: role.id,
      data: { permission_ids: Array.from(selectedPermissions) },
    });
    onClose();
  };

  const filteredPermissions = allPermissions?.data.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group permissions by resource
  const groupedPermissions: Record<string, PermissionEntity[]> = {};
  filteredPermissions?.forEach((perm) => {
    const resource = perm.name.split(":")[0];
    if (!groupedPermissions[resource]) {
      groupedPermissions[resource] = [];
    }
    groupedPermissions[resource].push(perm);
  });

  const isLoading = loadingAll || loadingRole;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-2xl rounded-lg bg-background p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Manage Permissions</h2>
            <p className="text-sm text-foreground/60">Role: {role.name}</p>
          </div>
          <button onClick={onClose} className="rounded p-1 hover:bg-surface">
            <HiXMark className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search permissions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Permissions List */}
        <div className="mb-4 max-h-96 space-y-4 overflow-y-auto rounded-lg border border-border p-4">
          {isLoading ? (
            <p className="text-center text-sm text-foreground/60">Loading permissions...</p>
          ) : (
            Object.entries(groupedPermissions).map(([resource, perms]) => (
              <div key={resource}>
                <h3 className="mb-2 text-sm font-semibold capitalize">{resource}</h3>
                <div className="space-y-1">
                  {perms.map((perm) => (
                    <label
                      key={perm.id}
                      className="flex items-center gap-2 rounded p-2 hover:bg-surface/50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.has(perm.id)}
                        onChange={() => handleTogglePermission(perm.id)}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{perm.name}</p>
                        {perm.description && (
                          <p className="text-xs text-foreground/60">{perm.description}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-foreground/60">
            {selectedPermissions.size} permission(s) selected
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-4 py-2 text-sm hover:bg-surface"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={assignMutation.isPending}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {assignMutation.isPending ? "Saving..." : "Save Permissions"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
