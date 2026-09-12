import * as React from "react";
import { cn } from "@/lib/utils";

export const GlassNav = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("glass-surface-strong", className)} {...props} />
  ),
);
GlassNav.displayName = "GlassNav";
