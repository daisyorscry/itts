// components/navigation/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import ThemeToggle from "../button/ThemeButton";
import SectionMenuMobile from "./SectionMenuMobile";
import SectionMenuDesktop from "./SectionMenuDesktop";

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
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

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
