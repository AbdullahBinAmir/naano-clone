"use client";

import * as React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends React.ComponentPropsWithoutRef<"div"> {
  interactive?: boolean;
  strong?: boolean;
}

/**
 * The base tile/card surface used across every dashboard page. `interactive`
 * adds a subtle hover-lift — critically damped, no bounce, per the
 * apple-design skill's default spring recommendation for non-gesture UI.
 */
export function GlassCard({ className, interactive, strong, children, ...props }: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        strong ? "glass-surface-strong" : "glass-surface",
        "rounded-lg p-5",
        interactive && "cursor-pointer",
        className,
      )}
      whileHover={interactive ? { y: -2 } : undefined}
      transition={{ type: "spring", bounce: 0, duration: 0.35 }}
      {...(props as React.ComponentPropsWithoutRef<typeof motion.div>)}
    >
      {children}
    </motion.div>
  );
}
