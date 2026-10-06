# AGENTS.md — LOD Project Architecture

## Project Overview

LOD (Liberation or Death) is the website for the @liberationord3ath TikTok movement. It has a public landing page, photo gallery and reach map, a free email list, and paid memberships (via Lemon Squeezy) that unlock a members-only feed. Built with TanStack Start on Netlify, using Netlify Identity for authentication and Netlify Database (Postgres) for persistence.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start |
| Frontend | React 19, TanStack Router v1 |
| Build | Vite 7 |
| Styling | Custom CSS (Oswald + Inter fonts, dark green theme) |
| Database | Netlify Database via Drizzle ORM (`drizzle-orm@beta`) |
| Auth | Netlify Identity (`@netlify/identity`) |
| Payments | Lemon Squeezy (REST API via `fetch`, no SDK) |
| Language | TypeScript 5.x (strict mode) |
| Deployment | Netlify |

## Directory Structure

```
src/
  routes/
    __root.tsx          # Root layout: IdentityProvider + CallbackHandler, site-wide meta
    index.tsx           # Landing page (hero, email signup, manifesto, membership teaser, contact)
    join.tsx            # Pricing page — three tiers, starts Lemon Squeezy checkout
    members.tsx         # Members feed (Dispatch newsletter, posts, videos) + admin composer
    login.tsx           # Login/signup (Netlify Identity); ?redirect=/path&mode=signup
    photos.tsx          # Photo gallery
    reach.tsx           # Reach map
    api/
      lemonsqueezy-webhook.ts  # Signed webhook — the only writer of `memberships`
  server/
    membership.ts       # Server functions: membership, checkout, portal, feed, admin
  lib/
    tiers.ts            # Tier definitions (names, display prices, perks) + access rules
    auth.ts             # getServerUser server function
    identity-context.tsx # React context for client-side auth state
  middleware/
    identity.ts         # identityMiddleware / requireAuthMiddleware for server functions
  components/
    SiteNav.tsx         # Shared nav (mobile menu) + footer
    CallbackHandler.tsx # Handles OAuth/email confirmation URL hashes
  styles.css            # All LOD custom CSS

db/
  schema.ts             # Drizzle schema
  index.ts              # Drizzle client (netlify-db adapter)
netlify/
  database/migrations/  # SQL migrations (applied by Netlify at deploy time)
  edge-functions/markdown.ts  # Markdown-for-agents (paths registered in netlify.toml)
```

## Memberships

- Tiers: `supporter` ($3), `activist` ($8), `inner_circle` ($20) — defined in `src/lib/tiers.ts`.
  Displayed prices are copy only; the charged amount is set on the Lemon Squeezy variant.
- Checkout: `createCheckout` creates a Lemon Squeezy checkout with `custom.user_id` = Netlify Identity user ID.
- Access is granted **only** by the webhook (`/api/lemonsqueezy-webhook`, HMAC-SHA256 `X-Signature`), which upserts `memberships` keyed by `user_id`.
- Access rule (`statusGrantsAccess`): `active`, `on_trial`, `past_due`, or `cancelled` until `ends_at`.
- Feed: `member_posts.min_tier` gates who can read; before `early_until` only Inner Circle can. Locked posts are sent to the client as teasers with `body`/`videoUrl` stripped.
- Admins: Identity role `admin` or email in `ADMIN_EMAILS`. They can publish/delete posts and export member emails as CSV.

### Environment variables

`LEMONSQUEEZY_API_KEY`, `LEMONSQUEEZY_STORE_ID`, `LEMONSQUEEZY_WEBHOOK_SECRET`,
`LEMONSQUEEZY_VARIANT_SUPPORTER`, `LEMONSQUEEZY_VARIANT_ACTIVIST`, `LEMONSQUEEZY_VARIANT_INNER_CIRCLE`, `ADMIN_EMAILS`.

## Auth Architecture

- Uses `@netlify/identity` — NOT `netlify-identity-widget` or `gotrue-js` (both deprecated)
- Auth only works on deployed Netlify environments — the `nf_jwt` cookie is set by the CDN
- `IdentityProvider` in `__root.tsx` provides `{ user, ready, logout }` via `useIdentity()`
- Server functions use `requireAuthMiddleware` to protect mutations
- `CallbackHandler` processes URL hashes for email confirmation, password recovery, OAuth

## Database Architecture

- Drizzle ORM with `drizzle-orm@beta` and `drizzle-kit@beta` (required for Netlify DB adapter)
- Tables: `memberships`, `member_posts` (plus legacy `threads`, `replies`, `thread_reactions`, `reply_reactions` from the removed forum)
- Migrations in `netlify/database/migrations/` — applied automatically by Netlify at deploy time
- **Never** run `drizzle-kit migrate` or `drizzle-kit push` — only `drizzle-kit generate`
- To change schema: edit `db/schema.ts` → run `npx drizzle-kit generate`

## Forms

Netlify Forms, posted to `/__forms.html` (static skeletons in `public/__forms.html`):
- `contact` — contact form on the landing page
- `updates` — free email list signup in the hero

## Design System

All custom styles in `src/styles.css`. Key tokens:
- Background: `#0a0a0a` (page), `#0d1a0d` (panels)
- Border/accent dark: `#1e3a1e`
- Primary green: `#4caf50` (hover: `#66bb6a`)
- Text: `#e8e8e8` (primary), `#ccc` (secondary), `#888` (muted), `#555` (faint)
- Heading font: Oswald (weights 400, 700)
- Body font: Inter (weights 300, 400, 500)
- The Google Fonts `@import` must stay the first line of `styles.css` — browsers ignore `@import` after other rules

## Conventions

- No `.js` extensions in imports (bundler mode TypeScript resolution)
- TypeScript strict mode with `noUnusedLocals` and `noUnusedParameters`
- State is React `useState` — no global state library
- Use `SiteNav` / `SiteFooter` on every page instead of per-page nav markup
