import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useMemo, useState } from 'react'
import { MAP_W, VIEW_BOX, VIEW_H, VIEW_Y, WORLD_LAND_PATH, project } from '../lib/world-map'
import { PLACES, REGIONS, buildMap, placeKey, type PinnedPlace, type Region } from '../lib/places'
import { SiteFooter, SiteNav } from '../components/SiteNav'
import { ShareButtons } from '../components/ShareButtons'
import { addMapPin, getMapCounts, type MapCounts } from '../server/map'

export const Route = createFileRoute('/reach')({
  loader: () => getMapCounts(),
  head: () => ({
    meta: [
      { title: 'How Far We Reach — LOD' },
      { name: 'description', content: 'Supporters of LOD — Liberation or Death around the world. Put yourself on the map.' },
    ],
    links: [{ rel: 'canonical', href: 'https://liberationordeath.net/reach' }],
  }),
  component: ReachPage,
})

// Meridians and parallels every 30° — drawn under the land for depth.
const GRATICULE_LON = [-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150]
const GRATICULE_LAT = [-60, -30, 0, 30, 60]

const PINNED_STORAGE_KEY = 'lod-map-pinned'

type MapData = ReturnType<typeof buildMap>

function WorldMap({
  map,
  activeRegion,
  hovered,
  onHover,
}: {
  map: MapData
  activeRegion: Region | null
  hovered: PinnedPlace | null
  onHover: (place: PinnedPlace | null) => void
}) {
  return (
    <svg viewBox={VIEW_BOX} className="reach-map-svg" role="img" aria-label={`World map showing ${map.total} LOD supporters across ${map.countries} countries`}>
      <defs>
        <radialGradient id="reach-ocean" cx="50%" cy="45%" r="70%">
          <stop offset="0%" stopColor="#0d1f0d" />
          <stop offset="100%" stopColor="#070c07" />
        </radialGradient>
        <linearGradient id="reach-land" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1c4a22" />
          <stop offset="100%" stopColor="#123415" />
        </linearGradient>
        <filter id="reach-glow">
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect x="0" y={VIEW_Y} width={MAP_W} height={VIEW_H} fill="url(#reach-ocean)" />

      <g stroke="#4caf50" strokeOpacity="0.07" strokeWidth="0.6">
        {GRATICULE_LON.map(lon => {
          const [x] = project(lon, 0)
          return <line key={`lon-${lon}`} x1={x} y1={VIEW_Y} x2={x} y2={VIEW_Y + VIEW_H} />
        })}
        {GRATICULE_LAT.map(lat => {
          const [, y] = project(0, lat)
          return <line key={`lat-${lat}`} x1={0} y1={y} x2={MAP_W} y2={y} />
        })}
      </g>

      <path d={WORLD_LAND_PATH} fill="url(#reach-land)" stroke="#4caf50" strokeOpacity="0.45" strokeWidth="0.5" strokeLinejoin="round" />

      {/* One red dot per supporter, jittered around their city. */}
      <g filter="url(#reach-glow)">
        {map.dots.map((dot, i) => {
          const dim = activeRegion !== null && dot.place.region !== activeRegion
          const lit = hovered !== null && dot.place.key === hovered.key
          return (
            <circle
              key={i}
              className="reach-dot"
              cx={dot.x}
              cy={dot.y}
              r={lit ? 2.3 : 1.5}
              fill={lit ? '#ff7a6e' : '#ff2e2e'}
              opacity={dim ? 0.12 : 1}
              style={{ animationDelay: `${dot.delay}s` }}
            />
          )
        })}
      </g>

      {/* Invisible hit targets — one per city, sized to cover its cluster. */}
      <g>
        {map.pinned.map(place => {
          const [cx, cy] = project(place.lon, place.lat)
          const r = Math.max(6, 3.5 + Math.sqrt(place.count) * 2.4)
          return (
            <circle
              key={place.key}
              cx={cx}
              cy={cy}
              r={r}
              fill="transparent"
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => onHover(place)}
              onMouseLeave={() => onHover(null)}
              onClick={() => onHover(place)}
            />
          )
        })}
      </g>
    </svg>
  )
}

