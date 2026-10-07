import { createFileRoute } from '@tanstack/react-router'
import { db } from '../../../db'
import { analyticsEvents } from '../../../db/schema'

// Receives page views and events from src/lib/track.ts (sent with sendBeacon so
// clicks that leave the site — e.g. to Patreon — still get counted).
// Cookie-free: stores the path, an optional detail, the referring site's host and
// a mobile flag. Never IPs, user agents or anything that identifies a person.

const KINDS = new Set(['pageview', 'patreon_click', 'tiktok_click', 'share', 'email_signup', 'contact_submit', 'action_click'])
const BOT_UA = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse|curl|wget/i

const clip = (v: unknown, n: number) => (typeof v === 'string' && v ? v.slice(0, n) : null)

export const Route = createFileRoute('/api/track')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const ua = request.headers.get('user-agent') || ''
        if (!ua || BOT_UA.test(ua)) return new Response(null, { status: 204 })
        try {
          const body = JSON.parse(await request.text())
          const kind = String(body?.kind ?? '')
          const path = clip(body?.path, 200)
          if (!KINDS.has(kind) || !path || !path.startsWith('/')) return new Response(null, { status: 204 })
          await db.insert(analyticsEvents).values({
            kind,
            path,
            detail: clip(body?.detail, 200),
            referrer: clip(body?.referrer, 100),
            mobile: /Mobi|Android|iPhone|iPad/i.test(ua),
          })
        } catch (e) {
          console.error('track: could not record event', e)
        }
        // Always 204 — tracking must never surface errors to visitors.
        return new Response(null, { status: 204 })
      },
    },
  },
})
