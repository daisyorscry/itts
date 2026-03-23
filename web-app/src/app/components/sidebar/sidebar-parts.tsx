"use client";

import * as React from "react";
import { ChevronDownIcon, PanelLeftIcon } from "lucide-react";
import { useSidebar } from "@components/sidebar/context";
import { cn } from "@components/ui/utils";

export function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar();

  return (
    <button
      type="button"
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-xl text-foreground outline-hidden transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeftIcon />
      <span className="sr-only">Toggle Sidebar</span>
    </button>
  );
}

export function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-inset"
      className={cn(
        "relative flex w-full min-w-0 flex-1 flex-col bg-background text-foreground",
        "md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarMain({ className, ...props }: React.ComponentProps<"main">) {
  return (
    <main
      data-slot="sidebar-main"
      className={cn("flex-1 overflow-auto bg-[#F7F4EC] p-4 sm:p-5 md:p-8", className)}
      {...props}
    />
  );
}

export function SidebarHeader({
  className,
  brandMark,
  brandTitle,
  brandSubtitle,
  ...props
}: React.ComponentProps<"div"> & {
  brandMark?: string;
  brandTitle?: string;
  brandSubtitle?: string;
}) {
  if (brandMark || brandTitle || brandSubtitle) {
    return (
      <div
        data-slot="sidebar-header"
        data-sidebar="header"
        className={cn("border-b border-sidebar-border px-5 py-4.5", className)}
        {...props}
      >
        <div className="flex items-center justify-start gap-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent">
            <span className="font-['Outfit'] text-base font-bold text-[#04090C]">{brandMark}</span>
          </div>
          <div className="min-w-0">
            {brandTitle ? (
              <p className="font-['Outfit'] text-[13px] leading-none font-bold text-[#04090C]">{brandTitle}</p>
            ) : null}
            {brandSubtitle ? (
              <p className="mt-1 block font-['Outfit'] text-[10px] leading-none text-black/50">{brandSubtitle}</p>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
      <div
      data-slot="sidebar-header"
      data-sidebar="header"
      className={cn("border-b border-sidebar-border px-5 py-4.5", className)}
      {...props}
    />
  );
}

export function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-3 overflow-auto px-4 py-5",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarGroup({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      data-slot="sidebar-group"
      data-sidebar="group"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

export function SidebarGroupLabel({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={cn(
        "px-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-black/40",
        className,
      )}
      {...props}
    />
  );
}

export function SidebarGroupTrigger({
  className,
  icon: Icon,
  label,
  isOpen = false,
  ...props
}: React.ComponentProps<"button"> & {
  icon?: React.ElementType;
  label?: React.ReactNode;
  isOpen?: boolean;
}) {
  return (
    <button
      type="button"
      data-slot="sidebar-group-trigger"
      data-sidebar="group-trigger"
      data-open={isOpen}
      className={cn(
        "flex h-9 w-full items-center justify-between gap-2 overflow-hidden rounded-xl px-3 py-2 text-left text-[13px] text-black/70 outline-hidden transition-[background-color,color] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        className,
      )}
      {...props}
    >
      <span className="flex min-w-0 flex-1 items-center gap-2">
        {Icon ? <Icon className="size-5.5 shrink-0" /> : null}
        <span className="truncate">{label}</span>
      </span>
      <ChevronDownIcon className={cn("size-4 shrink-0 transition-transform", isOpen && "rotate-180")} />
    </button>
  );
}

export function SidebarGroupContent({
  className,
  isOpen = false,
  ...props
}: React.ComponentProps<"div"> & {
  isOpen?: boolean;
}) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      data-open={isOpen}
      className={cn(
        "grid overflow-hidden pl-3 transition-[grid-template-rows,opacity,margin] duration-200 ease-out",
        isOpen ? "mt-1 grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-0",
        className,
      )}
    >
      <div className="min-h-0 overflow-hidden" {...props} />
    </div>
  );
}
