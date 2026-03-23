import * as React from "react";
import { cn } from "../utils";

interface CardProps extends React.ComponentProps<"div"> {
  tone?: "default" | "inverse" | "paper" | "soft";
  width?: "default" | "2xl";
  border?: boolean;
}

export function Card({
  className,
  tone = "default",
  width = "default",
  border = true,
  ...props
}: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(
        "flex flex-col rounded-xl",
        tone === "inverse"
          ? cn(border ? "border border-black/10" : "border-0", "bg-[#F7F4EC] text-[#111111] shadow-none")
          : tone === "soft"
            ? cn(border ? "border border-black/10" : "border-0", "bg-black/5 text-card-foreground shadow-none")
          : tone === "paper"
            ? cn(
                "rounded-3xl bg-[#F5F3EE] text-card-foreground shadow-lg",
                border ? "border border-black/10" : "border-0",
              )
            : cn(border ? "border" : "border-0", "bg-card text-card-foreground"),
        width === "2xl" && "max-w-2xl",
        className,
      )}
      {...props}
    />
  );
}
