"use client";

import * as React from "react";
import { Avatar as BaseAvatar } from "@base-ui-components/react/avatar";
import { cn } from "@/lib/utils";

export function Avatar({
  src,
  alt,
  fallback,
  className,
  size = "md",
}: {
  src?: string | null;
  alt: string;
  fallback: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-16 w-16 text-lg" }[size];
  return (
    <BaseAvatar.Root
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border-strong bg-surface-2 font-medium text-foreground-muted",
        sizeClass,
        className,
      )}
    >
      {src ? <BaseAvatar.Image src={src} alt={alt} className="h-full w-full object-cover" /> : null}
      <BaseAvatar.Fallback className="flex h-full w-full items-center justify-center">
        {fallback}
      </BaseAvatar.Fallback>
    </BaseAvatar.Root>
  );
}
