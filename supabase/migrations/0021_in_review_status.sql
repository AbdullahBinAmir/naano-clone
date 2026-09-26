-- A funded deal's post is now reviewed by the brand before the creator is paid:
-- active -> in_review (creator submits the post link) -> completed (brand approves)
-- or back to active (brand asks for changes). New enum values can't be used in the
-- transaction that adds them, so this file must be run on its own, before 0022.
alter type public.collaboration_status add value if not exists 'in_review' after 'active';
