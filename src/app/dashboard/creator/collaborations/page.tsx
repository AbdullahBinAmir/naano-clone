import { PageHeader } from "@/components/layout/page-header";
import { CollaborationsTable } from "@/components/creator/collaborations-table";
import { requireProfile } from "@/lib/auth/require-profile";
import { createClient } from "@/lib/supabase/server";
import { rowToCollaboration } from "@/lib/mappers/campaign";
import type { CollaborationRow } from "@/types/database";

export default async function CollaborationsPage() {
  const { user } = await requireProfile("creator");
  const supabase = await createClient();

  const { data } = await supabase
    .from("collaborations")
    .select("*")
    .eq("creator_profile_id", user.id)
    .order("created_at", { ascending: false });

  const collaborations = ((data ?? []) as CollaborationRow[]).map(rowToCollaboration).map((c) => ({
    ...c,
    counterpartName: c.brandName,
    counterpartLogoUrl: c.brandLogoUrl,
  }));

  return (
    <>
      <PageHeader
        eyebrow="Collaborations"
        title="Collaborations"
        description="Every step tells you where you stand, what to do, and what happens if you do nothing."
      />
      <CollaborationsTable collaborations={collaborations} viewer="creator" counterpartLabel="Brand" />
    </>
  );
}
