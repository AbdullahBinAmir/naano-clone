"use client";

import { useRouter } from "next/navigation";
import { Building2, Sparkles } from "lucide-react";
import { GlassCard } from "@/components/glass/glass-card";

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

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-xl font-semibold">How will you use Naano?</h1>
        <p className="mt-1 text-sm text-foreground-muted">You can always switch later from settings.</p>
      </div>
      <div className="flex flex-col gap-4">
        {ROLES.map((r) => (
          <GlassCard key={r.role} interactive className="flex items-center gap-4" onClick={() => router.push(r.href)}>
            <span className="glass-surface flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-accent">
              <r.icon className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <div>
              <p className="font-semibold">{r.title}</p>
              <p className="text-sm text-foreground-muted">{r.description}</p>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
