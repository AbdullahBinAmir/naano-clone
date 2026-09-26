"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Building2, Sparkles } from "lucide-react";
import { completeOnboardingAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

const ROLES = [
  {
    role: "creator" as const,
    icon: Sparkles,
    title: "I'm a creator",
    description: "Turn your LinkedIn presence into paid brand collaborations.",
    href: "/dashboard/creator/overview",
  },
  {
    role: "brand" as const,
    icon: Building2,
    title: "I'm a brand",
    description: "Find and book vetted LinkedIn creators for sponsored posts.",
    href: "/dashboard/brand/overview",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [pending, setPending] = React.useState<"creator" | "brand" | null>(null);

  async function choose(role: "creator" | "brand", href: string) {
    setPending(role);
    const result = await completeOnboardingAction({ role });
    setPending(null);

    if (result.error) {
      toast.error(result.error);
      return;
    }
    router.push(href);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-xl font-semibold">How will you use Naano?</h1>
        <p className="mt-1 text-sm text-foreground-muted">You can&apos;t switch roles later — use a separate account for the other side.</p>
      </div>
      <div className="flex flex-col gap-4">
        {ROLES.map((r) => (
          <button
            key={r.role}
            type="button"
            disabled={pending !== null}
            onClick={() => choose(r.role, r.href)}
            className={cn(
              "flex w-full items-center gap-4 rounded-lg border border-border bg-card p-6 text-left transition-colors hover:bg-card-raised focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:outline-none disabled:cursor-default",
              pending !== null && pending !== r.role && "opacity-50",
              pending === r.role && "bg-card-raised ring-2 ring-accent",
            )}
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-border bg-card-raised text-accent">
              <r.icon className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <span>
              <span className="block font-medium">{pending === r.role ? "Setting up…" : r.title}</span>
              <span className="block text-sm text-foreground-muted">{r.description}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
