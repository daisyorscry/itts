"use client";

import { CopyButton } from "./CopyButton";

export function Pre({ children, ...props }: any) {
  const textContent = children?.props?.children || "";

  return (
    <div className="group relative my-6">
      <pre
        className="overflow-x-auto rounded-lg border border-border bg-muted/30 p-4 text-sm"
        {...props}
      >
        {children}
      </pre>
      <div className="opacity-0 transition-opacity group-hover:opacity-100">
        <CopyButton text={textContent} />
      </div>
    </div>
  );
}
