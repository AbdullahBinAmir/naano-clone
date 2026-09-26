"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";

export function CopyButton({ value, label }: { value: string; label: string }) {
  return (
    <button
      type="button"
      aria-label={`Copy ${label}`}
      onClick={() => {
        navigator.clipboard.writeText(value);
        toast.success(`${label} copied`);
      }}
      className="inline-flex items-center gap-1 rounded text-foreground-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:outline-none"
    >
      <Copy className="h-3.5 w-3.5" strokeWidth={1.75} />
    </button>
  );
}
