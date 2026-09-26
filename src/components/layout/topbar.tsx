"use client";

import { CURRENCY } from "@/lib/constants";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NumberFlow from "@number-flow/react";
import { Popover as BasePopover } from "@base-ui-components/react/popover";
import { Bell, LogOut, UserCog } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/ui/menu";
import { StatChip } from "@/components/ui/stat-chip";
import { MobileNav } from "@/components/layout/mobile-nav";
import type { DashboardIdentity } from "@/components/layout/dashboard-shell";
import type { NavItem } from "@/components/layout/sidebar";
import { useSignOut } from "@/hooks/use-sign-out";
import type { CollabStats } from "@/lib/dashboard/get-collab-stats";
import type { NotificationsSummary } from "@/lib/notifications/get-notifications";
import { markNotificationsReadAction } from "@/lib/actions/notifications";
import { initials } from "@/lib/utils";

export function Topbar({
  role,
  identity,
  stats,
  notifications,
  collaborationsHref,
  navItems,
  badges,
  walletBalance,
}: {
  role: "creator" | "brand";
  identity: DashboardIdentity;
  stats: CollabStats;
  notifications: NotificationsSummary;
  collaborationsHref: string;
  navItems: readonly NavItem[];
  badges: Record<string, number>;
  walletBalance?: number;
}) {
  const router = useRouter();
  const { signOut, pending } = useSignOut();
  const chipLink =
    "rounded-md outline-none focus-visible:ring-2 focus-visible:ring-accent/60 transition-opacity hover:opacity-90";

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 bg-base py-4 sm:gap-4 sm:py-5">
      <div className="md:hidden">
        <MobileNav items={navItems} badges={badges} />
      </div>

      <Link href="/" className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-lg font-bold text-accent-foreground">
          N
        </span>
        <span className="hidden text-accent sm:inline">naano</span>
      </Link>

      <div className="ml-4 hidden items-center gap-3 lg:flex">
        <Link href={collaborationsHref} className={chipLink} aria-label={`${stats.active} active ${stats.active === 1 ? "collaboration" : "collaborations"}`}>
          <StatChip
            className="h-14"
            value={stats.active}
            label="active"
            avatars={stats.activeAvatars}
            avatarTotal={stats.activeCounterparts}
          />
        </Link>
        <Link
          href={collaborationsHref}
          className={chipLink}
          aria-label={`${stats.needsAction} ${stats.needsAction === 1 ? "collaboration needs" : "collaborations need"} action`}
        >
          <StatChip className="h-14" value={stats.needsAction} label={stats.needsAction === 1 ? "needs action" : "need action"} />
        </Link>
        {walletBalance !== undefined && (
          <StatChip
            className="hidden h-14 xl:inline-flex"
            value={
              <NumberFlow value={walletBalance} format={{ style: "currency", currency: CURRENCY, maximumFractionDigits: 0 }} />
            }
            label="available"
          />
        )}
      </div>

      <div className="ml-auto flex items-center gap-3 sm:gap-4">
        <BasePopover.Root>
          <BasePopover.Trigger
            aria-label="Notifications"
            className="relative flex h-12 w-12 items-center justify-center rounded-md border border-border bg-card-raised text-foreground-muted transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:outline-none"
          >
            <Bell className="h-5 w-5" strokeWidth={1.75} />
            {(notifications.unreadCount > 0 || stats.needsAction > 0) && (
              <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-danger" aria-hidden="true" />
            )}
          </BasePopover.Trigger>
          <BasePopover.Portal>
            <BasePopover.Positioner sideOffset={10} align="end">
              <BasePopover.Popup className="z-50 w-80 rounded-lg border border-border bg-card-raised p-2 outline-none transition-all duration-150 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
                <div className="flex items-center justify-between px-3 py-2">
                  <p className="text-sm font-medium text-foreground-muted">Notifications</p>
                  {notifications.unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={async () => {
                        await markNotificationsReadAction();
                        router.refresh();
                      }}
                      className="text-xs text-accent hover:underline focus-visible:underline focus-visible:outline-none"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                {stats.needsAction > 0 && (
                  <Link
                    href={collaborationsHref}
                    className="block rounded-md bg-accent-soft px-3 py-2.5 text-sm font-medium text-accent-soft-foreground"
                  >
                    {stats.needsAction === 1
                      ? "1 collaboration needs your action"
                      : `${stats.needsAction} collaborations need your action`}
                  </Link>
                )}
                {notifications.items.length > 0 ? (
                  <ul className="mt-1 flex max-h-96 flex-col overflow-y-auto">
                    {notifications.items.map((n) => (
                      <li key={n.id}>
                        <Link href={n.href} className="flex gap-2.5 rounded-md px-3 py-2.5 text-sm hover:bg-white/[0.05]">
                          <span
                            aria-hidden="true"
                            className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.unread ? "bg-accent" : "bg-transparent"}`}
                          />
                          <span className="min-w-0 flex-1">
                            <span className={`block ${n.unread ? "font-medium text-foreground" : "text-foreground-muted"}`}>
                              {n.title}
                            </span>
                            {n.body && <span className="block truncate text-xs text-foreground-subtle">{n.body}</span>}
                            <span className="block text-xs text-foreground-subtle">{n.timeLabel}</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  stats.needsAction === 0 && <p className="px-3 py-2.5 text-sm text-foreground-muted">You&apos;re all caught up.</p>
                )}
              </BasePopover.Popup>
            </BasePopover.Positioner>
          </BasePopover.Portal>
        </BasePopover.Root>

        <Menu>
          <MenuTrigger className="flex items-center gap-3 rounded-md text-right text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent/60">
            <span className="hidden leading-tight sm:block">
              <span className="block max-w-48 truncate text-[length:1rem] font-medium">{identity.displayName}</span>
              <span className="block text-sm text-foreground-muted capitalize">{role}</span>
            </span>
            <Avatar
              src={identity.avatarUrl}
              alt={identity.displayName}
              fallback={initials(identity.displayName)}
              className="h-12 w-12"
            />
          </MenuTrigger>
          <MenuContent>
            <div className="px-2.5 py-1.5">
              <p className="truncate text-sm font-medium">{identity.displayName}</p>
              <p className="truncate text-xs text-foreground-subtle">{identity.email}</p>
            </div>
            <div className="my-1 h-px bg-border" />
            <MenuItem onClick={() => router.push(`/dashboard/${role}/settings`)}>
              <UserCog className="h-3.5 w-3.5" strokeWidth={1.75} />
              Settings
            </MenuItem>
            <MenuItem onClick={signOut} disabled={pending}>
              <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
              {pending ? "Signing out…" : "Sign out"}
            </MenuItem>
          </MenuContent>
        </Menu>
      </div>
    </header>
  );
}
