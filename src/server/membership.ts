import { createServerFn } from '@tanstack/react-start'
import { desc, eq } from 'drizzle-orm'
import type { User } from '@netlify/identity'
import { db } from '../../db'
import { memberPosts, memberships } from '../../db/schema'
import { identityMiddleware, requireAuthMiddleware } from '../middleware/identity'
import { isTierId, statusGrantsAccess, tierName, tierRank, type TierId } from '../lib/tiers'

// ---------------------------------------------------------------------------
// Configuration (Netlify → Site configuration → Environment variables)
//
//   LEMONSQUEEZY_API_KEY                 API key from Lemon Squeezy → Settings → API
//   LEMONSQUEEZY_STORE_ID                numeric store ID
//   LEMONSQUEEZY_WEBHOOK_SECRET          signing secret of the webhook (see webhook route)
//   LEMONSQUEEZY_VARIANT_SUPPORTER       variant ID of each subscription tier
//   LEMONSQUEEZY_VARIANT_ACTIVIST
//   LEMONSQUEEZY_VARIANT_INNER_CIRCLE
//   ADMIN_EMAILS                         comma-separated emails allowed to post content
// ---------------------------------------------------------------------------

const LS_API = 'https://api.lemonsqueezy.com/v1'

const VARIANT_ENV: Record<TierId, string> = {
  supporter: 'LEMONSQUEEZY_VARIANT_SUPPORTER',
  activist: 'LEMONSQUEEZY_VARIANT_ACTIVIST',
  inner_circle: 'LEMONSQUEEZY_VARIANT_INNER_CIRCLE',
}

export function variantIdForTier(tier: TierId): string | undefined {
  return process.env[VARIANT_ENV[tier]] || undefined
}

export function tierForVariantId(variantId: string): TierId | null {
  for (const tier of Object.keys(VARIANT_ENV) as TierId[]) {
    if (variantIdForTier(tier) === variantId) return tier
  }
  return null
}

function siteUrl(): string {
  // Netlify sets URL to the site's primary domain at build and run time.
  return (process.env.URL || 'https://liberationordeath.net').replace(/\/$/, '')
}

