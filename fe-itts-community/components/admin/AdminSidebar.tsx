"use client";

/**
 * Admin Sidebar Component
 *
 * Navigation sidebar for admin dashboard
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  HiHome,
  HiCalendar,
  HiUsers,
  HiUserGroup,
  HiShieldCheck,
  HiCog6Tooth,
  HiChartBar,
  HiDocument,
  HiMicrophone,
  HiMap,
  HiSquares2X2,
} from "react-icons/hi2";
import { useAuth, PERMISSIONS } from "@/feature/auth";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string[];
  badge?: string;
};

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: HiHome,
  },
  {
    label: "Events",
    href: "/admin/event",
    icon: HiCalendar,
    permission: [PERMISSIONS.EVENTS_LIST, PERMISSIONS.EVENTS_READ],
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: HiUsers,
    permission: [PERMISSIONS.USERS_LIST, PERMISSIONS.USERS_READ],
  },
  {
    label: "Speakers",
    href: "/admin/speakers",
    icon: HiMicrophone,
    permission: [PERMISSIONS.EVENT_SPEAKERS_LIST, PERMISSIONS.EVENT_SPEAKERS_READ],
  },
  {
    label: "Registrations",
    href: "/admin/registrations",
    icon: HiDocument,
    permission: [PERMISSIONS.REGISTRATIONS_LIST, PERMISSIONS.REGISTRATIONS_READ],
  },
  {
    label: "Community",
    href: "/admin/community",
    icon: HiUserGroup,
  },
  {
    label: "Roadmaps",
    href: "/admin/roadmaps",
    icon: HiMap,
    permission: [PERMISSIONS.ROADMAPS_LIST, PERMISSIONS.ROADMAPS_READ],
  },
  {
    label: "Partners",
    href: "/admin/partners",
    icon: HiSquares2X2,
    permission: [PERMISSIONS.PARTNERS_LIST, PERMISSIONS.PARTNERS_READ],
  },
  {
    label: "Analytics",
    href: "/admin/analytics",
    icon: HiChartBar,
  },
  {
    label: "Roles & Permissions",
    href: "/admin/roles",
    icon: HiShieldCheck,
    permission: [PERMISSIONS.ROLES_LIST, PERMISSIONS.PERMISSIONS_LIST],
  },
  {
    label: "Settings",
    href: "/admin/settings",
    icon: HiCog6Tooth,
  },
];

type AdminSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const { hasAnyPermission, isSuperAdmin } = useAuth();

  // Filter items based on permissions
  const visibleItems = NAV_ITEMS.filter((item) => {
    // Super admin can see everything
    if (isSuperAdmin()) return true;
    // If no permission required, show it
    if (!item.permission) return true;
    // Check if user has any of the required permissions
    return hasAnyPermission(item.permission);
  });

  const isActive = (href: string) => {
    if (href === "/admin") {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-border bg-surface transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center gap-2 border-b border-border px-6">
          <div className="flex items-center gap-2 font-semibold">
            <span className="inline-block rounded-md border border-border px-2 py-1 text-sm">
              ITTS
            </span>
            <span className="text-sm">Admin Panel</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-foreground/70 hover:bg-surface-hover hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-white">
                        {item.badge}
                      </span>
                    )}
                    {active && (
                      <motion.div
                        layoutId="sidebar-indicator"
                        className="h-2 w-2 rounded-full bg-primary"
                        transition={{ type: "spring", stiffness: 500, damping: 40 }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground/70 hover:bg-surface-hover hover:text-foreground"
          >
            <HiHome className="h-5 w-5" />
            <span>Back to Website</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
