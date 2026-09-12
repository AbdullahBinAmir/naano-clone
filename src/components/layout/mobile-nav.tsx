"use client";

import * as React from "react";
import { Dialog as BaseDialog } from "@base-ui-components/react/dialog";
import { Menu as MenuIcon, X } from "lucide-react";
import { Sidebar, type NavItem } from "@/components/layout/sidebar";

export function MobileNav({ items }: { items: readonly NavItem[] }) {
  const [open, setOpen] = React.useState(false);

  return (
    <BaseDialog.Root open={open} onOpenChange={setOpen}>
      <BaseDialog.Trigger className="glass-surface flex h-9 w-9 items-center justify-center rounded-md text-foreground-muted">
        <MenuIcon className="h-4 w-4" strokeWidth={1.75} />
      </BaseDialog.Trigger>
      <BaseDialog.Portal>
        <BaseDialog.Backdrop className="fixed inset-0 z-40 bg-black/60 transition-opacity duration-200 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0" />
        <BaseDialog.Popup className="glass-surface-strong fixed inset-y-0 left-0 z-50 w-72 overflow-y-auto p-2 outline-none transition-transform duration-200 data-[starting-style]:-translate-x-full data-[ending-style]:-translate-x-full">
          <div className="flex items-center justify-between px-2 py-2">
            <span className="text-sm font-semibold">Menu</span>
            <BaseDialog.Close className="flex h-8 w-8 items-center justify-center rounded-md text-foreground-muted hover:text-foreground">
              <X className="h-4 w-4" strokeWidth={1.75} />
            </BaseDialog.Close>
          </div>
          <div onClick={() => setOpen(false)}>
            <Sidebar items={items} />
          </div>
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
