"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border border-line bg-canvas-subtle p-1",
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-sm px-3 py-1.5",
        "text-small font-medium text-content-muted",
        "transition-all duration-200 ease-swift",
        "hover:text-content-secondary",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-electric-500",
        "disabled:pointer-events-none disabled:text-content-disabled",
        "data-[state=active]:bg-surface-elevated data-[state=active]:text-content data-[state=active]:shadow-subtle",
        "[&_svg]:size-4 [&_svg]:shrink-0",
        className
      )}
      {...props}
    />
  );
}

/* Underline variant — for page-level section navigation. */
function TabsListUnderline({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn(
        "flex items-center gap-6 overflow-x-auto border-b border-line",
        className
      )}
      {...props}
    />
  );
}

function TabsTriggerUnderline({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "relative -mb-px inline-flex items-center gap-2 whitespace-nowrap border-b-2 border-transparent pb-3 pt-1",
        "text-small font-medium text-content-muted transition-colors duration-200",
        "hover:text-content-secondary",
        "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-electric-500",
        "data-[state=active]:border-electric-500 data-[state=active]:text-content",
        "[&_svg]:size-4 [&_svg]:shrink-0",
        className
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        "mt-5 outline-none data-[state=active]:animate-fade-in",
        className
      )}
      {...props}
    />
  );
}

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsListUnderline,
  TabsTriggerUnderline,
  TabsContent,
};
