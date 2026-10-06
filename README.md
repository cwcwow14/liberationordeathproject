# LOD — Liberation or Death

A community platform for the LOD environmental movement. The site features a public-facing landing page with manifesto and movement goals, plus a members-only forum where activists can post threads, discuss topics, react to content, and organize.

## Key Technologies

- **Framework**: TanStack Start (React, SSR)
- **Routing**: TanStack Router (file-based)
- **Database**: Netlify Database (Postgres via Drizzle ORM)
- **Auth**: Netlify Identity (`@netlify/identity`)
- **Styling**: Custom CSS (Oswald + Inter fonts, dark green theme)
- **Deployment**: Netlify

## Running Locally

```bash
npm install
netlify dev --port 8889
```

> **Note**: Netlify Identity authentication only works on deployed Netlify environments. The `nf_jwt` cookie is set by the Netlify CDN, not the local dev server. To test auth, deploy a branch preview.

## Development

The landing page at `/` is publicly accessible. The forum at `/forum` requires authentication and redirects to `/login` for unauthenticated users.

## Paid memberships (Lemon Squeezy)

Three tiers — Supporter $3, Activist $8, Inner Circle $20 — sold through Lemon Squeezy.
Tier names, prices shown on the site, and perks live in `src/lib/tiers.ts`.

### One-time setup

1. **Lemon Squeezy store** — create a store at lemonsqueezy.com and complete store activation
   (identity verification + payout details). Until it is activated, use Test mode.
2. **Product** — create one product, "LOD Membership", with three **subscription variants**
   (monthly): Supporter $3, Activist $8, Inner Circle $20. Note each variant's ID
   (Products → the product → variant → the number in the URL / "Copy ID").
3. **API key** — Settings → API → create a key.
4. **Webhook** — Settings → Webhooks → add:
   - URL: `https://liberationordeath.net/api/lemonsqueezy-webhook`
   - Signing secret: any long random string
   - Events: `subscription_created`, `subscription_updated`, `subscription_cancelled`,
     `subscription_resumed`, `subscription_expired`, `subscription_paused`, `subscription_unpaused`
5. **Plan changes** — in your store settings, enable plan changes in the Customer Portal
   between the three variants, so members can upgrade/downgrade themselves.
6. **Netlify env vars** — Site configuration → Environment variables:

   | Variable | Value |
   |---|---|
   | `LEMONSQUEEZY_API_KEY` | API key from step 3 |
   | `LEMONSQUEEZY_STORE_ID` | Store ID (Settings → Stores) |
   | `LEMONSQUEEZY_WEBHOOK_SECRET` | Signing secret from step 4 |
   | `LEMONSQUEEZY_VARIANT_SUPPORTER` | Variant ID |
   | `LEMONSQUEEZY_VARIANT_ACTIVIST` | Variant ID |
   | `LEMONSQUEEZY_VARIANT_INNER_CIRCLE` | Variant ID |
   | `ADMIN_EMAILS` | Your login email (comma-separate several) |

7. **Redeploy** so the env vars and the new database migration take effect.
8. **Test** — in Lemon Squeezy Test mode, buy a tier with card `4242 4242 4242 4242`, confirm
   `/members` unlocks, then cancel from "Manage membership".

### Publishing to members

Sign in with an `ADMIN_EMAILS` account and open `/members` → **Admin — publish to members**:

- **The Dispatch** — the bi-weekly newsletter issue (all tiers).
- **Exclusive post / video** — Activist and up by default. A direct `.mp4` link plays inline;
  any other link (unlisted YouTube, Vimeo, Drive…) shows a "Watch" button.
- **Early access days** — Inner Circle sees it immediately; everyone else after N days.

To also email the Dispatch, use **Download member emails (CSV)** and import it into your
email tool (Lemon Squeezy's built-in email marketing, Buttondown, etc.).

### Free email list

The hero's "Get Updates" form collects emails into Netlify → Forms → `updates`.
