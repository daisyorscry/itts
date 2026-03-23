"use client";

import * as React from "react";
import { type VariantProps } from "class-variance-authority";
import { toggleVariants } from "../toggle";

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants>
>({
  size: "default",
  variant: "default",
});

export { ToggleGroupContext };
