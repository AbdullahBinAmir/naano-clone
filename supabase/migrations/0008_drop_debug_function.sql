-- Cleans up the temporary diagnostic function used to confirm the messages
-- table's Realtime publication membership while debugging Phase 6.
drop function if exists public.debug_realtime_publication_check();
