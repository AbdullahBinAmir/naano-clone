import { Avatar } from "@/components/ui/avatar";
import { cn, initials } from "@/lib/utils";

export interface AvatarStackItem {
  name: string;
  src?: string | null;
}

export interface AvatarStackProps {
  items: AvatarStackItem[];
  /** Max avatars drawn before the "+N" chip. */
  max?: number;
  /** Real total when `items` is only a preview (drives the "+N" count). */
  total?: number;
  size?: "sm" | "md";
  /** Ring color should match the surface the stack sits on. */
  ringClassName?: string;
  className?: string;
}

export function AvatarStack({
  items,
  max = 3,
  total,
  size = "md",
  ringClassName = "ring-card",
  className,
}: AvatarStackProps) {
  const shown = items.slice(0, max);
  const overflow = Math.max(0, (total ?? items.length) - shown.length);
  const sizeClass = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";

  return (
    <div
      role="group"
      aria-label={`${total ?? items.length} people`}
      className={cn("flex items-center -space-x-2.5", className)}
    >
      {shown.map((item, i) => (
        <Avatar
          key={`${item.name}-${i}`}
          src={item.src}
          alt={item.name}
          fallback={initials(item.name)}
          size={size}
          className={cn("ring-2", ringClassName)}
        />
      ))}
      {overflow > 0 && (
        <span
          className={cn(
            "relative flex shrink-0 items-center justify-center rounded-full bg-accent-soft font-medium text-accent-soft-foreground ring-2",
            ringClassName,
            sizeClass,
          )}
        >
          +{overflow}
        </span>
      )}
    </div>
  );
}
