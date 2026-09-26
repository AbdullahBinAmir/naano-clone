-- New collaboration state: an accepted deal now waits for the brand to fund it
-- (Safepay checkout) before the creator starts work. Kept in its own migration
-- because Postgres cannot use a new enum value in the same transaction that
-- adds it — 0020 uses it. Run this file first, on its own.
alter type public.collaboration_status add value if not exists 'pending_payment' before 'active';
