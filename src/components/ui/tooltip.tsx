"use client";

import * as React from "react";
import { Tooltip as BaseTooltip } from "@base-ui-components/react/tooltip";
import { cn } from "@/lib/utils";

export const TooltipProvider = BaseTooltip.Provider;

export function Tooltip({
  children,
  content,
  side = "top",
}: {
  children: React.ReactElement<Record<string, unknown>>;
  content: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
}) {
  return (
    <BaseTooltip.Root>
      <BaseTooltip.Trigger render={children} />
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner side={side} sideOffset={8}>
          <BaseTooltip.Popup
            className={cn(
              "glass-surface-strong z-50 rounded-md px-2.5 py-1.5 text-xs font-medium text-foreground",
              "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 transition-opacity duration-150",
            )}
          >
            {content}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}
