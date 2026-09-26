# Internal testing guide

This build is for internal testers. Brands pay accepted deals through **Safepay's sandbox** (test cards, no real money). Creator earnings and withdrawals are still
simulated ledger records — nothing is paid out to a real bank account. Pages that
show money carry a "Test mode" notice.

## Before you start

The database must have every migration in `supabase/migrations/` applied,
in order (`0015_notifications.sql` powers the notification bell; `0016_security_hardening.sql` closes the audit findings; `0017_profile_images_storage.sql` creates the image bucket for avatar, banner and logo uploads; `0018_campaign_delete.sql` lets brands delete unused briefs; `0019` then `0020` — run them one at a time, in that order — add the Safepay payment flow; `0021` then `0022` — again one at a time — add post review and payout release; `0023` then `0024` — one at a time — add disputes, refunds, auto-approval, unpaid-deal expiry and the admin payout queue).
Supabase auth redirect URLs must include `<site>/auth/callback`.

## Admin account

Money operations (payout queue, disputes, refunds) live at `/dashboard/admin`. There is no sign-up for admins:
create an ordinary account (e.g. `admin@naano.demo`, password `12345678`), then promote it in the Supabase SQL editor:

```sql
update public.profiles set role = 'admin' where email = 'admin@naano.demo';
```

Automatic jobs run daily at 06:00 UTC via Vercel Cron (`vercel.json` → `/api/cron/daily`, protected by `CRON_SECRET`):
posts the brand hasn't reviewed for 5 days are auto-approved, and deals unpaid after 3 days are cancelled
(both windows are in `platform_settings`).

## Test accounts

All passwords: `12345678`.

| Role | Email |
|---|---|
| Creator | alexis@naano.demo (top creator, most data) |
| Creator | marcus@naano.demo |
| Creator | juliette@naano.demo |
| Brand | ferngrove@naano.demo |
| Brand | bramble@naano.demo |
| Brand | northloop@naano.demo |

Sign up with a new email to test onboarding — choose creator or brand.

## Walkthrough

**Brand**
1. *Briefs* — write a brief, watch the live preview, save as draft, publish, edit, close, reopen or delete it.
2. *Match* — browse creators, message one, or open the *Pitches* tab to review applicants side by side.
3. *Collaborations* — drag deals on the board (or use the buttons) to accept or decline. Pay accepted deals with **Pay now** (Safepay sandbox test card), then review the creator's submitted post: **Approve** releases the payout, **Changes** sends it back with a note.
4. Public creator card → **Book a post** sends a direct offer at the creator's price.
5. *Billing*, *Messages*, *Settings* (company logo, name, industry, password).

**Creator**
1. *My card* — upload a banner and profile photo, edit and publish your card; *Copy my card link* from the assistant (⌘K).
2. *Opportunities* — filter/sort open briefs, **Apply** with an optional pitch note.
3. *Collaborations* — accept or decline offers; once the brand has paid, publish on LinkedIn and **Submit post** with the post link. The brand reviews it; on approval your payout is added to your balance (if they ask for changes, edit and resubmit).
4. *Earnings* — payout appears "in transit", then "available"; save bank details and withdraw (simulated).
5. *Affiliate* — copy your invite links; open one in a private window to test the referral flow.
6. *Analytics*, *Community*, *Messages*, *Settings*.

**Everyone:** password reset (`/forgot-password`), the notification bell,
mobile layout (sidebar becomes a drawer).

## Known limitations

- Payouts to creators are sent **manually** by an admin from the payout queue (the creator enters IBAN/account details; the admin transfers the money and marks it paid). Refunds are recorded by an admin after returning the money from the Safepay dashboard — Safepay's refund API is not connected.
- Brand payments use Safepay sandbox. Creator earnings, withdrawals and payout are simulated ledger entries; the payout is released to the creator's simulated balance when the brand approves the post; there is no refund, dispute or auto-approval step yet.
- Accepting a deal now moves it to "Awaiting payment"; the brand pays from the Deal board. The seed script funds seeded deals directly only if `SUPABASE_SECRET_KEY` is set.
- Briefs can be deleted only while nobody has applied; after that they can only be closed.
- Creators can't change their public handle.
- On the marketing landing page, creators without an uploaded photo are shown with stock portraits (Unsplash); an uploaded profile photo always replaces it. Dashboards show initials until a photo is uploaded.
- The landing page's sample brands and campaign figures are fictional, static illustrations.
- The French language switcher and notification preferences are not implemented.
- Notifications only exist for events after migration `0015` was applied.

## Reporting a bug

Include: account used, page URL, what you did, what you expected, what happened,
and a screenshot. A reference code shown on an error page helps.
