-- Optional "apply by" date on a campaign, shown up front in the creator's
-- Brief Feed alongside the budget. Nullable: existing campaigns are open-ended.
alter table public.campaigns add column if not exists deadline date;
