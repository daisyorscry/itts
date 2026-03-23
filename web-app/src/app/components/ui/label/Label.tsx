"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";

import { cn } from "../utils";

interface LabelProps extends React.ComponentProps<typeof LabelPrimitive.Root> {
  tone?: "default" | "inverse";
}

function Label({
  className,
  tone = "default",
  ...props
}: LabelProps) {
  return (
    <LabelPrimitive.Root
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        tone === "inverse" && "text-[#04090C]",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
