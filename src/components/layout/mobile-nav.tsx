"use client";

import * as React from "react";
import { Dialog as BaseDialog } from "@base-ui-components/react/dialog";
import { Menu as MenuIcon, X } from "lucide-react";
import { Sidebar, type NavItem } from "@/components/layout/sidebar";
import { SignOutButton } from "@/components/layout/sign-out-button";

export function MobileNav({ items, badges }: { items: readonly NavItem[]; badges?: Record<string, number> }) {
  const [open, setOpen] = React.useState(false);

  return (
    <BaseDialog.Root open={open} onOpenChange={setOpen}>
      <BaseDialog.Trigger
        aria-label="Open menu"
        className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-card-raised text-foreground-muted focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:outline-none"
      >
        <MenuIcon className="h-5 w-5" strokeWidth={1.75} />
      </BaseDialog.Trigger>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="fixed inset-0 z-40 bg-black/70 transition-opacity duration-200 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0" />
        <BaseDialog.Popup className="fixed inset-y-3 left-3 z-50 flex w-72 flex-col overflow-y-auto rounded-xl border border-border bg-card p-3 outline-none transition-transform duration-200 data-[starting-style]:-translate-x-[110%] data-[ending-style]:-translate-x-[110%]">
          <div className="flex items-center justify-between px-2 py-2">
            <BaseDialog.Title className="text-[length:1rem] font-medium text-foreground">Menu</BaseDialog.Title>
            <BaseDialog.Close
              aria-label="Close menu"
              className="flex h-9 w-9 items-center justify-center rounded-md text-foreground-muted hover:text-foreground"
            >
              <X className="h-5 w-5" strokeWidth={1.75} />
            </BaseDialog.Close>
          </div>
          <div className="flex-1" onClick={() => setOpen(false)}>
            <Sidebar items={items} badges={badges} variant="list" />
          </div>
          <div className="border-t border-border pt-2">
            <SignOutButton />
          </div>
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
