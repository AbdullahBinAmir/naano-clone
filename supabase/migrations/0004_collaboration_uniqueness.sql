-- Phase 5 fix — applyToCampaignAction and inviteCreatorAction both did a
-- SELECT-then-INSERT duplicate check, which is a classic check-then-act
-- race: two near-simultaneous calls (a double-click, a retried request)
-- could both pass the SELECT before either INSERT lands, creating a
-- duplicate. Enforcing uniqueness at the database level closes that gap
-- regardless of application-layer timing. The app now catches the
-- resulting unique-violation (Postgres error 23505) and shows a friendly
-- message instead of the raw error.
--
-- Run this in the Supabase SQL Editor same as the earlier migrations.

-- A creator can only have one collaboration per campaign.
create unique index collaborations_unique_campaign_application
  on public.collaborations (campaign_id, creator_profile_id)
  where campaign_id is not null;

-- A brand can only have one direct (non-campaign) outreach per creator.
create unique index collaborations_unique_direct_outreach
  on public.collaborations (brand_profile_id, creator_profile_id)
  where campaign_id is null;
