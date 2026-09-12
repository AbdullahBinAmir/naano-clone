"use client";

import * as React from "react";
import { Menu as BaseMenu } from "@base-ui-components/react/menu";
import { cn } from "@/lib/utils";

export const Menu = BaseMenu.Root;
export const MenuTrigger = BaseMenu.Trigger;
export const MenuGroup = BaseMenu.Group;

export function MenuContent({
  className,
  children,
  align = "end",
}: {
  className?: string;
  children: React.ReactNode;
  align?: "start" | "end" | "center";
}) {
  return (
    <BaseMenu.Portal>
      <BaseMenu.Positioner sideOffset={8} align={align}>
        <BaseMenu.Popup
          className={cn(
            "glass-surface-strong z-50 min-w-[14rem] rounded-lg p-1.5 outline-none",
            "data-[starting-style]:opacity-0 data-[starting-style]:scale-95 data-[ending-style]:opacity-0 data-[ending-style]:scale-95 transition-all duration-150",
            className,
          )}
        >
          {children}
        </BaseMenu.Popup>
      </BaseMenu.Positioner>
    </BaseMenu.Portal>
  );
}

export function MenuItem({ className, ...props }: React.ComponentPropsWithoutRef<typeof BaseMenu.Item>) {
  return (
    <BaseMenu.Item
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm text-foreground-muted outline-none transition-colors data-[highlighted]:bg-white/[0.07] data-[highlighted]:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function MenuGroupLabel({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof BaseMenu.GroupLabel>) {
  return (
    <BaseMenu.GroupLabel
      className={cn("px-2.5 py-1.5 text-xs font-medium text-foreground-subtle", className)}
      {...props}
    />
  );
}
