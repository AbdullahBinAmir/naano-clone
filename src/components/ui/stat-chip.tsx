import { AvatarStack, type AvatarStackItem } from "@/components/ui/avatar-stack";
import { cn } from "@/lib/utils";

export interface StatChipProps {
  value: React.ReactNode;
  /** Renders "value of total" when provided, e.g. "12 of 15". */
  total?: React.ReactNode;
  label: string;
  avatars?: AvatarStackItem[];
  /** Real head-count when `avatars` is only a preview (drives the "+N" chip). */
  avatarTotal?: number;
  maxAvatars?: number;
  className?: string;
}

/** Dark header pill: optional avatar stack + "12 of 15 on work"-style text. */
export function StatChip({ value, total, label, avatars, avatarTotal, maxAvatars = 3, className }: StatChipProps) {
  const hasAvatars = !!avatars && avatars.length > 0;

  return (
    <div
      className={cn(
        "inline-flex h-16 items-center gap-3 rounded-md border border-border bg-card pr-5",
        hasAvatars ? "pl-3" : "pl-5",
        className,
      )}
    >
      {hasAvatars && <AvatarStack items={avatars} max={maxAvatars} total={avatarTotal} size="sm" />}
      <p className="text-[length:1rem] whitespace-nowrap">
        <span className="font-medium text-foreground">{total !== undefined ? `${value} of ${total}` : value}</span>{" "}
        <span className="text-foreground-muted">{label}</span>
      </p>
    </div>
  );
}
