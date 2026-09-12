"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FloatingAssistantBar } from "@/components/layout/floating-assistant-bar";
import type { NavItem } from "@/components/layout/sidebar";
import { useDemoPersonaStore } from "@/stores/demo-persona-store";
import { creatorCards } from "@/lib/demo-data";

export function DashboardAssistant({
  role,
  navItems,
}: {
  role: "creator" | "brand";
  navItems: readonly NavItem[];
}) {
  const router = useRouter();
  const { creator } = useDemoPersonaStore();

  const quickActions =
    role === "creator"
      ? [
          {
            label: "Copy my card link",
            onSelect: () => {
              const slug = creatorCards[creator].cardSlug;
              navigator.clipboard.writeText(`https://naano.com/creators/${slug}`);
              toast.success("Card link copied");
            },
          },
          {
            label: "View my public card",
            onSelect: () => router.push(`/creators/${creatorCards[creator].cardSlug}`),
          },
        ]
      : [];

  return <FloatingAssistantBar navItems={navItems} quickActions={quickActions} />;
}
