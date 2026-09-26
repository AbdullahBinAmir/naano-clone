import type { ReactNode } from "react";
import Link from "next/link";
import { AdminNav } from "@/components/admin/admin-nav";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { requireProfile } from "@/lib/auth/require-profile";
import { getAdminCounts } from "@/lib/admin/queries";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { profile } = await requireProfile("admin");
  const counts = await getAdminCounts();

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6">
      <header className="flex flex-wrap items-center gap-4">
        <Link href="/dashboard/admin" className="flex items-center gap-2.5 text-2xl font-semibold tracking-tight">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-lg font-bold text-accent-foreground">N</span>
          <span className="text-accent">naano</span>
          <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-medium text-accent-soft-foreground">Admin</span>
        </Link>
        <span className="ml-auto text-sm text-foreground-muted">{profile.email}</span>
        <SignOutButton />
      </header>
      <AdminNav counts={{ payouts: counts.openPayouts, disputes: counts.openDisputes }} />
      <main className="flex flex-col gap-6 pb-16">{children}</main>
    </div>
  );
}
