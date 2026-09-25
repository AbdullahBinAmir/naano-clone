"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FloatingAssistantBar } from "@/components/layout/floating-assistant-bar";
import type { NavItem } from "@/components/layout/sidebar";

export function DashboardAssistant({
  role,
  navItems,
  publicCardHandle,
}: {
  role: "creator" | "brand";
  navItems: readonly NavItem[];
  /** The signed-in creator's published card handle; null when no card is published. */
  publicCardHandle: string | null;
}) {
  const router = useRouter();

  const quickActions =
    role !== "creator"
      ? []
      : publicCardHandle
        ? [
            {
              label: "Copy my card link",
              onSelect: () => {
                navigator.clipboard.writeText(`${window.location.origin}/creators/${publicCardHandle}`);
                toast.success("Card link copied");
              },
            },
            {
              label: "View my public card",
              onSelect: () => router.push(`/creators/${publicCardHandle}`),
            },
          ]
        : [
            {
              label: "Publish my card",
              onSelect: () => router.push("/dashboard/creator/card"),
            },
          ];

  return <FloatingAssistantBar navItems={navItems} quickActions={quickActions} />;
}
