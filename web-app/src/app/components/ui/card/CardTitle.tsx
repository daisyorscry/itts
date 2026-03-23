import * as React from "react";
import { cn } from "../utils";

interface CardTitleProps extends React.ComponentProps<"div"> {
  tone?: "default" | "inverse";
}

export function CardTitle({ className, tone = "default", ...props }: CardTitleProps) {
  return (
    <h4
      data-slot="card-title"
      className={cn(
        "leading-none",
        tone === "inverse" && "font-['Sora'] text-xl font-semibold text-[#04090C]",
        className,
      )}
      {...props}
    />
  );
}
