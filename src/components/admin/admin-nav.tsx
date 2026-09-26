"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/dashboard/admin", label: "Overview" },
  { href: "/dashboard/admin/payouts", label: "Payouts" },
  { href: "/dashboard/admin/disputes", label: "Disputes" },
  { href: "/dashboard/admin/payments", label: "Payments" },
];

export function AdminNav({ counts }: { counts: { payouts: number; disputes: number } }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin" className="flex flex-wrap gap-2">
      {ITEMS.map((item) => {
        const active = item.href === "/dashboard/admin" ? pathname === item.href : pathname.startsWith(item.href);
        const badge = item.label === "Payouts" ? counts.payouts : item.label === "Disputes" ? counts.disputes : 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2 rounded-md px-4 py-2 text-[length:1rem] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:outline-none",
              active ? "bg-accent text-white" : "bg-card text-foreground-muted hover:text-foreground",
            )}
          >
            {item.label}
            {badge > 0 && <span className="rounded-full bg-danger px-1.5 text-[11px] text-white">{badge}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
