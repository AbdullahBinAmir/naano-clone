"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { motion } from "motion/react";
import { Sparkles, Search } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/components/layout/sidebar";

const CANNED_ANSWERS: { keywords: string[]; answer: string }[] = [
  {
    keywords: ["follower", "1000", "threshold", "unlock", "marketplace"],
    answer:
      "Marketplace visibility and Opportunities unlock once your public LinkedIn following reaches 1,000 — your card and workspace stay usable below that.",
  },
  {
    keywords: ["affiliate", "referral", "invite"],
    answer:
      "Inviting a creator earns you 25% of Naano's commission on their collaborations for 3 months, starting from their first completed paid collaboration — not from signup.",
  },
  {
    keywords: ["card", "deal link", "share"],
    answer:
      "Your card is your deal link — add it as a LinkedIn experience entry or send it directly to a brand. Naano attributes any resulting deal back to you automatically.",
  },
  {
    keywords: ["payout", "withdraw", "earning", "stripe", "bank"],
    answer:
      "Earnings move from pending → in transit → available as collaborations complete. Withdraw to a bank transfer once your details are on file.",
  },
];

function findAnswer(query: string) {
  const q = query.toLowerCase();
  return CANNED_ANSWERS.find((entry) => entry.keywords.some((k) => q.includes(k)))?.answer;
}

export function FloatingAssistantBar({
  navItems,
  quickActions = [],
}: {
  navItems: readonly NavItem[];
  quickActions?: { label: string; onSelect: () => void }[];
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const router = useRouter();

  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const answer = query.trim().length > 2 ? findAnswer(query) : undefined;

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
        <motion.button
          onClick={() => setOpen(true)}
          className="glass-surface-strong pointer-events-auto flex items-center gap-2 rounded-full px-5 py-3 text-sm text-foreground-muted transition-colors hover:text-foreground"
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", bounce: 0, duration: 0.3 }}
        >
          <Sparkles className="h-4 w-4 text-accent" strokeWidth={1.75} />
          What can I help you find?
          <kbd className="ml-1 hidden rounded border border-border-strong px-1.5 py-0.5 text-[10px] text-foreground-subtle sm:inline">
            ⌘K
          </kbd>
        </motion.button>
      </div>

      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="Naano assistant"
        shouldFilter={!answer}
        overlayClassName={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-200",
          "data-[state=closed]:opacity-0 data-[state=open]:opacity-100",
        )}
        contentClassName={cn(
          "glass-surface-strong fixed top-[18%] left-1/2 z-50 w-[min(34rem,92vw)] -translate-x-1/2 overflow-hidden rounded-xl outline-none",
          "transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "data-[state=closed]:scale-95 data-[state=closed]:opacity-0 data-[state=open]:scale-100 data-[state=open]:opacity-100",
        )}
      >
        <div className="flex items-center gap-2 border-b border-border px-4">
          <Search className="h-4 w-4 text-foreground-subtle" strokeWidth={1.75} />
          <Command.Input
            value={query}
            onValueChange={setQuery}
            placeholder="Ask Naano, or jump to a page…"
            className="h-14 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-foreground-subtle"
          />
        </div>
        <Command.List className="max-h-80 overflow-y-auto p-2">
          <Command.Empty className="px-3 py-6 text-sm text-foreground-muted">
            {answer ?? "I can't answer that yet — this assistant becomes fully capable in a later release."}
          </Command.Empty>

          {quickActions.length > 0 && (
            <Command.Group
              heading="Quick actions"
              className="px-1 py-1 text-xs text-foreground-subtle [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5"
            >
              {quickActions.map((action) => (
                <Command.Item
                  key={action.label}
                  onSelect={() => {
                    action.onSelect();
                    setOpen(false);
                  }}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm text-foreground-muted data-[selected=true]:bg-white/[0.07] data-[selected=true]:text-foreground"
                >
                  {action.label}
                </Command.Item>
              ))}
            </Command.Group>
          )}

          <Command.Group
            heading="Go to"
            className="px-1 py-1 text-xs text-foreground-subtle [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5"
          >
            {navItems.map((item) => (
              <Command.Item
                key={item.href}
                onSelect={() => {
                  router.push(item.href);
                  setOpen(false);
                }}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm text-foreground-muted data-[selected=true]:bg-white/[0.07] data-[selected=true]:text-foreground"
              >
                {item.label}
              </Command.Item>
            ))}
          </Command.Group>
        </Command.List>
      </Command.Dialog>
    </>
  );
}

export function assistantToast(message: string) {
  toast(message);
}
