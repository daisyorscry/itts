"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

interface MermaidProps {
  children: string;
  className?: string;
}

export function Mermaid({ children, className }: MermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const root = document.documentElement;
    const getTheme = () => {
      const explicit = root.getAttribute("data-theme");
      if (explicit === "dark" || explicit === "light") {
        return explicit;
      }
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    };

    setTheme(getTheme());
    const observer = new MutationObserver(() => setTheme(getTheme()));
    observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onMediaChange = () => setTheme(getTheme());
    media.addEventListener("change", onMediaChange);

    return () => {
      observer.disconnect();
      media.removeEventListener("change", onMediaChange);
    };
  }, []);

  useEffect(() => {
    const isDark = theme === "dark";

    mermaid.initialize({
      startOnLoad: false,
      theme: isDark ? "dark" : "default",
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: "basis",
        padding: 20,
      },
      sequence: {
        useMaxWidth: true,
        wrap: true,
        width: 200,
      },
      gantt: {
        useMaxWidth: true,
        fontSize: 14,
      },
    });

    const diagramSource = children.includes("%%{init:")
      ? children.replace(
          /(\"theme\"\s*:\s*)\"[^\"]+\"/,
          `$1\"${isDark ? "dark" : "default"}\"`
        )
      : children;

    const renderDiagram = async () => {
      if (!containerRef.current) return;

      try {
        // Generate unique ID for this diagram
        const id = `mermaid-${Math.random().toString(36).substring(7)}`;

        // Render the diagram
        const { svg } = await mermaid.render(id, diagramSource.trim());
        setSvg(svg);
        setError(null);
      } catch (err) {
        console.error("Mermaid rendering error:", err);
        setError(err instanceof Error ? err.message : "Failed to render diagram");
      }
    };

    renderDiagram();
  }, [children, theme]);

  if (error) {
    return (
      <div className="my-8 rounded-xl border border-red-500/30 bg-red-500/5 p-4">
        <p className="text-sm text-red-600 dark:text-red-400">
          <strong>Mermaid Error:</strong> {error}
        </p>
        <details className="mt-2">
          <summary className="cursor-pointer text-xs text-red-600/80 dark:text-red-400/80">
            Show diagram code
          </summary>
          <pre className="mt-2 overflow-x-auto rounded bg-red-950/20 p-2 text-xs">
            {children}
          </pre>
        </details>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`mermaid-diagram not-prose my-8 w-full overflow-x-auto rounded-xl border border-border/50 bg-transparent p-8 shadow-sm ${className || ""}`}
      dangerouslySetInnerHTML={{ __html: svg }}
      style={{
        minHeight: "200px",
      }}
    />
  );
}
