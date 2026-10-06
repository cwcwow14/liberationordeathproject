import { createFileRoute } from '@tanstack/react-router'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { db } from '../../../db'
import { memberships } from '../../../db/schema'
import { tierForVariantId } from '../../server/membership'
import { isTierId, statusGrantsAccess } from '../../lib/tiers'

// Lemon Squeezy → Settings → Webhooks → add:
//   URL:     https://liberationordeath.net/api/lemonsqueezy-webhook
//   Secret:  any random string; also set it as LEMONSQUEEZY_WEBHOOK_SECRET in Netlify
//   Events:  subscription_created, subscription_updated, subscription_cancelled,
//            subscription_resumed, subscription_expired, subscription_paused,
//            subscription_unpaused
//
// This is the only place membership access is granted or removed.

function validSignature(raw: string, signature: string | null, secret: string): boolean {
  if (!signature) return false
  const expected = createHmac('sha256', secret).update(raw).digest('hex')
  const a = Buffer.from(expected, 'utf8')
  const b = Buffer.from(signature, 'utf8')
  return a.length === b.length && timingSafeEqual(a, b)
}

const date = (v: unknown) => (typeof v === 'string' && v ? new Date(v) : null)

export const Route = createFileRoute('/api/lemonsqueezy-webhook')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET
        if (!secret) {
          console.error('lemonsqueezy webhook: LEMONSQUEEZY_WEBHOOK_SECRET is not set')
          return new Response('Not configured', { status: 500 })
        }

        const raw = await request.text()
        if (!validSignature(raw, request.headers.get('x-signature'), secret)) {
          return new Response('Invalid signature', { status: 401 })
        }

        const payload = JSON.parse(raw)
        const event: string = payload?.meta?.event_name ?? ''
        const data = payload?.data
        if (!event.startsWith('subscription_') || data?.type !== 'subscriptions') {
          return new Response('Ignored', { status: 200 })
        }

        const attrs = data.attributes ?? {}
        const subscriptionId = String(data.id)
        const status: string = attrs.status
        const endsAt = date(attrs.ends_at)
        const lsUpdatedAt = date(attrs.updated_at)

        // The site account is passed as custom data at checkout. Fall back to the
        // stored row for events that arrive without it.
        let userId: string | undefined = payload?.meta?.custom_data?.user_id
        const [bySub] = await db
          .select()
          .from(memberships)
          .where(eq(memberships.lsSubscriptionId, subscriptionId))
          .limit(1)
        if (!userId) userId = bySub?.userId
        if (!userId) {
          console.error('lemonsqueezy webhook: no user for subscription', subscriptionId, event)
          return new Response('No matching user', { status: 200 })
        }

        const [existing] = await db.select().from(memberships).where(eq(memberships.userId, userId)).limit(1)

        if (existing) {
          // Webhooks can arrive out of order — never let an older update win.
          if (
            existing.lsSubscriptionId === subscriptionId &&
            existing.lsUpdatedAt && lsUpdatedAt && lsUpdatedAt < existing.lsUpdatedAt
          ) {
            return new Response('Stale', { status: 200 })
          }
          // An old subscription ending must not cut off a newer, live one.
          if (
            existing.lsSubscriptionId !== subscriptionId &&
            statusGrantsAccess(existing.status, existing.endsAt) &&
            !statusGrantsAccess(status, endsAt)
          ) {
            return new Response('Superseded', { status: 200 })
          }
        }

        const variantId = String(attrs.variant_id ?? '')
        const tier =
          tierForVariantId(variantId) ?? (existing && isTierId(existing.tier) ? existing.tier : null)
        if (!tier) {
          console.error('lemonsqueezy webhook: variant matches no tier — check LEMONSQUEEZY_VARIANT_* env vars', variantId)
          // 500 so Lemon Squeezy retries once the env vars are fixed.
          return new Response('Unknown variant', { status: 500 })
        }

        const values = {
          userId,
          email: attrs.user_email ?? null,
          name: attrs.user_name ?? null,
          tier,
          status,
          lsSubscriptionId: subscriptionId,
          lsCustomerId: attrs.customer_id != null ? String(attrs.customer_id) : null,
          variantId,
          renewsAt: date(attrs.renews_at),
          endsAt,
          lsUpdatedAt,
        }
        await db
          .insert(memberships)
          .values(values)
          .onConflictDoUpdate({ target: memberships.userId, set: values })

        return new Response('OK', { status: 200 })
      },
    },
  },
})
