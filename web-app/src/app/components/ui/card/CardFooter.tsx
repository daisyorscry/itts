import * as React from "react";
import { cn } from "../utils";

interface CardFooterProps extends React.ComponentProps<"div"> {
  align?: "start" | "center" | "end";
  flush?: boolean;
  gap?: "none" | "sm" | "md" | "lg";
}

export function CardFooter({
  className,
  align = "start",
  flush = false,
  gap = "none",
  ...props
}: CardFooterProps) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center [.border-t]:pt-6",
        align === "start" && "justify-start",
        align === "center" && "justify-center",
        align === "end" && "justify-end",
        gap === "sm" && "gap-2",
        gap === "md" && "gap-4",
        gap === "lg" && "gap-6",
        flush ? "px-0 pb-0 pt-4" : "px-6 pb-6",
        className,
      )}
      {...props}
    />
  );
}
