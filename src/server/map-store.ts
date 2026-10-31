// Server-only storage for the reach map. Imported dynamically from the server
// functions in map.ts so none of this (Netlify Blobs, the database driver) ends
// up in the browser bundle.
import { getStore } from '@netlify/blobs'
import { getRequestHeader } from '@tanstack/react-start/server'
import { sql } from 'drizzle-orm'
import { createHash, randomUUID } from 'node:crypto'
import { db } from '../../db'
import { mapPins } from '../../db/schema'
import { PLACE_BY_KEY } from '../lib/places'

// Reach-map pins live in Netlify Blobs (store "lod-map"). Blobs need no
// migrations, so the map no longer depends on the database table that never got
// created in production. Layout:
//   pin/<base64url(placeKey)>/<time>-<uuid>   one empty blob per supporter
//   rate/<YYYY-MM-DD>/<ipHash>                submissions from one IP that day
// Counting only lists keys — it never has to read the blobs themselves.

const PINS_PER_IP_PER_DAY = 3

export type MapCounts = Record<string, number>

const store = () => getStore({ name: 'lod-map', consistency: 'strong' })

const encodeKey = (placeKey: string) => Buffer.from(placeKey, 'utf8').toString('base64url')
const decodeKey = (encoded: string) => Buffer.from(encoded, 'base64url').toString('utf8')

export function logError(where: string, e: unknown) {
  // Drizzle wraps the real Postgres error in `cause`; Blobs errors are plain.
  const cause = (e as { cause?: { code?: string; message?: string } })?.cause
  console.error(`map: ${where} failed`, cause?.code ?? '', cause?.message ?? (e as Error)?.message ?? e)
}

async function blobCounts(): Promise<MapCounts> {
  const { blobs } = await store().list({ prefix: 'pin/' })
  const counts: MapCounts = {}
  for (const { key } of blobs) {
    const placeKey = decodeKey(key.split('/')[1] ?? '')
    if (PLACE_BY_KEY.has(placeKey)) counts[placeKey] = (counts[placeKey] ?? 0) + 1
  }
  return counts
}

// Pins saved to the old database table (if it ever starts working) are added in,
// so no real supporter is ever dropped from the map.
async function dbCounts(): Promise<MapCounts> {
  try {
    const rows = await db
      .select({ key: mapPins.placeKey, count: sql<number>`count(*)::int` })
      .from(mapPins)
      .groupBy(mapPins.placeKey)
    return Object.fromEntries(rows.map(r => [r.key, Number(r.count)]))
  } catch {
    return {}
  }
}

export async function loadCounts(): Promise<MapCounts> {
  const [fromBlobs, fromDb] = await Promise.all([blobCounts(), dbCounts()])
  const counts = { ...fromDb }
  for (const [k, n] of Object.entries(fromBlobs)) counts[k] = (counts[k] ?? 0) + n
  return counts
}

/** Total supporters on the map (for the admin stats page). */
export async function totalPins(): Promise<number> {
  return Object.values(await loadCounts()).reduce((a, b) => a + b, 0)
}

// The salt rotates daily, so stored hashes can't be linked across days or
// reversed into IPs later; within a day they still catch repeat submissions.
function ipHash(day: string): string {
  const ip =
    getRequestHeader('x-nf-client-connection-ip') ||
    getRequestHeader('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  const salt = process.env.HASH_SALT || 'lod-map'
  return createHash('sha256').update(`${salt}:${day}:${ip}`).digest('hex')
}

export type AddResult = { ok: true; counts: MapCounts } | { ok: false; error: string }

export async function addPin(placeKey: string): Promise<AddResult> {
  const day = new Date().toISOString().slice(0, 10)
  const rateKey = `rate/${day}/${ipHash(day)}`
  try {
    const s = store()
    const used = Number((await s.get(rateKey)) ?? 0)
    if (used >= PINS_PER_IP_PER_DAY) {
      return { ok: false, error: "You've already added yourself today — thank you!" }
    }
    await s.set(`pin/${encodeKey(placeKey)}/${Date.now()}-${randomUUID()}`, '')
    await s.set(rateKey, String(used + 1))
  } catch (e) {
    logError('adding a pin', e)
    return { ok: false, error: "The map can't take new entries right now — please try again later." }
  }

  let counts: MapCounts = {}
  try { counts = await loadCounts() } catch (e) { logError('reloading counts', e) }
  return { ok: true, counts }
}
