-- Lets a brand read the creators it actually works with, so the brand
-- overview can show real names for pitches (including creators whose card
-- isn't published yet) and real post performance for creators it has booked.
-- All three policies are additive (permissive policies are OR'd) and scoped
-- strictly to creators that have a collaboration row with the caller as the
-- brand — a brand still can't browse arbitrary creators' data.
--
-- EXISTS subqueries only touch `collaborations`, whose own select policy
-- references no other table, so there is no policy recursion.

create policy "creator_profiles: brand can read collaboration creators" on public.creator_profiles
  for select using (
    exists (
      select 1 from public.collaborations c
      where c.creator_profile_id = creator_profiles.profile_id
        and c.brand_profile_id = auth.uid()
    )
  );

-- Post performance is only shared once a booking is underway or done, not
-- for a mere application or an unaccepted invite.
create policy "linkedin_posts: brand can read booked creators" on public.linkedin_posts
  for select using (
    exists (
      select 1 from public.collaborations c
      where c.creator_profile_id = linkedin_posts.creator_profile_id
        and c.brand_profile_id = auth.uid()
        and c.status in ('active', 'completed')
    )
  );

create policy "linkedin_analytics_snapshots: brand can read booked creators" on public.linkedin_analytics_snapshots
  for select using (
    exists (
      select 1 from public.collaborations c
      where c.creator_profile_id = linkedin_analytics_snapshots.creator_profile_id
        and c.brand_profile_id = auth.uid()
        and c.status in ('active', 'completed')
    )
  );
