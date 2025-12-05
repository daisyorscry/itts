"use client";

/**
 * User Management Components
 *
 * Modal components for creating and editing users
 */

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  useCreateUser,
  useUpdateUser,
  useListRoles,
  useAssignRoles,
} from "@/feature/auth";
import type { User, Role } from "@/feature/auth/adapter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

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

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>Invite a new admin and assign their access.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="create_email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="create_email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="create_password">
                Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="create_password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                minLength={8}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="create_full_name">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="create_full_name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="flex flex-col gap-3 rounded-lg border border-dashed border-border p-3">
              <Label className="text-sm font-semibold">Status</Label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Checkbox
                    checked={isActive}
                    onCheckedChange={(checked) => setIsActive(Boolean(checked))}
                  />
                  Active
                </label>
                <label className="flex items-center gap-2 text-sm font-medium">
                  <Checkbox
                    checked={isSuperAdmin}
                    onCheckedChange={(checked) => setIsSuperAdmin(Boolean(checked))}
                  />
                  Super Admin
                </label>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Roles</Label>
              <RolesChecklist
                roles={rolesData?.data ?? []}
                selectedRoleIds={selectedRoles}
                onToggle={handleRoleToggle}
                emptyText="No roles available"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                createMutation.isPending ||
                !email.trim() ||
                !password.trim() ||
                !fullName.trim()
              }
            >
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create User
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
      >
        <DialogContent className="max-w-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>Update account information and status.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit_email">Email</Label>
                <Input
                  id="edit_email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit_full_name">Full Name</Label>
                <Input
                  id="edit_full_name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-dashed border-border p-3">
                <Checkbox
                  checked={isActive}
                  onCheckedChange={(checked) => setIsActive(Boolean(checked))}
                  disabled={user.is_super_admin}
                  id="edit_active"
                />
                <Label
                  htmlFor="edit_active"
                  className={`text-sm font-medium ${
                    user.is_super_admin ? "opacity-60" : ""
                  }`}
                >
                  Active
                </Label>
              </div>

              <div className="rounded-lg border border-border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <Label className="text-sm font-medium">Roles</Label>
                  <Button type="button" variant="link" size="sm" onClick={() => setShowRoleModal(true)}>
                    Manage Roles
                  </Button>
                </div>
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
                  <p className="text-sm text-foreground/60">No roles assigned</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showRoleModal} onOpenChange={setShowRoleModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage User Roles</DialogTitle>
            <DialogDescription>Choose which roles should apply to this user.</DialogDescription>
          </DialogHeader>

          <RolesChecklist
            roles={rolesData?.data ?? []}
            selectedRoleIds={selectedRoles}
            onToggle={handleRoleToggle}
            emptyText="No roles available"
            listClassName="max-h-72"
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowRoleModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleRolesUpdate} disabled={assignRolesMutation.isPending}>
              {assignRolesMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Roles
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

type RolesChecklistProps = {
  roles: Role[];
  selectedRoleIds: string[];
  onToggle: (roleId: string) => void;
  emptyText?: string;
  className?: string;
  listClassName?: string;
};

function RolesChecklist({
  roles,
  selectedRoleIds,
  onToggle,
  emptyText = "No roles available",
  className,
  listClassName,
}: RolesChecklistProps) {
  if (!roles.length) {
    return (
      <div
        className={cn(
          "rounded-lg border border-dashed border-border p-4 text-sm text-foreground/60",
          className
        )}
      >
        {emptyText}
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border border-border p-3", className)}>
      <div className={cn("space-y-2 max-h-60 overflow-y-auto pr-1", listClassName)}>
        {roles.map((role) => (
          <label
            key={role.id}
            className="flex cursor-pointer items-start gap-3 rounded-md px-2 py-2 hover:bg-surface/60"
          >
            <Checkbox
              checked={selectedRoleIds.includes(role.id)}
              onCheckedChange={() => onToggle(role.id)}
              id={`role-${role.id}`}
            />
            <div className="flex-1">
              <p className="text-sm font-medium leading-none">{role.name}</p>
              {role.description && (
                <p className="mt-1 text-xs text-foreground/60">{role.description}</p>
              )}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
}
