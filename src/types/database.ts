// Hand-authored to match supabase/migrations/0001_init.sql exactly, since
// `supabase gen types` needs a CLI-linked project or DB password we don't
// have yet. Update this file alongside any future migration.

export type AppRole = "creator" | "brand" | "admin";
export type PlanTier = "self_serve" | "managed";
export type CampaignStatus = "draft" | "published" | "closed";
export type CollaborationStatus = "applied" | "needs_action" | "pending_payment" | "active" | "in_review" | "declined" | "completed";
export type EarningsType = "collaboration_payout" | "affiliate_reward" | "referral_bonus";
export type EarningsStatus = "pending" | "in_transit" | "available" | "withdrawn";
export type PayoutMethodType = "bank_transfer" | "stripe_connect";
export type ReferralType = "invite_brand" | "invite_creator";
export type ReferralStatus = "pending" | "activated" | "rewarded" | "expired";
export type AnalyticsSource = "manual_entry" | "csv_upload";

// Matches postgrest-js's GenericTable constraint exactly (Row/Insert/Update/
// Relationships) — omitting `Relationships` silently makes every query
// resolve to `never` instead of a type error, which is what happened here.
interface Table<Row, Insert, Update = Partial<Insert>> {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
}

export type ProfileRow = {
  id: string;
  role: AppRole;
  email: string;
  locale: "en" | "fr";
  created_at: string;
}

export type CreatorProfileRow = {
  profile_id: string;
  handle: string;
  display_name: string;
  avatar_url: string;
  headline: string;
  bio: string;
  location: string;
  category_tags: string[];
  follower_count: number;
  is_marketplace_visible: boolean;
  linkedin_public_url: string;
  created_at: string;
}

export type CreatorCardRow = {
  id: string;
  creator_profile_id: string;
  price_per_post: number;
  banner_url: string;
  card_slug: string;
  deal_link_token: string;
  published_at: string | null;
  share_percent: number;
  reward_window_months: number;
  sample_post_urls: string[];
  created_at: string;
}

export type BrandProfileRow = {
  profile_id: string;
  company_name: string;
  logo_url: string;
  industry: string;
  plan_tier: PlanTier;
  created_at: string;
}

export type CampaignRow = {
  id: string;
  brand_profile_id: string;
  title: string;
  brief_text: string;
  budget: number;
  target_vertical: string;
  status: CampaignStatus;
  /** Optional "apply by" date (YYYY-MM-DD); null = open-ended. */
  deadline: string | null;
  created_at: string;
}

export type CollaborationRow = {
  id: string;
  campaign_id: string | null;
  campaign_title: string;
  creator_profile_id: string;
  brand_profile_id: string;
  brand_name: string;
  brand_logo_url: string;
  status: CollaborationStatus;
  agreed_price: number;
  net_payout_to_creator: number;
  next_action_text: string;
  due_date: string | null;
  /** Set when the brand's Safepay payment for this deal was verified. */
  funded_at: string | null;
  /** LinkedIn post URL the creator submitted for review. */
  post_url: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  /** The brand's note when it asked for changes; cleared on resubmission. */
  revision_note: string | null;
  performance_snapshot: Record<string, unknown>;
  created_at: string;
}

export type PaymentStatus = "pending" | "paid" | "failed" | "cancelled";

export type PaymentRow = {
  id: string;
  collaboration_id: string;
  brand_profile_id: string;
  order_id: string;
  tracker: string | null;
  price: number;
  platform_fee: number;
  gross_amount: number;
  currency: "USD" | "PKR";
  status: PaymentStatus;
  paid_at: string | null;
  raw: Record<string, unknown>;
  created_at: string;
}

