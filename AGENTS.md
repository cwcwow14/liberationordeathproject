# AGENTS.md — LOD Project Architecture

## Project Overview

LOD (Liberation or Death) is an environmental movement community platform. It features a public landing page and a members-only forum. Built with TanStack Start on Netlify, using Netlify Identity for authentication and Netlify Database (Postgres) for persistence.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | TanStack Start |
| Frontend | React 19, TanStack Router v1 |
| Build | Vite 7 |
| Styling | Custom CSS (Oswald + Inter fonts, dark green theme) |
| Database | Netlify Database via Drizzle ORM (`drizzle-orm@beta`) |
| Auth | Netlify Identity (`@netlify/identity`) |
| Language | TypeScript 5.x (strict mode) |
| Deployment | Netlify |

## Directory Structure

```
src/
  routes/
    __root.tsx          # Root layout: IdentityProvider + CallbackHandler
    index.tsx           # Public landing page (manifesto, pillars, TikTok)
    login.tsx           # Login/signup (Netlify Identity)
    forum.tsx           # Members-only forum (auth-gated, full forum UI)
  server/
    forum.ts            # Server functions: threads, replies, reactions CRUD
  lib/
    auth.ts             # getServerUser server function
    identity-context.tsx # React context for client-side auth state
  middleware/
    identity.ts         # requireAuthMiddleware for server functions
  components/
    CallbackHandler.tsx  # Handles OAuth/email confirmation URL hashes
  styles.css            # All LOD custom CSS

db/
  schema.ts             # Drizzle schema: threads, replies, thread_reactions, reply_reactions
  index.ts              # Drizzle client (netlify-db adapter)
drizzle.config.ts       # Drizzle Kit config (output → netlify/database/migrations/)

netlify/
  database/
    migrations/         # SQL migrations (applied by Netlify at deploy time)
```

## Auth Architecture

- Uses `@netlify/identity` — NOT `netlify-identity-widget` or `gotrue-js` (both deprecated)
- Auth only works on deployed Netlify environments — the `nf_jwt` cookie is set by the CDN
- `IdentityProvider` in `__root.tsx` provides `{ user, ready, logout }` via `useIdentity()`
- Server functions use `requireAuthMiddleware` to protect mutations
- Forum page uses `useEffect` to redirect to `/login` when `!ready || !user`
- `CallbackHandler` processes URL hashes for email confirmation, password recovery, OAuth

## Database Architecture

- Drizzle ORM with `drizzle-orm@beta` and `drizzle-kit@beta` (required for Netlify DB adapter)
- Schema: `threads`, `replies`, `thread_reactions`, `reply_reactions` tables
- `thread_reactions` and `reply_reactions` have unique constraints (user+emoji+target)
- Migrations in `netlify/database/migrations/` — applied automatically by Netlify at deploy time
- **Never** run `drizzle-kit migrate` or `drizzle-kit push` — only `drizzle-kit generate`
- To change schema: edit `db/schema.ts` → run `npx drizzle-kit generate`

## Server Functions

All data access goes through `createServerFn` in `src/server/forum.ts`:
- `getThreads({ category })` — list threads with reply/reaction counts
- `getThread({ id })` — thread detail with replies, my reactions, reaction counts
- `createThread({ title, body, category })` — create thread (requires auth)
- `postReply({ threadId, body })` — post reply (requires auth)
- `toggleThreadReaction({ threadId, emoji })` — toggle reaction (requires auth)
- `toggleReplyReaction({ replyId, emoji })` — toggle reply reaction (requires auth)
- `seedForumData()` — idempotent seed with 6 starter threads

## Design System

All custom styles in `src/styles.css`. Key tokens:
- Background: `#0a0a0a` (page), `#0d1a0d` (panels)
- Border/accent dark: `#1e3a1e`
- Primary green: `#4caf50` (hover: `#66bb6a`)
- Text: `#e8e8e8` (primary), `#ccc` (secondary), `#888` (muted), `#555` (faint)
- Heading font: Oswald (weights 400, 700)
- Body font: Inter (weights 300, 400, 500)

## Conventions

- No `.js` extensions in imports (bundler mode TypeScript resolution)
- TypeScript strict mode with `noUnusedLocals` and `noUnusedParameters`
- Forum state is React `useState` — no global state library
- `fmt()` helper formats dates; `catLabel()` maps category IDs to display strings
- Seed data runs once on forum mount (idempotent check before insert)
