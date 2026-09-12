import * as React from "react";
import { cn } from "@/lib/utils";

export interface GlassPanelProps extends React.ComponentPropsWithoutRef<"div"> {
  strong?: boolean;
}

export const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, strong, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(strong ? "glass-surface-strong" : "glass-surface", "rounded-lg", className)}
      {...props}
    />
  ),
);
GlassPanel.displayName = "GlassPanel";
