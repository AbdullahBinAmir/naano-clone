import type { CampaignRow, CollaborationRow } from "@/types/database";
import type { Campaign, Collaboration } from "@/types/domain";

export function rowToCampaign(row: CampaignRow): Campaign {
  return {
    id: row.id,
    brandProfileId: row.brand_profile_id,
    title: row.title,
    briefText: row.brief_text,
    budget: row.budget,
    targetVertical: row.target_vertical,
    status: row.status,
    createdAt: row.created_at,
  };
}

export function rowToCollaboration(row: CollaborationRow): Collaboration {
  return {
    id: row.id,
    campaignId: row.campaign_id,
    campaignTitle: row.campaign_title,
    creatorProfileId: row.creator_profile_id,
    brandProfileId: row.brand_profile_id,
    brandName: row.brand_name,
    brandLogoUrl: row.brand_logo_url,
    status: row.status,
    agreedPrice: row.agreed_price,
    netPayoutToCreator: row.net_payout_to_creator,
    nextActionText: row.next_action_text,
    dueDate: row.due_date,
    // No real performance-tracking source yet — the sparkline stays empty
    // (DataTable already renders "—" for that case) rather than faked.
    performanceReach: [],
  };
}
