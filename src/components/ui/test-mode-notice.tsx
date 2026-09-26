import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/utils";

/** Reminder that money in this build is a ledger simulation — no card charges, no bank transfers. */
export function TestModeNotice({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      role="note"
      className={cn(
        "flex items-start gap-3 rounded-lg bg-accent-soft px-5 py-4 text-sm text-accent-soft-foreground",
        className,
      )}
    >
      <FlaskConical className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.75} />
      <p>
        <span className="font-semibold">Test mode.</span> {children}
      </p>
    </div>
  );
}
