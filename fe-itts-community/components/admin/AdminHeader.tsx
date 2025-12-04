"use client";

/**
 * Admin Header Component
 *
 * Top navigation bar for admin dashboard
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiBars3,
  HiMagnifyingGlass,
  HiBell,
  HiArrowRightOnRectangle,
  HiCog6Tooth,
} from "react-icons/hi2";
import { useAuth, useLogout, UserAvatar } from "@/feature/auth";
import ThemeToggle from "../button/ThemeButton";

type AdminHeaderProps = {
  onMenuClick: () => void;
};

export default function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const router = useRouter();
  const { user } = useAuth();
  const logoutMutation = useLogout();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        router.push("/");
      },
    });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur">
      <div className="flex h-16 items-center gap-4 px-4 lg:px-6">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="rounded-lg p-2 hover:bg-surface lg:hidden"
          aria-label="Toggle menu"
        >
          <HiBars3 className="h-6 w-6" />
        </button>

        {/* Search Bar */}
        <div className="hidden flex-1 md:block">
          <div className="relative max-w-md">
            <HiMagnifyingGlass className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-foreground/40" />
            <input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg border border-border bg-surface py-2 pl-10 pr-4 text-sm outline-none placeholder:text-foreground/40 focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="ml-auto flex items-center gap-2">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen((s) => !s)}
              className="relative rounded-lg p-2 hover:bg-surface"
              aria-label="Notifications"
            >
              <HiBell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500"></span>
            </button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {notificationsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setNotificationsOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 z-50 mt-2 w-80 rounded-lg border border-border bg-surface shadow-lg"
                  >
                    <div className="border-b border-border px-4 py-3">
                      <h3 className="font-semibold">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto p-2">
                      <p className="px-4 py-8 text-center text-sm text-foreground/60">
                        No new notifications
                      </p>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((s) => !s)}
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-surface"
              >
                <UserAvatar user={user} size="sm" />
                <span className="hidden max-w-[120px] truncate md:inline">
                  {user.full_name}
                </span>
              </button>

              {/* User Dropdown */}
              <AnimatePresence>
                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 z-50 mt-2 w-56 rounded-lg border border-border bg-surface shadow-lg"
                    >
                      <div className="border-b border-border p-3">
                        <p className="text-sm font-medium">{user.full_name}</p>
                        <p className="text-xs text-foreground/60">{user.email}</p>
                      </div>

                      <div className="p-2">
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            router.push("/admin/settings");
                          }}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-background"
                        >
                          <HiCog6Tooth className="h-4 w-4" />
                          <span>Settings</span>
                        </button>

                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            handleLogout();
                          }}
                          disabled={logoutMutation.isPending}
                          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-500/10 disabled:opacity-50"
                        >
                          <HiArrowRightOnRectangle className="h-4 w-4" />
                          <span>
                            {logoutMutation.isPending ? "Logging out..." : "Logout"}
                          </span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
