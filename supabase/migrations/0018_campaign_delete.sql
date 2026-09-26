-- Lets a brand delete its own brief, but only while nobody has applied to or
-- been booked on it. Once a collaboration references the campaign the brief
-- is part of that deal's history, so it can only be closed (collaborations.
-- campaign_id would otherwise be nulled and the deal would lose its context).

drop policy if exists "campaigns: owner can delete unused brief" on public.campaigns;
create policy "campaigns: owner can delete unused brief" on public.campaigns
  for delete to authenticated
  using (
    auth.uid() = brand_profile_id
    and not exists (select 1 from public.collaborations c where c.campaign_id = campaigns.id)
  );
