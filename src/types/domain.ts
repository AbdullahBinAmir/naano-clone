// Domain types mirrored 1:1 to the planned Supabase schema (see the plan doc).
// Phase 1 demo-data accessors return these shapes directly; Phase 2+ Supabase
// accessors return the same shapes so call sites don't change when the data
// source is swapped.

export type Role = "creator" | "brand" | "admin";

export interface Profile {
  id: string;
  role: Role;
  email: string;
  displayName: string;
  avatarUrl: string;
  locale: "en" | "fr";
}

export interface CreatorProfile {
  profileId: string;
  handle: string;
  displayName: string;
  avatarUrl: string;
  headline: string;
  bio: string;
  location: string;
  categoryTags: string[];
  followerCount: number;
  isMarketplaceVisible: boolean;
  linkedinPublicUrl: string;
}

export interface CreatorCard {
  creatorProfileId: string;
  pricePerPost: number;
  bannerUrl: string;
  cardSlug: string;
  dealLinkToken: string;
  publishedAt: string | null;
  sharePercent: number;
  rewardWindowMonths: number;
  samplePostUrls: string[];
}

export type PlanTier = "self_serve" | "managed";

export interface BrandProfile {
  profileId: string;
  companyName: string;
  industry: string;
  logoUrl: string;
  planTier: PlanTier;
}

export type CampaignStatus = "draft" | "published" | "closed";

export interface Campaign {
  id: string;
  brandProfileId: string;
  title: string;
  briefText: string;
  budget: number;
  targetVertical: string;
  status: CampaignStatus;
  createdAt: string;
}

export type CollaborationStatus =
  | "applied"
  | "needs_action"
  | "active"
  | "declined"
  | "completed";

export interface Collaboration {
  id: string;
  campaignId: string | null;
  campaignTitle: string;
  creatorProfileId: string;
  brandProfileId: string;
  brandName: string;
  brandLogoUrl: string;
  status: CollaborationStatus;
  agreedPrice: number;
  netPayoutToCreator: number;
  nextActionText: string;
  dueDate: string | null;
  performanceReach: number[];
}

export interface Conversation {
  id: string;
  collaborationId: string | null;
  participantName: string;
  participantAvatarUrl: string;
  isSystem: boolean;
  lastMessageAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderName: string;
  senderIsSelf: boolean;
  body: string;
  createdAt: string;
}

export type EarningsType = "collaboration_payout" | "affiliate_reward" | "referral_bonus";
export type EarningsStatus = "pending" | "in_transit" | "available" | "withdrawn";

export interface EarningsEntry {
  id: string;
  creatorProfileId: string;
  collaborationId: string | null;
  amount: number;
  type: EarningsType;
  status: EarningsStatus;
  createdAt: string;
}

export interface MonthlyEarnings {
  month: string;
  amount: number;
}

export type PayoutMethodType = "bank_transfer" | "stripe_connect";

export interface PayoutMethod {
  id: string;
  creatorProfileId: string;
  methodType: PayoutMethodType;
  bankAccountHolder: string | null;
  bankLastFour: string | null;
  isActive: boolean;
}

export type ReferralType = "invite_brand" | "invite_creator";
export type ReferralStatus = "pending" | "activated" | "rewarded" | "expired";

export interface AffiliateReferral {
  id: string;
  referrerProfileId: string;
  referralType: ReferralType;
  referralCode: string;
  sharePercent: number;
  rewardWindowMonths: number;
  status: ReferralStatus;
}

export type AnalyticsSource = "manual_entry" | "csv_upload";

export interface AnalyticsSnapshot {
  creatorProfileId: string;
  capturedAt: string;
  publicPostReach: number | null;
  publicPostsCount: number;
  publicEngagements: number;
  followerCount: number | null;
  pctPostsWithReachData: number;
  source: AnalyticsSource | null;
  reachHistory: { date: string; reach: number; engagements: number }[];
}

export interface LinkedInPost {
  id: string;
  creatorProfileId: string;
  originalPostUrl: string;
  postedAt: string;
  reach: number | null;
  engagements: number;
  hasReachData: boolean;
}

export interface LaunchGuideStep {
  id: string;
  title: string;
  description: string;
  status: "complete" | "locked" | "todo";
}
