"use client";

/**
 * User Management Components
 *
 * Modal components for creating and editing users
 */

import { useState, useEffect } from "react";
import { HiXMark } from "react-icons/hi2";
import {
  useCreateUser,
  useUpdateUser,
  useListRoles,
  useAssignRoles,
} from "@/feature/auth";
import type { User } from "@/feature/auth/adapter";

// ============================================================================
// CREATE USER MODAL
// ============================================================================

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateUserModal({ isOpen, onClose }: CreateUserModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const createMutation = useCreateUser();
  const { data: rolesData } = useListRoles({ page: 1, page_size: 100 });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || !fullName.trim()) return;

    await createMutation.mutateAsync({
      email: email.trim(),
      password: password.trim(),
      full_name: fullName.trim(),
      is_active: isActive,
      is_super_admin: isSuperAdmin,
      role_ids: selectedRoles,
    });

    // Reset form
    setEmail("");
    setPassword("");
    setFullName("");
    setIsActive(true);
    setIsSuperAdmin(false);
    setSelectedRoles([]);
    onClose();
  };

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-background p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Create New User</h2>
          <button onClick={onClose} className="rounded p-1 hover:bg-surface">
            <HiXMark className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              minLength={8}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          {/* Full Name */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          {/* Toggles */}
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium">Active</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isSuperAdmin}
                onChange={(e) => setIsSuperAdmin(e.target.checked)}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium">Super Admin</span>
            </label>
          </div>

          {/* Roles */}
          <div>
            <label className="mb-2 block text-sm font-medium">Roles</label>
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-border p-3">
              {rolesData?.data.map((role) => (
                <label
                  key={role.id}
                  className="flex items-center gap-2 rounded p-2 hover:bg-surface/50"
                >
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role.id)}
                    onChange={() => handleRoleToggle(role.id)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{role.name}</p>
                    {role.description && (
                      <p className="text-xs text-foreground/60">
                        {role.description}
                      </p>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-4 py-2 text-sm hover:bg-surface"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                createMutation.isPending ||
                !email.trim() ||
                !password.trim() ||
                !fullName.trim()
              }
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createMutation.isPending ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// EDIT USER MODAL
// ============================================================================

interface EditUserModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export function EditUserModal({ user, isOpen, onClose }: EditUserModalProps) {
  const [email, setEmail] = useState(user.email);
  const [fullName, setFullName] = useState(user.full_name);
  const [isActive, setIsActive] = useState(user.is_active);
  const [selectedRoles, setSelectedRoles] = useState<string[]>(
    user.roles?.map((r) => r.id) || []
  );
  const [showRoleModal, setShowRoleModal] = useState(false);

  const updateMutation = useUpdateUser();
  const assignRolesMutation = useAssignRoles();
  const { data: rolesData } = useListRoles({ page: 1, page_size: 100 });

  // Update state when user changes
  useEffect(() => {
    setEmail(user.email);
    setFullName(user.full_name);
    setIsActive(user.is_active);
    setSelectedRoles(user.roles?.map((r) => r.id) || []);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Update basic info
    const hasChanges =
      email !== user.email ||
      fullName !== user.full_name ||
      isActive !== user.is_active;

    if (hasChanges) {
      await updateMutation.mutateAsync({
        userId: user.id,
        data: {
          email: email !== user.email ? email.trim() : undefined,
          full_name: fullName !== user.full_name ? fullName.trim() : undefined,
          is_active: isActive !== user.is_active ? isActive : undefined,
        },
      });
    }

    onClose();
  };

  const handleRolesUpdate = async () => {
    await assignRolesMutation.mutateAsync({
      userId: user.id,
      data: { role_ids: selectedRoles },
    });
    setShowRoleModal(false);
  };

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="w-full max-w-lg rounded-lg bg-background p-6 shadow-xl">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Edit User</h2>
            <button onClick={onClose} className="rounded p-1 hover:bg-surface">
              <HiXMark className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="mb-1 block text-sm font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            {/* Full Name */}
            <div>
              <label className="mb-1 block text-sm font-medium">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>

            {/* Active Status */}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                disabled={user.is_super_admin}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
              />
              <span className="text-sm font-medium">Active</span>
            </label>

            {/* Roles */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium">Roles</label>
                <button
                  type="button"
                  onClick={() => setShowRoleModal(true)}
                  className="text-xs text-primary hover:underline"
                >
                  Manage Roles
                </button>
              </div>
              <div className="rounded-lg border border-border p-3">
                {user.roles && user.roles.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {user.roles.map((role) => (
                      <span
                        key={role.id}
                        className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                      >
                        {role.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-foreground/40">No roles assigned</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-border px-4 py-2 text-sm hover:bg-surface"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Roles Management Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-background p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Manage User Roles</h3>
              <button
                onClick={() => setShowRoleModal(false)}
                className="rounded p-1 hover:bg-surface"
              >
                <HiXMark className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 max-h-96 space-y-1 overflow-y-auto rounded-lg border border-border p-3">
              {rolesData?.data.map((role) => (
                <label
                  key={role.id}
                  className="flex items-center gap-2 rounded p-2 hover:bg-surface/50"
                >
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role.id)}
                    onChange={() => handleRoleToggle(role.id)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{role.name}</p>
                    {role.description && (
                      <p className="text-xs text-foreground/60">
                        {role.description}
                      </p>
                    )}
                  </div>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRoleModal(false)}
                className="rounded-md border border-border px-4 py-2 text-sm hover:bg-surface"
              >
                Cancel
              </button>
              <button
                onClick={handleRolesUpdate}
                disabled={assignRolesMutation.isPending}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {assignRolesMutation.isPending ? "Saving..." : "Save Roles"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
