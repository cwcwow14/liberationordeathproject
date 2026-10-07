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

## Paid memberships (Patreon)

Memberships are sold and delivered on Patreon: three tiers (Supporter $3, Activist $8,
Inner Circle $20), the bi-weekly Dispatch newsletter (Patreon emails each post to patrons),
exclusive posts/videos, and early access (Patreon's per-post early access setting).

The site only advertises the tiers and links to Patreon:
- Tier names, prices and perks shown on `/join` and the homepage: `src/lib/tiers.ts`
- The Patreon link used by every join button: `PATREON_URL` in the same file

Keep both in step with the tiers on Patreon.

### Free email list

The hero's "Get Updates" form collects emails into Netlify → Forms → `updates`.
