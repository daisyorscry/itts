import * as React from "react";
import { cn } from "../utils";

interface CardContentProps extends React.ComponentProps<"div"> {
  spacing?: "default" | "lg";
  padding?: "default" | "auth";
}

export function CardContent({
  className,
  spacing = "default",
  padding = "default",
  ...props
}: CardContentProps) {
  return (
    <div
      data-slot="card-content"
      className={cn(
        padding === "auth"
          ? "px-4 pt-6 sm:px-6 sm:pt-8 [&:last-child]:pb-5 sm:[&:last-child]:pb-6"
          : "px-4 sm:px-6 [&:last-child]:pb-5 sm:[&:last-child]:pb-6",
        spacing === "lg" && "space-y-6",
        className,
      )}
      {...props}
    />
  );
}
