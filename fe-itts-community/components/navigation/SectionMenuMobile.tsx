// components/navigation/SectionMenuMobile.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HOME_SECTIONS } from "@/lib/section/home";

export default function SectionMenuMobile({
  onPicked,
}: {
  onPicked?: () => void;
}) {
  const pathname = usePathname();

  const handle = (id: string, e: React.MouseEvent) => {
    if (pathname === "/") {
      e.preventDefault();
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      onPicked?.();
    }
  };

  return (
    <li className="mb-2">
      <div className="px-3 pb-3 text-sm font-semibold opacity-70">Sections</div>
      <div
        className="
          grid grid-cols-2 gap-3
          max-h-[220px] overflow-y-auto
        "
      >
        {HOME_SECTIONS.map((s) => (
          <Link
            key={s.id}
            href={`/#${s.id}`}
            prefetch={false}
            onClick={(e) => handle(s.id, e)}
            className="
              flex flex-col items-center justify-center gap-2
              rounded-xl border border-border p-4
              hover:bg-surface
            "
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-border">
              <s.icon className="h-6 w-6 text-foreground" />
            </span>
            <span className="text-center">
              <span className="block text-sm font-semibold">{s.title}</span>
              <span className="block text-xs opacity-70">{s.desc}</span>
            </span>
          </Link>
        ))}
      </div>
    </li>
  );
}
