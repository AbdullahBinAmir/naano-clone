-- Phase 5 — creators browsing Opportunities need to see the brand's
-- company_name/logo_url for a published campaign, but brand_profiles was
-- owner-select-only (Phase 2). Postgres combines multiple permissive SELECT
-- policies on the same table with OR, so this just adds an exception
-- alongside the existing owner policy rather than replacing it.
--
-- Run this in the Supabase SQL Editor same as the earlier migrations.

create policy "brand_profiles: readable if it has a published campaign" on public.brand_profiles
  for select using (
    exists (
      select 1 from public.campaigns c
      where c.brand_profile_id = brand_profiles.profile_id
        and c.status = 'published'
    )
  );
