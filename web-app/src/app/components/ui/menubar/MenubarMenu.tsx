"use client";

import * as React from "react";
import * as MenubarPrimitive from "@radix-ui/react-menubar";

function MenubarMenu({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.Menu>) {
  return <MenubarPrimitive.Menu data-slot="menubar-menu" {...props} />;
}

export { MenubarMenu };
