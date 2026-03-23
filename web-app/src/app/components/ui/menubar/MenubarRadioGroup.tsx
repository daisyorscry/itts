"use client";

import * as React from "react";
import * as MenubarPrimitive from "@radix-ui/react-menubar";

function MenubarRadioGroup({
  ...props
}: React.ComponentProps<typeof MenubarPrimitive.RadioGroup>) {
  return (
    <MenubarPrimitive.RadioGroup data-slot="menubar-radio-group" {...props} />
  );
}

export { MenubarRadioGroup };