async function lsFetch(path: string, init?: RequestInit): Promise<any> {
  const key = process.env.LEMONSQUEEZY_API_KEY
  if (!key) throw new Error('Memberships are not set up yet. Please check back soon.')
  const res = await fetch(`${LS_API}${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
      Authorization: `Bearer ${key}`,
    },
  })
  if (!res.ok) {
    console.error('lemonsqueezy: request failed', path, res.status, await res.text())
    throw new Error('Payment service error. Please try again in a moment.')
  }
  return res.json()
}

function isAdmin(user: User | null): boolean {
  if (!user) return false
  if (user.roles?.includes('admin') || user.role === 'admin') return true
  const admins = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)
  // Only a confirmed address counts — otherwise anyone could sign up as the admin email.
  return !!user.email && !!user.confirmedAt && admins.includes(user.email.toLowerCase())
}

async function loadMembership(userId: string) {
  const [row] = await db.select().from(memberships).where(eq(memberships.userId, userId)).limit(1)
  return row ?? null
}

export type MembershipInfo = {
  tier: TierId
  tierName: string
  status: string
  active: boolean
  renewsAt: string | null
  endsAt: string | null
}

function toInfo(row: Awaited<ReturnType<typeof loadMembership>>): MembershipInfo | null {
  if (!row || !isTierId(row.tier)) return null
  return {
    tier: row.tier,
    tierName: tierName(row.tier),
    status: row.status,
    active: statusGrantsAccess(row.status, row.endsAt),
    renewsAt: row.renewsAt?.toISOString() ?? null,
    endsAt: row.endsAt?.toISOString() ?? null,
  }
}

export const getMyMembership = createServerFn({ method: 'GET' })
  .middleware([identityMiddleware])
  .handler(async ({ context }) => {
    const user = context.user
    if (!user) return { signedIn: false, admin: false, membership: null }
    return {
      signedIn: true,
      admin: isAdmin(user),
      membership: toInfo(await loadMembership(user.id)),
    }
  })

export const createCheckout = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator((data: { tier: string }) => {
    if (!isTierId(data.tier)) throw new Error('Unknown membership tier.')
    return { tier: data.tier }
  })
  .handler(async ({ data, context }) => {
    const user = context.user
    const existing = toInfo(await loadMembership(user.id))
    if (existing?.active) {
      throw new Error('You already have an active membership — use "Manage membership" to change your plan.')
    }

    const storeId = process.env.LEMONSQUEEZY_STORE_ID
    const variantId = variantIdForTier(data.tier)
    if (!storeId || !variantId) throw new Error('Memberships are not set up yet. Please check back soon.')

    const res = await lsFetch('/checkouts', {
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            checkout_data: {
              email: user.email,
              name: user.name,
              // Echoed back on every subscription webhook so the payment can be
              // tied to this site account.
              custom: { user_id: user.id },
            },
            product_options: {
              redirect_url: `${siteUrl()}/members?welcome=1`,
            },
          },
          relationships: {
            store: { data: { type: 'stores', id: storeId } },
            variant: { data: { type: 'variants', id: variantId } },
          },
        },
      }),
    })
    return { url: res.data.attributes.url as string }
  })

export const getPortalUrl = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .handler(async ({ context }) => {
    const row = await loadMembership(context.user.id)
    if (!row) throw new Error('No membership found for this account.')
    // Portal links are pre-signed and expire, so fetch a fresh one each time.
    const res = await lsFetch(`/subscriptions/${row.lsSubscriptionId}`)
    return { url: res.data.attributes.urls.customer_portal as string }
  })

export type FeedPost = {
  id: number
  kind: string
  title: string
  body: string | null
  videoUrl: string | null
  minTier: TierId
  earlyUntil: string | null
  createdAt: string | null
  // Why the viewer can't read it, or null when they can.
  locked: null | 'join' | 'upgrade' | 'early'
}

export const getFeed = createServerFn({ method: 'GET' })
  .middleware([identityMiddleware])
  .handler(async ({ context }): Promise<FeedPost[]> => {
    const user = context.user
    const admin = isAdmin(user)
    const membership = user ? toInfo(await loadMembership(user.id)) : null
    const myRank = membership?.active ? tierRank(membership.tier) : 0
    const now = Date.now()

    const rows = await db.select().from(memberPosts).orderBy(desc(memberPosts.createdAt)).limit(100)
    return rows.map(p => {
      const minTier: TierId = isTierId(p.minTier) ? p.minTier : 'supporter'
      const early = !!p.earlyUntil && p.earlyUntil.getTime() > now
      let locked: FeedPost['locked'] = null
      if (!admin) {
        if (myRank === 0) locked = 'join'
        else if (myRank < tierRank(minTier)) locked = 'upgrade'
        else if (early && membership?.tier !== 'inner_circle') locked = 'early'
      }
      return {
        id: p.id,
        kind: p.kind,
        title: p.title,
        // Locked posts are teasers only — the content never leaves the server.
        body: locked ? null : p.body,
        videoUrl: locked ? null : p.videoUrl,
        minTier,
        earlyUntil: p.earlyUntil?.toISOString() ?? null,
        createdAt: p.createdAt?.toISOString() ?? null,
        locked,
      }
    })
  })

const POST_KINDS = new Set(['newsletter', 'post', 'video'])

export const createPost = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator(
    (data: { kind: string; title: string; body: string; videoUrl?: string; minTier: string; earlyDays: number }) => {
      const title = data.title?.trim()
      const body = data.body?.trim()
      const videoUrl = data.videoUrl?.trim() || null
      if (!POST_KINDS.has(data.kind)) throw new Error('Unknown post type.')
      if (!title || !body) throw new Error('Title and body are required.')
      if (!isTierId(data.minTier)) throw new Error('Unknown membership tier.')
      if (videoUrl && !/^https:\/\//i.test(videoUrl)) throw new Error('Video link must start with https://')
      const earlyDays = Math.max(0, Math.min(30, Math.floor(Number(data.earlyDays) || 0)))
      return { kind: data.kind, title, body, videoUrl, minTier: data.minTier, earlyDays }
    },
  )
  .handler(async ({ data, context }) => {
    if (!isAdmin(context.user)) throw new Error('Only admins can publish.')
    const earlyUntil = data.earlyDays > 0 ? new Date(Date.now() + data.earlyDays * 86_400_000) : null
    await db.insert(memberPosts).values({
      kind: data.kind,
      title: data.title,
      body: data.body,
      videoUrl: data.videoUrl,
      minTier: data.minTier,
      earlyUntil,
      authorName: context.user.name || 'LOD',
    })
    return { ok: true }
  })

export const deletePost = createServerFn({ method: 'POST' })
  .middleware([requireAuthMiddleware])
  .inputValidator((data: { id: number }) => ({ id: Number(data.id) }))
  .handler(async ({ data, context }) => {
    if (!isAdmin(context.user)) throw new Error('Only admins can delete posts.')
    await db.delete(memberPosts).where(eq(memberPosts.id, data.id))
    return { ok: true }
  })

// CSV of members with access, for sending the Dispatch from any email tool.
export const exportMembersCsv = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .handler(async ({ context }) => {
    if (!isAdmin(context.user)) throw new Error('Only admins can export members.')
    const rows = await db.select().from(memberships)
    // Quote every field, and defuse values a spreadsheet would run as a formula.
    const esc = (v: string | null) => {
      const s = (v ?? '').replace(/^[=+\-@\t\r]/, "'$&")
      return `"${s.replace(/"/g, '""')}"`
    }
    const lines = ['email,name,tier,status,renews_at']
    for (const r of rows) {
      if (!statusGrantsAccess(r.status, r.endsAt)) continue
      lines.push([esc(r.email), esc(r.name), esc(r.tier), esc(r.status), esc(r.renewsAt?.toISOString() ?? '')].join(','))
    }
    return { csv: lines.join('\n') }
  })
