"use client";

import { useEffect, useState } from "react";
import { type TocItem } from "@/lib/mdx/toc";

interface TableOfContentsProps {
  items: TocItem[];
}

export function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "0% 0% -80% 0%" }
    );

    // Observe all headings
    const headings = document.querySelectorAll("h2, h3");
    headings.forEach((heading) => {
      if (heading.id) {
        observer.observe(heading);
      }
    });

    return () => {
      headings.forEach((heading) => {
        if (heading.id) {
          observer.unobserve(heading);
        }
      });
    };
  }, []);

  if (items.length === 0) {
    return null;
  }

  return (
    <aside className="sticky top-20 hidden h-[calc(100vh-5rem)] w-64 flex-shrink-0 overflow-y-auto py-8 pl-8 xl:block">
      <div className="space-y-3">
        <p className="text-sm font-semibold text-foreground">On this page</p>
        <nav>
          <ul className="space-y-1.5 text-sm">
            {items.map((item, idx) => {
              const isActive = activeId === item.url.slice(1);
              return (
                <li
                  key={idx}
                  style={{
                    paddingLeft: item.level === 3 ? "0.75rem" : "0",
                  }}
                >
                  <a
                    href={item.url}
                    className={`block border-l-2 py-1.5 pl-3 text-sm transition-all ${
                      isActive
                        ? "border-primary font-medium text-primary"
                        : "border-border text-foreground/60 hover:border-foreground/30 hover:text-foreground"
                    }`}
                  >
                    {item.title}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </aside>
  );
}
