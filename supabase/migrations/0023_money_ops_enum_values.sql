-- New enum values for refunds, disputes and payout reversals. Run this file on
-- its own, before 0024 (Postgres can't use a new enum value in the same
-- transaction that adds it).
alter type public.collaboration_status add value if not exists 'disputed' after 'in_review';
alter type public.collaboration_status add value if not exists 'refunded' after 'declined';
alter type public.earnings_type add value if not exists 'payout_reversal';
