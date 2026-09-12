import type { CreatorCardRow, CreatorProfileRow } from "@/types/database";
import type { CreatorCard, CreatorProfile } from "@/types/domain";

// Bridges real Supabase rows (snake_case) to the domain shape the Phase 1 UI
// components (CreatorCardPreview, etc.) already expect, so those components
// don't need to change as each module goes live.

export function rowToCreatorProfile(row: CreatorProfileRow): CreatorProfile {
  return {
    profileId: row.profile_id,
    handle: row.handle,
    displayName: row.display_name,
    avatarUrl: row.avatar_url,
    headline: row.headline,
    bio: row.bio,
    location: row.location,
    categoryTags: row.category_tags,
    followerCount: row.follower_count,
    isMarketplaceVisible: row.is_marketplace_visible,
    linkedinPublicUrl: row.linkedin_public_url,
  };
}

export function rowToCreatorCard(row: CreatorCardRow): CreatorCard {
  return {
    creatorProfileId: row.creator_profile_id,
    pricePerPost: row.price_per_post,
    bannerUrl: row.banner_url,
    cardSlug: row.card_slug,
    dealLinkToken: row.deal_link_token,
    publishedAt: row.published_at,
    sharePercent: row.share_percent,
    rewardWindowMonths: row.reward_window_months,
    samplePostUrls: row.sample_post_urls,
  };
}
