"use client";

import { Compass, Inbox } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsIndicator, TabsList, TabsPanel, TabsTab } from "@/components/ui/tabs";
import { MatchGrid } from "@/components/brand/match-grid";
import { PitchesInbox } from "@/components/brand/pitches-inbox";
import type { Pitch } from "@/lib/brand/get-pitches";

type MatchCreators = React.ComponentProps<typeof MatchGrid>["creators"];

export function MatchWorkspace({ pitches, creators }: { pitches: Pitch[]; creators: MatchCreators }) {
  return (
    <>
      <PageHeader
        eyebrow="Match"
        title="Pitches & creators"
        description="Review who applied to your campaigns side by side, or go find creators your buyers already trust."
      />
      <Tabs defaultValue={pitches.length > 0 ? "pitches" : "discover"}>
        <TabsList className="w-fit">
          <TabsIndicator />
          <TabsTab value="pitches">
            <Inbox className="h-4 w-4" strokeWidth={1.75} />
            Pitches
            <span className="rounded-full bg-card-raised px-2 py-0.5 text-xs tabular-nums">{pitches.length}</span>
          </TabsTab>
          <TabsTab value="discover">
            <Compass className="h-4 w-4" strokeWidth={1.75} />
            Discover creators
          </TabsTab>
        </TabsList>
        <TabsPanel value="pitches" className="mt-6">
          <PitchesInbox pitches={pitches} />
        </TabsPanel>
        <TabsPanel value="discover" className="mt-6 flex flex-col gap-6">
          <MatchGrid creators={creators} />
        </TabsPanel>
      </Tabs>
    </>
  );
}
