# AGENTS.md — LOD Project Architecture

## Project Overview

LOD (Liberation or Death) is the website for the @liberationord3ath TikTok movement. It has a public landing page, photo gallery and reach map, a free email list, and a membership page that sends people to the LOD Patreon. Built with TanStack Start on Netlify, using Netlify Identity for authentication and Netlify Database (Postgres) for persistence.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start |
| Frontend | React 19, TanStack Router v1 |
| Build | Vite 7 |
| Styling | Custom CSS (Oswald + Inter fonts, dark green theme) |
| Database | Netlify Database via Drizzle ORM (`drizzle-orm@beta`) |
| Auth | Netlify Identity (`@netlify/identity`) |
| Memberships | Patreon (linked out — no payment code on the site) |
| Language | TypeScript 5.x (strict mode) |
| Deployment | Netlify |

## Directory Structure

```
src/
  routes/
    __root.tsx          # Root layout: IdentityProvider + CallbackHandler, site-wide meta
    index.tsx           # Landing page (hero, email signup, manifesto, membership teaser, contact)
    join.tsx            # Pricing page — three tiers, each links to Patreon
    members.tsx         # Pointer page: member content lives on Patreon
    login.tsx           # Login/signup (Netlify Identity); ?redirect=/path&mode=signup
    photos.tsx          # Photo gallery
    reach.tsx           # Reach map — real self-reported supporters + "put yourself on the map" form
    action.tsx          # Take Action page (reps, cruelty-free, sanctuaries, climate, protest rights, share)
    privacy.tsx         # Privacy policy
    stats.tsx           # Admin-only visitor stats (ADMIN_EMAILS / Identity "admin" role)
    api/
      track.ts          # Cookie-free page view / event endpoint (sendBeacon target)
  server/
    map.ts              # getMapCounts / addMapPin (daily-salted IP hash rate limit)
    stats.ts            # getStats (admin only)
    admin.ts            # isAdmin()
  lib/
    tiers.ts            # Tier definitions (names, display prices, perks) + PATREON_URL
    places.ts           # Pickable cities for the reach map + buildMap() (dots, totals, regions)
    tiktok.ts           # TikTok handle + FEATURED_VIDEOS (empty → profile embed)
    track.ts            # trackEvent / trackPageview client helpers
    auth.ts             # getServerUser server function
    identity-context.tsx # React context for client-side auth state
  middleware/
    identity.ts         # identityMiddleware / requireAuthMiddleware for server functions
  components/
    SiteNav.tsx         # Shared nav (mobile menu) + footer
    LodMark.tsx         # Vector LOD logo (traced from the original)
    ShareButtons.tsx    # Native share sheet + X / Facebook / WhatsApp / copy link
    TikTokFeed.tsx      # TikTok profile or featured-video embeds
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

- Sold and delivered entirely on Patreon (newsletter, exclusive posts/videos, early access).
- The site shows the tiers from `src/lib/tiers.ts` and links every join button to `PATREON_URL`.
- Lemon Squeezy was tried and removed (store not approved); its tables are dropped by migration.

## Reach map & stats

- The reach map shows only real submissions (`map_pins`). Never add invented member counts.
- Visitor stats are first-party and cookie-free: no IPs, user agents or personal data stored.
- Env vars: `ADMIN_EMAILS` (who can open /stats), optional `HASH_SALT` (map rate-limit hash salt).

## Images

- Gallery photos are served as WebP (originals kept alongside). Convert new photos to WebP
  (max 1600px wide) before adding them to `photos.tsx`.
- Logo: `LodMark` component; `favicon.svg`, `favicon.ico`, `apple-touch-icon.png`, `og-image.png` in `public/`.

## Auth Architecture

- Uses `@netlify/identity` — NOT `netlify-identity-widget` or `gotrue-js` (both deprecated)
- Auth only works on deployed Netlify environments — the `nf_jwt` cookie is set by the CDN
- `IdentityProvider` in `__root.tsx` provides `{ user, ready, logout }` via `useIdentity()`
- Server functions use `requireAuthMiddleware` to protect mutations
- `CallbackHandler` processes URL hashes for email confirmation, password recovery, OAuth

## Database Architecture

- Drizzle ORM with `drizzle-orm@beta` and `drizzle-kit@beta` (required for Netlify DB adapter)
- Tables: `map_pins` (reach map), `analytics_events` (visitor stats), plus legacy `threads`, `replies`, `thread_reactions`, `reply_reactions` from the removed forum
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
