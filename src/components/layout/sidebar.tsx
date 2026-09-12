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

export function Sidebar({ items, className }: { items: readonly NavItem[]; className?: string }) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex flex-col gap-1 p-3", className)}>
      {items.map((item) => {
        const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-150",
              active ? "text-foreground" : "text-foreground-muted hover:text-foreground",
            )}
          >
            {active && (
              <motion.span
                layoutId="sidebar-active-indicator"
                className="absolute inset-0 rounded-md bg-white/[0.07] border border-border"
                transition={{ type: "spring", bounce: 0, duration: 0.35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-3">
              <NavIcon name={item.icon} className="h-[18px] w-[18px]" />
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
