-- Demo helper (NOT a migration): nothing in the app sets collaborations.due_date
-- yet, so the brand overview's date strip, countdown timers and deal progress
-- dots have nothing to show. Run in the Supabase SQL editor to give the
-- existing active / needs_action demo deals staggered due dates.
with ranked as (
  select id, row_number() over (order by created_at) as n
  from public.collaborations
  where status in ('active', 'needs_action') and due_date is null
)
update public.collaborations c
set due_date = current_date + (r.n * 3)::int
from ranked r
where c.id = r.id;
