"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type DocNavSection } from "@/lib/docs/navigation";
import { HiChevronRight } from "react-icons/hi2";
import { useState } from "react";

interface SidebarProps {
  navigation: DocNavSection[];
  module: string;
}

export function Sidebar({ navigation, module }: SidebarProps) {
  return (
    <aside className="sticky top-20 hidden h-[calc(100vh-5rem)] w-64 flex-shrink-0 overflow-y-auto border-r border-border py-8 pr-8 lg:block">
      <nav className="space-y-6">
        {navigation.map((section, idx) => (
          <SidebarSection key={idx} section={section} module={module} />
        ))}
      </nav>
    </aside>
  );
}

function SidebarSection({
  section,
  module,
}: {
  section: DocNavSection;
  module: string;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-sm font-semibold text-foreground/90 hover:text-foreground"
      >
        <span>{section.title}</span>
        <HiChevronRight
          className={`h-4 w-4 transition-transform ${
            isOpen ? "rotate-90" : ""
          }`}
        />
      </button>

      {isOpen && (
        <ul className="mt-3 space-y-1">
          {section.items.map((item, idx) => {
            const href = `/docs/${item.slug}`;
            const isActive = pathname === href;

            return (
              <li key={idx}>
                <Link
                  href={href}
                  className={`block rounded-md px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-foreground/70 hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
