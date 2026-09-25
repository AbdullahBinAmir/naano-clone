import { PageHeader } from "@/components/layout/page-header";
import { DealBoard } from "@/components/brand/board/deal-board";
import { requireProfile } from "@/lib/auth/require-profile";
import { createClient } from "@/lib/supabase/server";
import { getBrandDeals } from "@/lib/brand/get-brand-deals";

export default async function BrandCollaborationsPage() {
  const { user } = await requireProfile("brand");
  const supabase = await createClient();
  const deals = await getBrandDeals(supabase, user.id);

  return (
    <>
      <PageHeader
        eyebrow="Collaborations"
        title="Deal board"
        description="Every deal by stage. Drag a pitch to Active to accept it, or to Declined — later stages move when the creator acts."
      />
      <DealBoard deals={deals} />
    </>
  );
}
