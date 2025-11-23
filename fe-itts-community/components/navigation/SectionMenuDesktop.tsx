// components/navigation/SectionMenuDesktop.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { HOME_SECTIONS } from "@/lib/section/home";

export default function SectionMenuDesktop() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const active = pathname === "/";

  useEffect(() => setMounted(true), []);

  const handlePick = useCallback(
    (id: string, e: React.MouseEvent<HTMLAnchorElement>) => {
      if (pathname === "/") {
        e.preventDefault();
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
        setOpen(false);
      }
    },
    [pathname]
  );

  return (
    <div
      className="relative px-2 py-2"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link href="/" className="text-sm opacity-80 hover:opacity-100">
        Home
      </Link>
      {active && (
        <motion.div
          layoutId="nav-underline"
          className="absolute inset-x-2 -bottom-0.5 h-0.5 rounded bg-primary"
          transition={{ type: "spring", stiffness: 500, damping: 40 }}
        />
      )}

      {/* full width panel */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-x-0 top-[80px] z-50"
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
              >
                <div className="mx-2 sm:mx-4 lg:mx-12">
                  <div className="rounded-2xl border border-border bg-background shadow-lg">
                    <ul
                      className="
                        grid gap-3 p-4
                        grid-cols-1 sm:grid-cols-2
                        md:grid-rows-2 md:grid-flow-col md:auto-cols-[minmax(220px,1fr)]
                      "
                    >
                      {HOME_SECTIONS.map((s) => (
                        <li key={s.id}>
                          <Link
                            href={`/#${s.id}`}
                            prefetch={false}
                            onClick={(e) => handlePick(s.id, e)}
                            className="
                              flex items-start gap-4 rounded-xl border border-border
                              p-4 sm:p-5 hover:bg-surface transition
                            "
                          >
                            <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-border">
                              <s.icon className="h-6 w-6 text-foreground" />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-base font-semibold">
                                {s.title}
                              </span>
                              <span className="block text-sm opacity-70 truncate">
                                {s.desc}
                              </span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
