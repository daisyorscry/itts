// components/navigation/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { HiUser, HiArrowRightOnRectangle, HiCog6Tooth } from "react-icons/hi2";
import ThemeToggle from "../button/ThemeButton";
import SectionMenuMobile from "./SectionMenuMobile";
import SectionMenuDesktop from "./SectionMenuDesktop";
import { useAuth, useLogout, UserAvatar } from "@/feature/auth";

type Item = { label: string; href: string };

const NAV_ITEMS: Item[] = [
  { label: "Home", href: "/" },
  { label: "Program", href: "/program" },
  { label: "Event", href: "/events" },
  { label: "Komunitas", href: "/community" },
  { label: "Docs", href: "/docs" },
  { label: "Blog", href: "/blog" },
  { label: "Tentang", href: "/about" },
];

// ✔ Variants bertipe tepat; tanpa ease string
const itemVariants: Variants = {
  initial: { opacity: 0, y: -6 },
  animate: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.02 * i,
      duration: 0.18,
      // jika mau easing, pakai cubic-bezier:
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const { isAuthenticated, user } = useAuth();
  const logoutMutation = useLogout();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        router.push("/");
      },
    });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-20 max-w-[1080px] items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-block rounded-md border border-border px-2 py-1 text-sm">
            ITTS
          </span>
          <span className="hidden sm:inline">Community</span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-1 md:flex">
          {/* Home + mega menu */}
          <motion.div
            className="relative px-2 py-2"
            variants={itemVariants}
            initial="initial"
            animate="animate"
            custom={0}
          >
            <SectionMenuDesktop />
          </motion.div>

          {/* Items lain */}
          {NAV_ITEMS.filter((i) => i.href !== "/").map((item, idx) => {
            const active =
              pathname === item.href || pathname.startsWith(item.href);
            return (
              <motion.div
                key={item.href}
                className="relative px-2 py-2"
                variants={itemVariants}
                initial="initial"
                animate="animate"
                custom={idx + 1}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              >
                <Link
                  href={item.href}
                  className="rounded px-1 text-sm opacity-80 outline-none hover:opacity-100 focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  {item.label}
                </Link>
                <AnimatePresence>
                  {active && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded bg-primary"
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 40,
                      }}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* Auth Menu - Desktop */}
          {isAuthenticated && user ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setUserMenuOpen((s) => !s)}
                className="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm hover:bg-surface"
              >
                <UserAvatar user={user} size="sm" />
                <span className="max-w-[120px] truncate">{user.full_name}</span>
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {userMenuOpen && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />

                    {/* Menu */}
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 z-50 mt-2 w-56 rounded-md border border-border bg-surface shadow-lg"
                    >
                      <div className="p-2">
                        {/* User Info */}
                        <div className="border-b border-border pb-2 mb-2">
                          <p className="text-sm font-medium">{user.full_name}</p>
                          <p className="text-xs text-foreground/60">{user.email}</p>
                        </div>

                        {/* Menu Items */}
                        <Link
                          href="/admin/event"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-background"
                        >
                          <HiCog6Tooth className="h-4 w-4" />
                          <span>Admin Panel</span>
                        </Link>

                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            handleLogout();
                          }}
                          disabled={logoutMutation.isPending}
                          className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-red-600 hover:bg-red-500/10 disabled:opacity-50"
                        >
                          <HiArrowRightOnRectangle className="h-4 w-4" />
                          <span>{logoutMutation.isPending ? "Logging out..." : "Logout"}</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden rounded-md border border-border px-3 py-2 text-sm hover:bg-surface md:block"
            >
              <div className="flex items-center gap-2">
                <HiUser className="h-4 w-4" />
                <span>Login</span>
              </div>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            className="rounded-md border border-border px-3 py-2 text-sm md:hidden"
            aria-label="Toggle menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((s) => !s)}
          >
            Menu
          </motion.button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.nav
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden border-t border-border md:hidden"
          >
            <ul className="mx-auto max-w-[1080px] space-y-1 px-5 py-2">
              <SectionMenuMobile onPicked={() => setOpen(false)} />

              {/* Auth Menu - Mobile */}
              {isAuthenticated && user ? (
                <>
                  <motion.li
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="border-t border-border pt-2"
                  >
                    <div className="px-3 py-2">
                      <UserAvatar user={user} size="sm" showName />
                    </div>
                  </motion.li>
                  <motion.li
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <Link
                      href="/admin/event"
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-surface"
                    >
                      <HiCog6Tooth className="h-4 w-4" />
                      <span>Admin Panel</span>
                    </Link>
                  </motion.li>
                  <motion.li
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="border-b border-border pb-2"
                  >
                    <button
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-500/10 disabled:opacity-50"
                    >
                      <HiArrowRightOnRectangle className="h-4 w-4" />
                      <span>{logoutMutation.isPending ? "Logging out..." : "Logout"}</span>
                    </button>
                  </motion.li>
                </>
              ) : (
                <motion.li
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="border-t border-border pt-2"
                >
                  <Link
                    href="/login"
                    className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-surface"
                  >
                    <HiUser className="h-4 w-4" />
                    <span>Login</span>
                  </Link>
                </motion.li>
              )}

              {NAV_ITEMS.filter((i) => i.href !== "/").map((item, i) => {
                const active =
                  pathname === item.href || pathname.startsWith(item.href);
                return (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.02 * i,
                      duration: 0.16,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <Link
                      href={item.href}
                      className="block rounded-md px-3 py-2 text-sm opacity-90 outline-none hover:opacity-100 focus-visible:ring-2 focus-visible:ring-primary/30"
                    >
                      <div className="flex items-center justify-between">
                        <span>{item.label}</span>
                        <AnimatePresence>
                          {active && (
                            <motion.span
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                              className="h-2 w-2 rounded-full bg-primary"
                            />
                          )}
                        </AnimatePresence>
                      </div>
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
