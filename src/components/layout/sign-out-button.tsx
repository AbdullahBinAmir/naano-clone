"use client";

import { LogOut } from "lucide-react";
import { useSignOut } from "@/hooks/use-sign-out";

export function SignOutButton() {
  const { signOut, pending } = useSignOut();
  return (
    <button
      type="button"
      onClick={signOut}
      disabled={pending}
      aria-label="Sign out"
      title="Sign out"
      className="flex h-11 w-11 items-center justify-center rounded-md text-foreground-muted transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:outline-none disabled:opacity-40"
    >
      <LogOut className="h-6 w-6" strokeWidth={1.75} />
    </button>
  );
}
