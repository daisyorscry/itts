"use client";

/**
 * Profile Settings Page
 *
 * User profile management and settings
 */

import { useState } from "react";
import { useAuth, useChangePassword, useUpdateProfile, RoleBadge, UserAvatar } from "@/feature/auth";
import { HiPencil, HiCheck, HiXMark, HiShieldCheck, HiKey, HiUser } from "react-icons/hi2";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-foreground/60">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="mt-1 text-foreground/60">
          Manage your account settings and preferences
        </p>
      </header>

      {/* Profile Card */}
      <div className="rounded-lg border border-border bg-background p-6">
        <div className="flex items-start gap-4">
          <UserAvatar user={user} size="lg" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{user.full_name}</h2>
              {user.is_super_admin && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-600 dark:text-red-400">
                  <HiShieldCheck className="h-3 w-3" />
                  Super Admin
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-foreground/60">{user.email}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {user.roles && user.roles.length > 0 ? (
                user.roles.map((role) => (
                  <RoleBadge key={role.id} roleName={role.name} />
                ))
              ) : (
                <span className="text-xs text-foreground/40">No roles assigned</span>
              )}
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="mt-6 grid gap-4 border-t border-border pt-6 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-foreground/60">Account Status</p>
            <span
              className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                user.is_active
                  ? "bg-green-500/10 text-green-600 dark:text-green-400"
                  : "bg-red-500/10 text-red-600 dark:text-red-400"
              }`}
            >
              {user.is_active ? "Active" : "Inactive"}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground/60">Last Login</p>
            <p className="mt-1 text-sm">
              {user.last_login_at
                ? new Date(user.last_login_at).toLocaleString()
                : "Never"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground/60">Account Created</p>
            <p className="mt-1 text-sm">
              {new Date(user.created_at).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground/60">Permissions</p>
            <p className="mt-1 text-sm">
              {user.permissions && user.permissions.length > 0
                ? `${user.permissions.length} permission(s)`
                : "No permissions"}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Profile Section */}
      <EditProfileSection user={user} />

      {/* Change Password Section */}
      <ChangePasswordSection />
    </div>
  );
}

// ============================================================================
// EDIT PROFILE SECTION
// ============================================================================

function EditProfileSection({ user }: { user: any }) {
  const [isEditing, setIsEditing] = useState(false);
  const [email, setEmail] = useState(user.email);
  const [fullName, setFullName] = useState(user.full_name);

  const updateProfileMutation = useUpdateProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const hasChanges = email !== user.email || fullName !== user.full_name;
    if (!hasChanges) {
      toast.info("No changes to save");
      setIsEditing(false);
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        email: email !== user.email ? email : undefined,
        full_name: fullName !== user.full_name ? fullName : undefined,
      });
      setIsEditing(false);
    } catch (error) {
      // Error already handled by mutation
    }
  };

  const handleCancel = () => {
    setEmail(user.email);
    setFullName(user.full_name);
    setIsEditing(false);
  };

  return (
    <div className="rounded-lg border border-border bg-background p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HiUser className="h-5 w-5 text-foreground/60" />
          <h3 className="text-lg font-bold">Profile Information</h3>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 rounded-md bg-surface px-3 py-1.5 text-sm font-medium hover:bg-surface/80"
          >
            <HiPencil className="h-4 w-4" />
            Edit Profile
          </button>
        )}
      </div>

      {isEditing ? (
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
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <HiCheck className="h-4 w-4" />
              {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={updateProfileMutation.isPending}
              className="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
            >
              <HiXMark className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-foreground/60">Email</p>
            <p className="mt-1 text-sm">{user.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground/60">Full Name</p>
            <p className="mt-1 text-sm">{user.full_name}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CHANGE PASSWORD SECTION
// ============================================================================

function ChangePasswordSection() {
  const [isEditing, setIsEditing] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const changePasswordMutation = useChangePassword();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        old_password: oldPassword,
        new_password: newPassword,
      });

      // Reset form
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsEditing(false);
    } catch (error) {
      // Error already handled by mutation
    }
  };

  const handleCancel = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setIsEditing(false);
  };

  return (
    <div className="rounded-lg border border-border bg-background p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <HiKey className="h-5 w-5 text-foreground/60" />
          <h3 className="text-lg font-bold">Change Password</h3>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 rounded-md bg-surface px-3 py-1.5 text-sm font-medium hover:bg-surface/80"
          >
            <HiPencil className="h-4 w-4" />
            Change Password
          </button>
        )}
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Old Password */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Current Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          {/* New Password */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              New Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 8 characters"
              minLength={8}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              minLength={8}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <HiCheck className="h-4 w-4" />
              {changePasswordMutation.isPending ? "Saving..." : "Save Password"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={changePasswordMutation.isPending}
              className="flex items-center gap-2 rounded-md border border-border px-4 py-2 text-sm hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
            >
              <HiXMark className="h-4 w-4" />
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-foreground/60">
          Click "Change Password" to update your password. Make sure to use a strong password with at least 8 characters.
        </p>
      )}
    </div>
  );
}