export type PaymentEventRow = {
  id: string;
  dedupe_key: string;
  tracker: string | null;
  source: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export type PlatformSettingsRow = { id: true; fee_percent: number }

export type ConversationRow = {
  id: string;
  collaboration_id: string | null;
  is_system: boolean;
  created_at: string;
}

export type ConversationParticipantRow = {
  conversation_id: string;
  profile_id: string;
}

export type MessageRow = {
  id: string;
  conversation_id: string;
  sender_profile_id: string | null;
  body: string;
  is_system: boolean;
  created_at: string;
}

export type EarningsLedgerRow = {
  id: string;
  creator_profile_id: string;
  collaboration_id: string | null;
  amount: number;
  type: EarningsType;
  status: EarningsStatus;
  created_at: string;
}

export type PayoutMethodRow = {
  id: string;
  creator_profile_id: string;
  method_type: PayoutMethodType;
  bank_account_holder: string | null;
  bank_last_four: string | null;
  is_active: boolean;
  created_at: string;
}

export type AffiliateReferralRow = {
  id: string;
  referrer_profile_id: string;
  referred_profile_id: string | null;
  referral_type: ReferralType;
  referral_code: string;
  status: ReferralStatus;
  activation_event_at: string | null;
  reward_window_ends_at: string | null;
  created_at: string;
}

export type LinkedinAnalyticsSnapshotRow = {
  id: string;
  creator_profile_id: string;
  captured_at: string;
  public_post_reach: number | null;
  public_posts_count: number;
  public_engagements: number;
  follower_count: number | null;
  pct_posts_with_reach_data: number;
  source: AnalyticsSource | null;
  raw_payload: Record<string, unknown>;
}

export type LinkedinPostRow = {
  id: string;
  creator_profile_id: string;
  original_post_url: string;
  posted_at: string;
  reach: number | null;
  engagements: number;
  has_reach_data: boolean;
}

export type CardVisitRow = {
  id: string;
  creator_card_id: string;
  visited_at: string;
}

export type NotificationRow = {
  id: string;
  profile_id: string;
  type: string;
  payload: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: Table<ProfileRow, Pick<ProfileRow, "id" | "role" | "email"> & Partial<Pick<ProfileRow, "locale">>>;
      creator_profiles: Table<
        CreatorProfileRow,
        Pick<CreatorProfileRow, "profile_id" | "handle" | "display_name"> &
          Partial<Omit<CreatorProfileRow, "profile_id" | "handle" | "display_name" | "is_marketplace_visible" | "created_at">>
      >;
      creator_cards: Table<
        CreatorCardRow,
        Pick<CreatorCardRow, "creator_profile_id" | "card_slug"> &
          Partial<Omit<CreatorCardRow, "id" | "creator_profile_id" | "card_slug" | "created_at">>
      >;
      brand_profiles: Table<
        BrandProfileRow,
        Pick<BrandProfileRow, "profile_id" | "company_name"> &
          Partial<Omit<BrandProfileRow, "profile_id" | "company_name" | "created_at">>
      >;
      campaigns: Table<
        CampaignRow,
        Omit<CampaignRow, "id" | "created_at" | "status" | "deadline"> & Partial<Pick<CampaignRow, "status" | "deadline">>
      >;
      collaborations: Table<
        CollaborationRow,
        Omit<CollaborationRow, "id" | "created_at" | "due_date" | "funded_at" | "post_url" | "submitted_at" | "approved_at" | "revision_note" | "performance_snapshot"> &
          Partial<Pick<CollaborationRow, "due_date" | "funded_at" | "post_url" | "submitted_at" | "approved_at" | "revision_note" | "performance_snapshot">>
      >;
      payments: Table<PaymentRow, Omit<PaymentRow, "id" | "created_at" | "paid_at" | "raw" | "status" | "tracker"> & Partial<Pick<PaymentRow, "tracker" | "status" | "raw" | "paid_at">>>;
      payment_events: Table<PaymentEventRow, Omit<PaymentEventRow, "id" | "created_at">>;
      platform_settings: Table<PlatformSettingsRow, PlatformSettingsRow>;
      conversations: Table<ConversationRow, Partial<Omit<ConversationRow, "id" | "created_at">>>;
      conversation_participants: Table<ConversationParticipantRow, ConversationParticipantRow>;
      messages: Table<MessageRow, Omit<MessageRow, "id" | "created_at">>;
      earnings_ledger: Table<EarningsLedgerRow, Omit<EarningsLedgerRow, "id" | "created_at">>;
      payout_methods: Table<PayoutMethodRow, Omit<PayoutMethodRow, "id" | "created_at">>;
      affiliate_referrals: Table<
        AffiliateReferralRow,
        Pick<AffiliateReferralRow, "referrer_profile_id" | "referral_type" | "referral_code"> &
          Partial<Omit<AffiliateReferralRow, "id" | "created_at" | "referrer_profile_id" | "referral_type" | "referral_code">>
      >;
      linkedin_analytics_snapshots: Table<
        LinkedinAnalyticsSnapshotRow,
        Omit<LinkedinAnalyticsSnapshotRow, "id" | "captured_at">
      >;
      linkedin_posts: Table<LinkedinPostRow, Omit<LinkedinPostRow, "id">>;
      notifications: Table<NotificationRow, Omit<NotificationRow, "id" | "created_at">>;
      card_visits: Table<CardVisitRow, Pick<CardVisitRow, "creator_card_id">>;
    };
    Views: {
      marketplace_creators: { Row: CreatorProfileRow; Relationships: [] };
    };
    Functions: {
      create_collaboration_conversation: {
        Args: { p_collaboration_id: string; p_creator_profile_id: string; p_brand_profile_id: string };
        Returns: string;
      };
      ensure_naanobot_welcome: {
        Args: { p_creator_profile_id: string };
        Returns: void;
      };
      record_collaboration_payout: {
        Args: { p_collaboration_id: string };
        Returns: void;
      };
      settle_pending_earnings: {
        Args: Record<string, never>;
        Returns: void;
      };
      request_withdrawal: {
        Args: { p_amount: number };
        Returns: void;
      };
      redeem_referral_code: {
        Args: { p_code: string };
        Returns: void;
      };
      activate_referrals_for_completed_collaboration: {
        Args: { p_collaboration_id: string };
        Returns: void;
      };
      submit_collaboration_post: {
        Args: { p_collaboration_id: string; p_post_url: string };
        Returns: void;
      };
      approve_collaboration: {
        Args: { p_collaboration_id: string };
        Returns: void;
      };
      request_collaboration_revision: {
        Args: { p_collaboration_id: string; p_note: string };
        Returns: void;
      };
      apply_payment_success: {
        Args: { p_tracker: string; p_amount: number; p_currency: string; p_payload: Record<string, unknown> };
        Returns: void;
      };
      update_collaboration_status: {
        Args: { p_collaboration_id: string; p_action: string };
        Returns: void;
      };
      create_direct_conversation: {
        Args: { p_other_profile_id: string };
        Returns: string;
      };
    };
  };
}






