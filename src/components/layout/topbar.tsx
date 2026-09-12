"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import NumberFlow from "@number-flow/react";
import { Popover as BasePopover } from "@base-ui-components/react/popover";
import { Bell, CreditCard, LogOut, UserCog } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/ui/menu";
import { cn, initials } from "@/lib/utils";
import { signOutAction } from "@/lib/actions/auth";
import type { DashboardIdentity } from "@/components/layout/dashboard-shell";

const NOTIFICATIONS = [
  { id: 1, text: "Ferngrove confirmed your Outbound playbook booking.", time: "2h" },
  { id: 2, text: "Bramble sent a new brief for Design Week.", time: "1d" },
  { id: 3, text: "Your card was viewed 12 times this week.", time: "3d" },
];

export function Topbar({
  identity,
  walletBalance,
}: {
  identity: DashboardIdentity;
  walletBalance?: number;
}) {
  const router = useRouter();
  const [locale, setLocale] = React.useState<"en" | "fr">("en");
  const [signingOut, setSigningOut] = React.useState(false);

  async function handleSignOut() {
    setSigningOut(true);
    await signOutAction();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="glass-surface-strong sticky top-0 z-30 flex h-16 items-center justify-between gap-4 rounded-none border-x-0 border-t-0 px-4 sm:px-6">
      <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-accent-foreground text-sm font-bold">
          N
        </span>
        <span className="hidden sm:inline">naano</span>
      </Link>

      <div className="flex items-center gap-2 sm:gap-3">
        {walletBalance !== undefined && (
          <div className="glass-surface hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium sm:flex">
            <CreditCard className="h-3.5 w-3.5 text-foreground-subtle" />
            <NumberFlow value={walletBalance} format={{ style: "currency", currency: "EUR", maximumFractionDigits: 0 }} />
          </div>
        )}

        <div className="glass-surface hidden overflow-hidden rounded-full text-xs font-medium sm:flex">
          {(["en", "fr"] as const).map((code) => (
            <button
              key={code}
              onClick={() => {
                if (code === "fr") {
                  toast("French translations are coming in a later release.");
                }
                setLocale(code);
              }}
              className={cn(
                "px-3 py-1.5 uppercase transition-colors",
                locale === code ? "bg-white/[0.1] text-foreground" : "text-foreground-subtle hover:text-foreground",
              )}
            >
              {code}
            </button>
          ))}
        </div>

        <BasePopover.Root>
          <BasePopover.Trigger className="glass-surface relative flex h-10 w-10 items-center justify-center rounded-full text-foreground-muted transition-colors hover:text-foreground">
            <Bell className="h-4 w-4" strokeWidth={1.75} />
            <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-accent" />
          </BasePopover.Trigger>
          <BasePopover.Portal>
            <BasePopover.Positioner sideOffset={10} align="end">
              <BasePopover.Popup className="glass-surface-strong z-50 w-80 rounded-lg p-2 outline-none data-[starting-style]:opacity-0 data-[starting-style]:scale-95 transition-all duration-150">
                <p className="px-2 py-1.5 text-xs font-medium text-foreground-subtle">Notifications</p>
                <div className="flex flex-col">
                  {NOTIFICATIONS.map((n) => (
                    <div key={n.id} className="flex items-start justify-between gap-3 rounded-md px-2 py-2 text-sm hover:bg-white/[0.05]">
                      <span className="text-foreground-muted">{n.text}</span>
                      <span className="shrink-0 text-xs text-foreground-subtle">{n.time}</span>
                    </div>
                  ))}
                </div>
              </BasePopover.Popup>
            </BasePopover.Positioner>
          </BasePopover.Portal>
        </BasePopover.Root>

        <Menu>
          <MenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
            <Avatar src={identity.avatarUrl} alt={identity.displayName} fallback={initials(identity.displayName)} size="sm" />
          </MenuTrigger>
          <MenuContent>
            <div className="px-2.5 py-1.5">
              <p className="truncate text-sm font-medium">{identity.displayName}</p>
              <p className="truncate text-xs text-foreground-subtle">{identity.email}</p>
            </div>
            <div className="my-1 h-px bg-border" />
            <MenuItem onClick={() => toast("Settings aren't wired up yet.")}>
              <UserCog className="h-3.5 w-3.5" strokeWidth={1.75} />
              Settings
            </MenuItem>
            <MenuItem onClick={handleSignOut} disabled={signingOut}>
              <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
              {signingOut ? "Signing out…" : "Sign out"}
            </MenuItem>
          </MenuContent>
        </Menu>
      </div>
    </header>
  );
}
