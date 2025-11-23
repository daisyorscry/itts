// components/ui/Dropdown.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HiChevronDown } from "react-icons/hi";

export type Option<T extends string = string> = {
  label: string;
  value: T;
};

type DropdownProps<T extends string = string> = {
  value?: T | "";
  onChange?: (val: T) => void;
  options: Option<T>[];
  placeholder?: string;
  className?: string;
  leftIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  disabled?: boolean;
  id?: string;
  closeOnSelect?: boolean;
  "aria-labelledby"?: string;
};

export default function Dropdown<T extends string = string>({
  value = "",
  onChange,
  options,
  placeholder = "Pilih...",
  className = "",
  leftIcon: LeftIcon,
  disabled,
  id,
  closeOnSelect = true,
  ...aria
}: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState<number>(-1);
  const prevValueRef = useRef<typeof value>(value);

  const selected = useMemo(
    () => options.find((o) => o.value === value) ?? null,
    [options, value]
  );

  // Tutup saat value berubah (dipilih / di-reset dari luar)
  useEffect(() => {
    if (open && value !== prevValueRef.current && closeOnSelect) {
      setOpen(false);
    }
    prevValueRef.current = value;
  }, [value, open, closeOnSelect]);

  // Klik di luar (pakai capture agar menutup sebelum handler lain jalan)
  useEffect(() => {
    if (!open) return;

    const onDocPointerDown = (e: PointerEvent) => {
      const t = e.target as Node;
      if (rootRef.current && !rootRef.current.contains(t)) {
        setOpen(false);
      }
    };

    window.addEventListener("pointerdown", onDocPointerDown, true);
    return () => {
      window.removeEventListener("pointerdown", onDocPointerDown, true);
    };
  }, [open]);

  // Keyboard navigation saat open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIdx((i) => Math.min(options.length - 1, i + 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIdx((i) => Math.max(0, i - 1));
      }
      if (e.key === "Enter" && activeIdx >= 0) {
        e.preventDefault();
        const opt = options[activeIdx];
        if (opt) selectOption(opt);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, options, activeIdx]);

  // Set posisi fokus saat buka
  useEffect(() => {
    if (!open) return;
    const idx = options.findIndex((o) => o.value === value);
    setActiveIdx(idx >= 0 ? idx : 0);
  }, [open, options, value]);

  useEffect(() => {
    if (!open) setActiveIdx(-1);
  }, [open]);

  const selectOption = (opt: Option<T>) => {
    try {
      onChange?.(opt.value);
    } finally {
      if (closeOnSelect) setOpen(false);
    }
  };

  const baseInput = "input relative w-full min-h-10 items-center";
  const paddingInput = `${LeftIcon ? "pl-10" : "pl-3"} pr-8`;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        ref={btnRef}
        id={id}
        type="button"
        disabled={disabled}
        className={`${baseInput} ${paddingInput}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        // pakai pointerdown agar tidak double-tap di mobile
        onPointerDown={(e) => {
          // jika pointer berasal dari dalam popover, biarkan handler item yang bekerja
          if (popRef.current?.contains(e.target as Node)) return;
          setOpen((s) => !s);
        }}
        {...aria}
      >
        {LeftIcon && (
          <>
            <span className="absolute left-3 top-3 flex items-center">
              <LeftIcon className="h-4 w-4 text-foreground/60" />
            </span>
            <span
              className={`block truncate text-left text-sm ml-6 ${
                selected ? "" : "text-foreground/60"
              }`}
            >
              {selected ? selected.label : placeholder}
            </span>
          </>
        )}
        <HiChevronDown
          className="pointer-events-none absolute right-2 top-2 h-5 w-5 text-foreground/60"
          aria-hidden
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={popRef}
            role="listbox"
            aria-activedescendant={
              activeIdx >= 0
                ? `opt-${String(options[activeIdx].value)}`
                : undefined
            }
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
            className="absolute z-50 mt-2 w-full overflow-hidden rounded-md border bg-surface shadow-xl"
            style={{ borderColor: "var(--border)" }}
          >
            <ul className="max-h-56 overflow-auto py-1">
              {options.map((opt, i) => {
                const isSelected = opt.value === value;
                const active = i === activeIdx;
                return (
                  <li
                    id={`opt-${String(opt.value)}`}
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActiveIdx(i)}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      selectOption(opt);
                    }}
                    className={`flex cursor-pointer select-none items-center px-3 py-2 text-sm ${
                      active ? "bg-background/60" : ""
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                  </li>
                );
              })}
              {options.length === 0 && (
                <li className="px-3 py-2 text-sm text-foreground/60">
                  Tidak ada opsi
                </li>
              )}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
