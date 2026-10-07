import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'
import { and, eq, gte, sql } from 'drizzle-orm'
import { createHash } from 'node:crypto'
import { db } from '../../db'
import { analyticsEvents, mapPins } from '../../db/schema'
import { PLACE_BY_KEY } from '../lib/places'

const PINS_PER_IP_PER_DAY = 3

export type MapCounts = Record<string, number>

async function loadCounts(): Promise<MapCounts> {
  const rows = await db
    .select({ key: mapPins.placeKey, count: sql<number>`count(*)::int` })
    .from(mapPins)
    .groupBy(mapPins.placeKey)
  return Object.fromEntries(rows.map(r => [r.key, Number(r.count)]))
}

export const getMapCounts = createServerFn({ method: 'GET' }).handler(async (): Promise<MapCounts> => {
  try {
    return await loadCounts()
  } catch (e) {
    // Never take a page down over the map — render it empty instead.
    console.error('map: could not load counts', e)
    return {}
  }
})

// The salt rotates daily, so stored hashes can't be linked across days or
// reversed into IPs later; within a day they still catch repeat submissions.
function ipHash(): string {
  const ip =
    getRequestHeader('x-nf-client-connection-ip') ||
    getRequestHeader('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  const day = new Date().toISOString().slice(0, 10)
  const salt = process.env.HASH_SALT || 'lod-map'
  return createHash('sha256').update(`${salt}:${day}:${ip}`).digest('hex')
}

export const addMapPin = createServerFn({ method: 'POST' })
  .inputValidator((data: { placeKey: string; website?: string }) => ({
    placeKey: String(data.placeKey ?? ''),
    website: String(data.website ?? ''),
  }))
  .handler(async ({ data }): Promise<{ ok: true; counts: MapCounts } | { ok: false; error: string }> => {
    // Honeypot: real visitors never see or fill the "website" field.
    if (data.website) return { ok: false, error: 'Something went wrong.' }
    if (!PLACE_BY_KEY.has(data.placeKey)) return { ok: false, error: 'Pick a city from the list.' }

    const hash = ipHash()
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const [recent] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(mapPins)
      .where(and(eq(mapPins.ipHash, hash), gte(mapPins.createdAt, since)))
    if (Number(recent?.n ?? 0) >= PINS_PER_IP_PER_DAY) {
      return { ok: false, error: "You've already added yourself today — thank you!" }
    }

    await db.insert(mapPins).values({ placeKey: data.placeKey, ipHash: hash })
    await db.insert(analyticsEvents).values({ kind: 'map_pin', path: '/reach', detail: data.placeKey })
    return { ok: true, counts: await loadCounts() }
  })
