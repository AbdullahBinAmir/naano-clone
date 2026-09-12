"use client";

import * as React from "react";
import { Tabs as BaseTabs } from "@base-ui-components/react/tabs";
import { cn } from "@/lib/utils";

export const Tabs = BaseTabs.Root;

export function TabsList({ className, ...props }: React.ComponentPropsWithoutRef<typeof BaseTabs.List>) {
  return (
    <BaseTabs.List
      className={cn(
        "relative flex items-center gap-1 rounded-lg border border-border bg-white/[0.03] p-1",
        className,
      )}
      {...props}
    />
  );
}

export function TabsTab({ className, ...props }: React.ComponentPropsWithoutRef<typeof BaseTabs.Tab>) {
  return (
    <BaseTabs.Tab
      className={cn(
        "relative z-10 flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-foreground-muted outline-none transition-colors duration-150 data-[selected]:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function TabsIndicator({ className, style, ...props }: React.ComponentPropsWithoutRef<typeof BaseTabs.Indicator>) {
  return (
    <BaseTabs.Indicator
      className={cn(
        "absolute rounded-md bg-white/[0.08] border border-border-strong transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        className,
      )}
      style={{
        top: "var(--active-tab-top)",
        left: "var(--active-tab-left)",
        width: "var(--active-tab-width)",
        height: "var(--active-tab-height)",
        ...style,
      }}
      {...props}
    />
  );
}

export const TabsPanel = BaseTabs.Panel;
