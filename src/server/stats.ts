import { createServerFn } from '@tanstack/react-start'
import { and, desc, eq, gte, isNotNull, sql } from 'drizzle-orm'
import { db } from '../../db'
import { analyticsEvents, mapPins } from '../../db/schema'
import { requireAuthMiddleware } from '../middleware/identity'
import { isAdmin } from './admin'

export type Row = { label: string; count: number }

export type Stats = {
  days: number
  pageviews: number
  mobileShare: number
  patreonClicks: number
  emailSignups: number
  mapPinsTotal: number
  daily: { day: string; count: number }[]
  topPages: Row[]
  referrers: Row[]
  patreonBy: Row[]
  shares: Row[]
  actions: Row[]
  tiktokClicks: number
  contactSubmits: number
}

const count = sql<number>`count(*)::int`

export const getStats = createServerFn({ method: 'GET' })
  .middleware([requireAuthMiddleware])
  .inputValidator((data: { days?: number }) => ({ days: [7, 30, 90].includes(Number(data?.days)) ? Number(data.days) : 30 }))
  .handler(async ({ data, context }): Promise<Stats> => {
    if (!isAdmin(context.user)) throw new Error('Only admins can view stats.')
    const since = new Date(Date.now() - data.days * 86_400_000)
    const inRange = gte(analyticsEvents.createdAt, since)
    const ofKind = (kind: string) => and(inRange, eq(analyticsEvents.kind, kind))

    const totals = await db
      .select({ kind: analyticsEvents.kind, n: count })
      .from(analyticsEvents)
      .where(inRange)
      .groupBy(analyticsEvents.kind)
    const total = (k: string) => Number(totals.find(t => t.kind === k)?.n ?? 0)

    const [mobile] = await db.select({ n: count }).from(analyticsEvents)
      .where(and(ofKind('pageview'), eq(analyticsEvents.mobile, true)))

    const day = sql<string>`to_char(date_trunc('day', ${analyticsEvents.createdAt}), 'YYYY-MM-DD')`
    const dailyRows = await db.select({ day, n: count }).from(analyticsEvents)
      .where(ofKind('pageview')).groupBy(day).orderBy(day)

    const breakdown = async (col: typeof analyticsEvents.path | typeof analyticsEvents.detail | typeof analyticsEvents.referrer, where: ReturnType<typeof and>, limit = 10): Promise<Row[]> => {
      const rows = await db.select({ label: col, n: count }).from(analyticsEvents)
        .where(and(where, isNotNull(col))).groupBy(col).orderBy(desc(count)).limit(limit)
      return rows.map(r => ({ label: r.label ?? '', count: Number(r.n) }))
    }

    const [pins] = await db.select({ n: count }).from(mapPins)

    // Fill gaps so the chart shows zero-traffic days instead of skipping them.
    const byDay = new Map(dailyRows.map(r => [r.day, Number(r.n)]))
    const daily = Array.from({ length: data.days }, (_, i) => {
      const d = new Date(Date.now() - (data.days - 1 - i) * 86_400_000).toISOString().slice(0, 10)
      return { day: d, count: byDay.get(d) ?? 0 }
    })

    const pageviews = total('pageview')
    return {
      days: data.days,
      pageviews,
      mobileShare: pageviews ? Math.round((Number(mobile?.n ?? 0) / pageviews) * 100) : 0,
      patreonClicks: total('patreon_click'),
      emailSignups: total('email_signup'),
      tiktokClicks: total('tiktok_click'),
      contactSubmits: total('contact_submit'),
      mapPinsTotal: Number(pins?.n ?? 0),
      daily,
      topPages: await breakdown(analyticsEvents.path, ofKind('pageview')),
      referrers: await breakdown(analyticsEvents.referrer, ofKind('pageview')),
      patreonBy: await breakdown(analyticsEvents.detail, ofKind('patreon_click')),
      shares: await breakdown(analyticsEvents.detail, ofKind('share')),
      actions: await breakdown(analyticsEvents.detail, ofKind('action_click')),
    }
  })
