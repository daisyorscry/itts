"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { Link } from "react-router";
import { useSidebar } from "@components/sidebar/context";
import { VariantProps, cva } from "class-variance-authority";
import { cn } from "@components/ui/utils";

export function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn("flex w-full min-w-0 flex-col gap-2", className)}
      {...props}
    />
  );
}

export function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  );
}

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex h-9 w-full items-center justify-start gap-2 overflow-hidden rounded-xl px-3 py-2 text-left text-[13px] outline-hidden transition-[background-color,color] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring disabled:pointer-events-none disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground [&>span:last-child]:truncate [&>svg]:size-5.5 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
      },
      size: {
        default: "",
        sm: "h-10 text-sm",
        lg: "h-14 text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export function SidebarMenuButton({
  asChild = false,
  isActive = false,
  variant = "default",
  size = "default",
  to,
  icon: Icon,
  label,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean;
  isActive?: boolean;
  to?: string;
  icon?: React.ElementType;
  label?: React.ReactNode;
} & VariantProps<typeof sidebarMenuButtonVariants>) {
  const { isMobile, setOpenMobile } = useSidebar();
  const button = to ? (
    <Link
      to={to}
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
      onClick={() => {
        if (isMobile) {
          setOpenMobile(false);
        }
      }}
    >
      {Icon ? <Icon /> : null}
      {label ? <span>{label}</span> : null}
    </Link>
  ) : (() => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        data-slot="sidebar-menu-button"
        data-sidebar="menu-button"
        data-size={size}
        data-active={isActive}
        className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
        {...props}
      />
    );
  })();

  return button;
}
