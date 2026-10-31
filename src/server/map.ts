import { createServerFn } from '@tanstack/react-start'
import { PLACE_BY_KEY } from '../lib/places'

// Reach-map server functions. Storage lives in map-store.ts (Netlify Blobs) and is
// imported inside each handler so it stays out of the browser bundle.

export type MapCounts = Record<string, number>

export const getMapCounts = createServerFn({ method: 'GET' }).handler(async (): Promise<MapCounts> => {
  const { loadCounts, logError } = await import('./map-store')
  try {
    return await loadCounts()
  } catch (e) {
    // Never take a page down over the map — render it empty instead.
    logError('loading counts', e)
    return {}
  }
})

export const addMapPin = createServerFn({ method: 'POST' })
  .inputValidator((data: { placeKey: string; website?: string }) => ({
    placeKey: String(data.placeKey ?? ''),
    website: String(data.website ?? ''),
  }))
  .handler(async ({ data }): Promise<{ ok: true; counts: MapCounts } | { ok: false; error: string }> => {
    // Honeypot: real visitors never see or fill the "website" field.
    if (data.website) return { ok: false, error: 'Something went wrong.' }
    if (!PLACE_BY_KEY.has(data.placeKey)) return { ok: false, error: 'Pick a city from the list.' }
    const { addPin } = await import('./map-store')
    return addPin(data.placeKey)
  })
