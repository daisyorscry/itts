"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/app/theme-provider";

type Mode = "light" | "dark" | "system";

const LABEL: Record<Mode, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

export default function ThemeToggle() {
  const { mode, setMode } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const choose = (m: Mode) => {
    setMode(m);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="rounded-md border border-border px-3 py-2 text-sm"
      >
        {LABEL[mode]}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 z-50 mt-1 min-w-36 overflow-hidden rounded-lg border border-border bg-background shadow-xl"
          >
            {(["light", "dark", "system"] as Mode[]).map((m) => (
              <motion.button
                key={m}
                onClick={() => choose(m)}
                className={`flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-surface ${
                  mode === m ? "opacity-100" : "opacity-80"
                }`}
                whileHover={{ x: 2 }}
                role="menuitem"
              >
                <span>{LABEL[m]}</span>
                {mode === m && (
                  <span
                    aria-hidden
                    className="h-2 w-2 rounded-full bg-primary"
                  />
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
