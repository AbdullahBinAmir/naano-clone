import { PageHeader } from "@/components/layout/page-header";
import { DealBoard } from "@/components/brand/board/deal-board";
import { requireProfile } from "@/lib/auth/require-profile";
import { createClient } from "@/lib/supabase/server";
import { getBrandDeals } from "@/lib/brand/get-brand-deals";
import { PaymentReturnToast } from "@/components/brand/payment-return-toast";

export default async function BrandCollaborationsPage({ searchParams }: { searchParams: Promise<{ payment?: string }> }) {
  const { payment } = await searchParams;
  const { user } = await requireProfile("brand");
  const supabase = await createClient();
  const deals = await getBrandDeals(supabase, user.id);

  return (
    <>
      <PageHeader
        eyebrow="Collaborations"
        title="Deal board"
        description="Every deal by stage. Drag a pitch to Awaiting payment to accept it, then pay to start the work — later stages move when the creator acts."
      />
      <PaymentReturnToast state={payment ?? null} />
      <DealBoard deals={deals} />
    </>
  );
}
