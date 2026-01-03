"use client";

import { CopyButton } from "./CopyButton";
import { Mermaid } from "./Mermaid";

// Helper function to extract text from complex nested structure
function extractText(node: any): string {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (node?.props?.children) return extractText(node.props.children);
  return "";
}

export function Pre({ children, raw, ...props }: any) {
  // Extract text content recursively
  const textContent = extractText(children);

  // Get className from various possible locations
  const className = children?.props?.className || props.className || "";
  const dataLanguage = props["data-language"] || "";
  const languageMatch =
    className.match(/language-([a-z0-9-]+)/i) ||
    className.match(/lang-([a-z0-9-]+)/i);
  const languageLabel =
    dataLanguage || (languageMatch ? languageMatch[1] : "");

  // Check if this is a mermaid code block by:
  // 1. Checking className
  // 2. Checking data-language attribute
  // 3. Checking if content starts with mermaid keywords
  const isMermaid =
    className.includes("language-mermaid") ||
    className.includes("lang-mermaid") ||
    dataLanguage === "mermaid" ||
    /^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|gitGraph|journey|mindmap|timeline|quadrantChart|xychart)/m.test(
      textContent.trim()
    );

  // If it's a mermaid diagram, render it with the Mermaid component
  if (isMermaid && textContent.trim()) {
    return <Mermaid>{textContent}</Mermaid>;
  }

  // Otherwise, render as normal code block
  return (
    <div className="group my-6 overflow-hidden rounded-xl border border-border/70 shadow-sm">
      <div className="flex items-center justify-between border-b border-border/60 bg-background/70 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-foreground/60 backdrop-blur">
        <span>{languageLabel || "Code"}</span>
        <div className="opacity-0 transition-opacity group-hover:opacity-100">
          <CopyButton text={textContent} className="p-1.5" />
        </div>
      </div>
      <pre
        className="overflow-x-auto p-4 text-sm leading-6"
        {...props}
      >
        {children}
      </pre>
    </div>
  );
}
