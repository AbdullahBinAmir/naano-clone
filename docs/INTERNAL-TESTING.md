# Internal testing guide

This build is for internal testers. **All money is simulated** — earnings,
withdrawals and billing figures are database records; nothing is charged or paid
out. Pages that show money carry a "Test mode" notice.

## Before you start

The database must have every migration in `supabase/migrations/` applied,
in order (`0015_notifications.sql` powers the notification bell; `0016_security_hardening.sql` closes the audit findings; `0017_profile_images_storage.sql` creates the image bucket for avatar, banner and logo uploads; `0018_campaign_delete.sql` lets brands delete unused briefs).
Supabase auth redirect URLs must include `<site>/auth/callback`.

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
3. *Collaborations* — drag deals on the board (or use the buttons) to accept or decline.
4. Public creator card → **Book a post** sends a direct offer at the creator's price.
5. *Billing*, *Messages*, *Settings* (company logo, name, industry, password).

**Creator**
1. *My card* — upload a banner and profile photo, edit and publish your card; *Copy my card link* from the assistant (⌘K).
2. *Opportunities* — filter/sort open briefs, **Apply** with an optional pitch note.
3. *Collaborations* — accept or decline offers; mark an active deal as posted.
4. *Earnings* — payout appears "in transit", then "available"; save bank details and withdraw (simulated).
5. *Affiliate* — copy your invite links; open one in a private window to test the referral flow.
6. *Analytics*, *Community*, *Messages*, *Settings*.

**Everyone:** password reset (`/forgot-password`), the notification bell,
mobile layout (sidebar becomes a drawer).

## Known limitations

- Payments are not connected. Earnings, withdrawals and billing are simulated ledger entries.
- Briefs can be deleted only while nobody has applied; after that they can only be closed.
- Creators can't change their public handle.
- On the marketing landing page, creators without an uploaded photo are shown with stock portraits (Unsplash); an uploaded profile photo always replaces it. Dashboards show initials until a photo is uploaded.
- The landing page's sample brands and campaign figures are fictional, static illustrations.
- The French language switcher and notification preferences are not implemented.
- Notifications only exist for events after migration `0015` was applied.

## Reporting a bug

Include: account used, page URL, what you did, what you expected, what happened,
and a screenshot. A reference code shown on an error page helps.
