"use client";

/**
 * Role Management Page
 *
 * Admin page for managing roles and permissions
 */

import { useEffect, useMemo, useState } from "react";
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
import { Loader2, Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

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
      <div className="space-y-6 p-8">
        {/* Header */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Roles Management</h1>
            <p className="mt-1 text-foreground/60">Manage roles and their permissions</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4" />
            Add Role
          </Button>
        </header>

        {/* Search */}
        <div className="rounded-lg border border-border bg-background p-4">
          <Input
            placeholder="Search roles..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {/* Roles Table */}
        <div className="rounded-lg border border-border bg-background">
          <Table>
            <TableHeader className="bg-surface/60">
              <TableRow>
                <TableHead>Role Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-sm text-foreground/60">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading roles...
                    </div>
                  </TableCell>
                </TableRow>
              ) : data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-foreground/60">
                    No roles found
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{role.name}</span>
                        {role.is_system && (
                          <ShieldCheck className="h-4 w-4 text-blue-500" aria-label="System role" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-foreground/60">
                      {role.description || "—"}
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                          role.is_system
                            ? "bg-blue-500/10 text-blue-600"
                            : "bg-green-500/10 text-green-600"
                        )}
                      >
                        {role.is_system ? "System" : "Custom"}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-foreground/60">
                      {formatDate(role.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleManagePermissions(role)}
                        >
                          <ShieldCheck className="h-4 w-4" />
                          <span className="sr-only">Manage permissions</span>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={role.is_system}
                          onClick={() => handleEdit(role)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit role</span>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          disabled={role.is_system || deleteMutation.isPending}
                          onClick={() => handleDelete(role.id, role.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete role</span>
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
        {data && data.total_pages > 1 && (
          <div className="flex flex-col gap-3 text-sm text-foreground/60 md:flex-row md:items-center md:justify-between">
            <p>
              Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, data.total)} of{" "}
              {data.total} roles
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                Previous
              </Button>
              <span>
                Page {page} of {data.total_pages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(data.total_pages, p + 1))}
                disabled={page === data.total_pages}
              >
                Next
              </Button>
            </div>
          </div>
        )}

        {/* Modals */}
        {showCreateModal && <CreateRoleModal onClose={() => setShowCreateModal(false)} />}
        {showEditModal && selectedRole && (
          <EditRoleModal role={selectedRole} onClose={() => setShowEditModal(false)} />
        )}
        {showPermissionsModal && selectedRole && (
          <ManagePermissionsModal
            role={selectedRole}
            onClose={() => {
              setShowPermissionsModal(false);
            }}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}

function formatDate(value: string) {
  try {
    const date = new Date(value);
    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
    }).format(date);
  } catch {
    return "—";
  }
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
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Create New Role</DialogTitle>
            <DialogDescription>Add a new role for managing access.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="create_role_name">
                Role Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="create_role_name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Content Manager"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="create_role_description">Description</Label>
              <Textarea
                id="create_role_description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the role..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || !name.trim()}>
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Role
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>Update the role name and description.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="edit_role_name">
                Role Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="edit_role_name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Content Manager"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit_role_description">Description</Label>
              <Textarea
                id="edit_role_description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the role..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending || !name.trim()}>
              {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Role
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
  useEffect(() => {
    if (rolePermissions) {
      setSelectedPermissions(new Set(rolePermissions.map((p) => p.id)));
    }
  }, [rolePermissions]);

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

  const filteredPermissions = useMemo(
    () =>
      allPermissions?.data.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [allPermissions?.data, searchTerm]
  );

  // Group permissions by resource
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, PermissionEntity[]> = {};
    filteredPermissions?.forEach((perm) => {
      const resource = perm.name.split(":")[0];
      if (!groups[resource]) {
        groups[resource] = [];
      }
      groups[resource].push(perm);
    });
    return groups;
  }, [filteredPermissions]);

  const isLoading = loadingAll || loadingRole;

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Manage Permissions</DialogTitle>
          <DialogDescription>Set which permissions should be granted to {role.name}.</DialogDescription>
        </DialogHeader>

        <Input
          placeholder="Search permissions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="max-h-96 space-y-4 overflow-y-auto rounded-lg border border-border p-4">
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 text-sm text-foreground/60">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading permissions...
            </div>
          ) : Object.keys(groupedPermissions).length === 0 ? (
            <p className="text-center text-sm text-foreground/60">No permissions found.</p>
          ) : (
            Object.entries(groupedPermissions).map(([resource, perms]) => (
              <div key={resource}>
                <h3 className="mb-2 text-sm font-semibold capitalize">{resource}</h3>
                <div className="space-y-1">
                  {perms.map((perm) => (
                    <label
                      key={perm.id}
                      className="flex items-start gap-2 rounded-md px-2 py-2 hover:bg-surface/60"
                    >
                      <Checkbox
                        checked={selectedPermissions.has(perm.id)}
                        onCheckedChange={() => handleTogglePermission(perm.id)}
                        id={`perm-${perm.id}`}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium leading-none">{perm.name}</p>
                        {perm.description && (
                          <p className="mt-1 text-xs text-foreground/60">{perm.description}</p>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <DialogFooter className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-foreground/60">
            {selectedPermissions.size} permission(s) selected
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={assignMutation.isPending}>
              {assignMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Permissions
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