function AddYourself({ onAdded }: { onAdded: (counts: MapCounts) => void }) {
  const [placeKeyValue, setPlaceKeyValue] = useState('')
  const [website, setWebsite] = useState('')
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')
  const [pinnedCity, setPinnedCity] = useState<string | null>(null)

  useEffect(() => {
    try {
      setPinnedCity(localStorage.getItem(PINNED_STORAGE_KEY))
    } catch {
      // storage unavailable (private mode) — the form still works
    }
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!placeKeyValue) return
    setStatus('submitting')
    setError('')
    try {
      const res = await addMapPin({ data: { placeKey: placeKeyValue, website } })
      if (!res.ok) {
        setError(res.error)
        setStatus('error')
        return
      }
      const city = placeKeyValue.split('|')[0]
      try { localStorage.setItem(PINNED_STORAGE_KEY, city) } catch { /* ignore */ }
      setPinnedCity(city)
      setStatus('done')
      onAdded(res.counts)
    } catch {
      setError('Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  if (pinnedCity) {
    return (
      <div className="map-add-done">
        <div className="contact-success">You're on the map in <strong>{pinnedCity}</strong>. Now bring someone with you.</div>
        <ShareButtons path="/reach" text="I just put myself on the LOD map. Where do you stand?" label="Invite others" />
      </div>
    )
  }

  return (
    <form className="map-add" onSubmit={submit}>
      <label className="contact-label" htmlFor="map-city">Your city (or the closest one)</label>
      <div className="map-add-row">
        <select id="map-city" className="contact-input" value={placeKeyValue} onChange={e => setPlaceKeyValue(e.target.value)} required>
          <option value="">Choose a city…</option>
          {REGIONS.map(region => (
            <optgroup key={region} label={region}>
              {PLACES.filter(p => p.region === region)
                .sort((a, b) => a.country.localeCompare(b.country) || a.city.localeCompare(b.city))
                .map(p => (
                  <option key={placeKey(p)} value={placeKey(p)}>{p.city}, {p.country}</option>
                ))}
            </optgroup>
          ))}
        </select>
        <button type="submit" className="btn-primary" disabled={!placeKeyValue || status === 'submitting'}>
          {status === 'submitting' ? 'Adding…' : 'Add Me'}
        </button>
      </div>
      {/* Honeypot — hidden from people, filled in by bots. */}
      <input className="hp-field" tabIndex={-1} autoComplete="off" aria-hidden="true" value={website} onChange={e => setWebsite(e.target.value)} name="website" />
      <p className="map-add-note">Only the city is saved — no name, no email, nothing that identifies you.</p>
      {status === 'error' && <div className="contact-error">{error}</div>}
    </form>
  )
}

function ReachPage() {
  const initialCounts = Route.useLoaderData()
  const [counts, setCounts] = useState<MapCounts>(initialCounts)
  const map = useMemo(() => buildMap(counts), [counts])
  const [activeRegion, setActiveRegion] = useState<Region | null>(null)
  const [hovered, setHovered] = useState<PinnedPlace | null>(null)

  const tip = hovered ? project(hovered.lon, hovered.lat) : null
  const empty = map.total === 0

  return (
    <>
      <SiteNav />

      <div className="reach-hero">
        <div className="section-label">— Global Presence</div>
        <h1 className="section-title" style={{ color: '#fff' }}>How Far We Reach</h1>
        <div className="green-line" style={{ margin: '0 auto 1.5rem' }} />
        <p className="reach-lede">
          Every red mark is a real supporter who put themselves on the map. The movement is not a
          place — it is a network. Add your city and stand with the others near you.
        </p>
      </div>

      {/* Hidden until the first real supporter adds themselves — no "0 / 0 / 0" at launch. */}
      {!empty && <div className="reach-stats">
        <div className="reach-stat">
          <div className="reach-stat-num">{map.total}</div>
          <div className="reach-stat-label">On the map</div>
        </div>
        <div className="reach-stat">
          <div className="reach-stat-num">{map.countries}</div>
          <div className="reach-stat-label">Countries</div>
        </div>
        <div className="reach-stat">
          <div className="reach-stat-num">{map.cities}</div>
          <div className="reach-stat-label">Cities</div>
        </div>
        <div className="reach-stat">
          <div className="reach-stat-num">75K+</div>
          <div className="reach-stat-label">On TikTok</div>
        </div>
      </div>}

      <div className="reach-map-wrap">
        <section className="map-add-panel" id="add">
          <div className="section-label">— Put Yourself on the Map</div>
          <div className="section-title" style={{ fontSize: '1.8rem' }}>Stand Up and Be Counted</div>
          <AddYourself onAdded={setCounts} />
        </section>

        <div className="reach-map-panel">
          <div className="reach-map-head">
            <span className="reach-map-title">Supporters Worldwide</span>
            <span className="reach-map-hint">{empty ? 'Be the first dot on the map' : 'Hover or tap a marker for local numbers'}</span>
          </div>
          <div className="reach-map-frame">
            <WorldMap map={map} activeRegion={activeRegion} hovered={hovered} onHover={setHovered} />
            {hovered && tip && (
              <div
                className="reach-tooltip"
                style={{
                  left: `${(tip[0] / MAP_W) * 100}%`,
                  top: `${((tip[1] - VIEW_Y) / VIEW_H) * 100}%`,
                }}
              >
                <div className="reach-tooltip-city">{hovered.city}</div>
                <div className="reach-tooltip-country">{hovered.country}</div>
                <div className="reach-tooltip-count">
                  {hovered.count} {hovered.count === 1 ? 'supporter' : 'supporters'}
                </div>
              </div>
            )}
          </div>
          <div className="reach-legend">
            <span className="reach-legend-item"><span className="reach-legend-dot" /> One supporter</span>
            <span className="reach-legend-item"><span className="reach-legend-land" /> Ground we cover</span>
          </div>
        </div>
      </div>

      {!empty && (
        <>
          <div className="divider" />

          <section className="lod-section">
            <div className="section-label">— Where We Are</div>
            <div className="section-title" style={{ fontSize: '2rem' }}>Strength by Region</div>
            <div className="green-line" />
            <p className="reach-note">Highlight a region to isolate it on the map above.</p>
            <div className="reach-region-list">
              {map.regions.filter(r => r.count > 0).map(stat => (
                <button
                  key={stat.region}
                  className={`reach-region${activeRegion === stat.region ? ' active' : ''}`}
                  onMouseEnter={() => setActiveRegion(stat.region)}
                  onMouseLeave={() => setActiveRegion(null)}
                  onClick={() => setActiveRegion(activeRegion === stat.region ? null : stat.region)}
                >
                  <span className="reach-region-name">{stat.region}</span>
                  <span className="reach-region-bar">
                    <span className="reach-region-fill" style={{ width: `${stat.share}%` }} />
                  </span>
                  <span className="reach-region-num">{stat.count}</span>
                  <span className="reach-region-share">{stat.share}%</span>
                </button>
              ))}
            </div>
          </section>

          <div className="divider" />

          <section className="lod-section">
            <div className="section-label">— The Strongholds</div>
            <div className="section-title" style={{ fontSize: '2rem' }}>Top Cities</div>
            <div className="green-line" />
            <div className="reach-city-grid">
              {map.pinned.slice(0, 12).map(place => (
                <div key={place.key} className="reach-city">
                  <div className="reach-city-count">{place.count}</div>
                  <div>
                    <div className="reach-city-name">{place.city}</div>
                    <div className="reach-city-country">{place.country}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      <div className="divider" />

      <section className="lod-section" style={{ textAlign: 'center' }}>
        <div className="section-title" style={{ fontSize: '2rem' }}>Go further</div>
        <p style={{ color: '#888', marginBottom: '2rem', lineHeight: 1.7 }}>
          Being on the map is the first step. Take action this week, or become a member and fund the fight.
        </p>
        <div className="hero-cta">
          <Link to="/action"><button className="btn-primary">Take Action</button></Link>
          <Link to="/join"><button className="btn-outline">Become a Member</button></Link>
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
