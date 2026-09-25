import { AvatarStack, type AvatarStackItem } from "@/components/ui/avatar-stack";
import { cn } from "@/lib/utils";

export interface GradientStatCardProps {
  /** The big figure, e.g. "+278k". */
  value: React.ReactNode;
  label?: string;
  avatars?: AvatarStackItem[];
  avatarTotal?: number;
  className?: string;
}

/**
 * Feature card with the purple -> yellow gradient. Per DESIGN.md the
 * gradient is used ONCE per page — don't render more than one of these.
 */
export function GradientStatCard({ value, label, avatars, avatarTotal, className }: GradientStatCardProps) {
  return (
    <div
      className={cn("flex min-h-52 flex-col justify-between rounded-lg p-7 text-highlight-foreground", className)}
      style={{ backgroundImage: "var(--gradient-feature)" }}
    >
      {avatars && avatars.length > 0 ? (
        <AvatarStack items={avatars} total={avatarTotal} size="sm" ringClassName="ring-white/40" />
      ) : (
        <span />
      )}
      <div>
        <p className="text-6xl leading-none font-semibold tracking-tight">{value}</p>
        {label && <p className="mt-2 text-sm font-medium opacity-70">{label}</p>}
      </div>
    </div>
  );
}
