"use client";

import * as React from "react";
import * as MenubarPrimitive from "@radix-ui/react-menubar";

function MenubarSub({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Sub>) {
  return <MenubarPrimitive.Sub data-slot="menubar-sub" {...props} />;
}

export { MenubarSub };
