"use client";

import * as React from "react";
import { Progress as BaseProgress } from "@base-ui-components/react/progress";
import { cn } from "@/lib/utils";

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <BaseProgress.Root value={value} className={cn("w-full", className)}>
      <BaseProgress.Track className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <BaseProgress.Indicator className="h-full rounded-full bg-accent transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" />
      </BaseProgress.Track>
    </BaseProgress.Root>
  );
}
