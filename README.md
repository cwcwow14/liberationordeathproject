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
