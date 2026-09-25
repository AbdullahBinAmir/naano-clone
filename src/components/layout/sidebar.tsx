"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { NavIcon } from "@/components/layout/nav-icon";
import { cn } from "@/lib/utils";

export interface NavItem {
  readonly href: string;
  readonly label: string;
  readonly icon: string;
}

export interface SidebarProps {
  items: readonly NavItem[];
  /** Count badges keyed by nav href (e.g. collaborations needing action). */
  badges?: Record<string, number>;
  /** `rail` = icons only (desktop); `list` = icon + label rows (mobile drawer). */
  variant?: "rail" | "list";
  className?: string;
}

function Badge({ count, className }: { count: number; className?: string }) {
  return (
    <span
      className={cn(
        "flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[11px] leading-none font-semibold text-white",
        className,
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

export function Sidebar({ items, badges = {}, variant = "rail", className }: SidebarProps) {
  const pathname = usePathname();
  const rail = variant === "rail";

  return (
    <nav aria-label="Main" className={cn("flex flex-col", rail ? "items-center gap-1.5" : "gap-1 p-2", className)}>
      {items.map((item) => {
        const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
        const badge = badges[item.href] ?? 0;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={rail ? item.label : undefined}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex items-center rounded-md transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:outline-none",
              rail ? "h-11 w-11 justify-center" : "h-12 gap-3 px-3 text-sm font-medium",
              active ? "text-accent" : "text-foreground-muted hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId={`sidebar-active-${variant}`}
                className="absolute inset-0 rounded-md bg-accent-muted"
                transition={{ type: "spring", bounce: 0, duration: 0.35 }}
              />
            )}
            <NavIcon name={item.icon} className={cn("relative shrink-0", rail ? "h-6 w-6" : "h-5 w-5")} />
            {!rail && <span className="relative flex-1">{item.label}</span>}
            {badge > 0 && (
              <Badge count={badge} className={rail ? "absolute -top-1 -right-1" : "relative"} />
            )}
            {rail && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-full z-50 ml-3 -translate-y-1/2 rounded-md border border-border bg-card-raised px-2.5 py-1 text-xs font-medium whitespace-nowrap text-foreground opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                {item.label}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
