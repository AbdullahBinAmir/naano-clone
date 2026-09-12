import { PageHeader } from "@/components/layout/page-header";
import { CollaborationsTable } from "@/components/creator/collaborations-table";
import { requireProfile } from "@/lib/auth/require-profile";
import { createClient } from "@/lib/supabase/server";
import { rowToCollaboration } from "@/lib/mappers/campaign";
import type { CollaborationRow, CreatorProfileRow } from "@/types/database";

export default async function BrandCollaborationsPage() {
  const { user } = await requireProfile("brand");
  const supabase = await createClient();

  const { data } = await supabase
    .from("collaborations")
    .select("*")
    .eq("brand_profile_id", user.id)
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as CollaborationRow[];

  const creatorIds = [...new Set(rows.map((r) => r.creator_profile_id))];
  const { data: creators } =
    creatorIds.length > 0
      ? await supabase.from("creator_profiles").select("profile_id, display_name, avatar_url").in("profile_id", creatorIds)
      : { data: [] };
  const creatorById = new Map(((creators ?? []) as Pick<CreatorProfileRow, "profile_id" | "display_name" | "avatar_url">[]).map((c) => [c.profile_id, c]));

  const collaborations = rows.map(rowToCollaboration).map((c) => {
    const creator = creatorById.get(c.creatorProfileId);
    return {
      ...c,
      counterpartName: creator?.display_name ?? "Creator",
      counterpartLogoUrl: creator?.avatar_url ?? "",
    };
  });

  return (
    <>
      <PageHeader
        eyebrow="Collaborations"
        title="Collaborations"
        description="Applications to your campaigns and the creators you've invited directly."
      />
      <CollaborationsTable collaborations={collaborations} viewer="brand" counterpartLabel="Creator" />
    </>
  );
}
