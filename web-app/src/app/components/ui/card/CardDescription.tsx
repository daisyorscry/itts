import * as React from "react";
import { cn } from "../utils";

interface CardDescriptionProps extends React.ComponentProps<"div"> {
  tone?: "default" | "inverse";
}

export function CardDescription({ className, tone = "default", ...props }: CardDescriptionProps) {
  return (
    <p
      data-slot="card-description"
      className={cn(
        tone === "inverse" ? "text-sm text-black/60" : "text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
