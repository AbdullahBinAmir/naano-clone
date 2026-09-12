-- Phase 6 fix — a real bug found via testing: the Phase 2
-- conversation_participants SELECT policy ("participants can select the
-- roster") queries conversation_participants from *within its own policy*
-- to check membership. Postgres re-applies RLS to that inner query too,
-- which re-triggers the same policy, forever — error 42P17
-- (infinite_recursion). The conversations and messages SELECT/INSERT
-- policies have the same problem one level removed, since their EXISTS
-- subqueries against conversation_participants trigger its (recursive)
-- policy too.
--
-- The standard fix: a SECURITY DEFINER helper that checks membership
-- without RLS applying to its *internal* query (a function owned by
-- postgres, which owns the table, bypasses RLS the same way a superuser
-- would), then have every affected policy call the function instead of
-- querying conversation_participants directly.
--
-- Run this in the Supabase SQL Editor same as the earlier migrations.

create or replace function public.is_conversation_participant(p_conversation_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.conversation_participants
    where conversation_id = p_conversation_id and profile_id = auth.uid()
  );
$$;

grant execute on function public.is_conversation_participant(uuid) to authenticated;

drop policy if exists "conversation_participants: participants can select the roster" on public.conversation_participants;
create policy "conversation_participants: participants can select the roster" on public.conversation_participants
  for select using (public.is_conversation_participant(conversation_id));

drop policy if exists "conversations: participants can select" on public.conversations;
create policy "conversations: participants can select" on public.conversations
  for select using (public.is_conversation_participant(id));

drop policy if exists "messages: participants can select" on public.messages;
create policy "messages: participants can select" on public.messages
  for select using (public.is_conversation_participant(conversation_id));

drop policy if exists "messages: participants can insert as themselves" on public.messages;
create policy "messages: participants can insert as themselves" on public.messages
  for insert with check (
    auth.uid() = sender_profile_id
    and public.is_conversation_participant(conversation_id)
  );
