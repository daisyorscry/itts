"use client";

import { useState } from "react";
import { HiCheck, HiClipboard } from "react-icons/hi2";

interface CopyButtonProps {
  text: string;
  className?: string;
}

export function CopyButton({ text, className = "" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`rounded-md border border-border bg-background/80 p-2 backdrop-blur transition-all hover:bg-muted ${className}`}
      aria-label="Copy code"
    >
      {copied ? (
        <HiCheck className="h-4 w-4 text-green-500" />
      ) : (
        <HiClipboard className="h-4 w-4 text-foreground/60" />
      )}
    </button>
  );
}
