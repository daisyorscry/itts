"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";

function Accordion({
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

export { Accordion };
