-- Phase 6 — turn on Realtime replication for messages so the inbox can
-- subscribe to new-message inserts live instead of polling/refreshing.
-- Supabase's postgres_changes feature only broadcasts changes for tables
-- explicitly added to the supabase_realtime publication.
--
-- Run this in the Supabase SQL Editor same as the earlier migrations.

alter publication supabase_realtime add table public.messages;
