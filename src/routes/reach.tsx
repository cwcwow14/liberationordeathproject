import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { MAP_W, VIEW_BOX, VIEW_H, VIEW_Y, WORLD_LAND_PATH, project } from '../lib/world-map'
import {
  CITIES,
  MEMBER_DOTS,
  REGION_STATS,
  TOTAL_CITIES,
  TOTAL_COUNTRIES,
  TOTAL_MEMBERS,
  type MemberCity,
  type Region,
} from '../lib/members'
import { SiteFooter, SiteNav } from '../components/SiteNav'

export const Route = createFileRoute('/reach')({
  component: ReachPage,
})

// Meridians and parallels every 30° — drawn under the land for depth.
const GRATICULE_LON = [-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150]
const GRATICULE_LAT = [-60, -30, 0, 30, 60]

const TOP_CITIES = [...CITIES].sort((a, b) => b.members - a.members).slice(0, 12)

function WorldMap({
  activeRegion,
  hovered,
  onHover,
}: {
  activeRegion: Region | null
  hovered: MemberCity | null
  onHover: (city: MemberCity | null) => void
}) {
  return (
    <svg viewBox={VIEW_BOX} className="reach-map-svg" role="img" aria-label={`World map showing ${TOTAL_MEMBERS} LOD members across ${TOTAL_COUNTRIES} countries`}>
      <defs>
        <radialGradient id="reach-ocean" cx="50%" cy="45%" r="70%">
          <stop offset="0%" stopColor="#0d1f0d" />
          <stop offset="100%" stopColor="#070c07" />
        </radialGradient>
        <linearGradient id="reach-land" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1c4a22" />
          <stop offset="100%" stopColor="#123415" />
        </linearGradient>
        {/* Default filter region (-10%/120%) is plenty for a 2.2 blur and keeps
            the offscreen buffer small with 530 dots in one group. */}
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

      {/* One red dot per member, jittered around their home city. */}
      <g filter="url(#reach-glow)">
        {MEMBER_DOTS.map((dot, i) => {
          const dim = activeRegion !== null && dot.city.region !== activeRegion
          const lit = hovered !== null && dot.city === hovered
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
        {CITIES.map(city => {
          const [cx, cy] = project(city.lon, city.lat)
          const r = Math.max(6, 3.5 + Math.sqrt(city.members) * 2.4)
          return (
            <circle
              key={`${city.city}-${city.country}`}
              cx={cx}
              cy={cy}
              r={r}
              fill="transparent"
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => onHover(city)}
              onMouseLeave={() => onHover(null)}
            />
          )
        })}
      </g>
    </svg>
  )
}

function ReachPage() {
  const [activeRegion, setActiveRegion] = useState<Region | null>(null)
  const [hovered, setHovered] = useState<MemberCity | null>(null)

  const tip = hovered ? project(hovered.lon, hovered.lat) : null

  return (
    <>
      <SiteNav />

      <div className="reach-hero">
        <div className="section-label">— Global Presence</div>
        <h1 className="section-title" style={{ color: '#fff' }}>How Far We Reach</h1>
        <div className="green-line" style={{ margin: '0 auto 1.5rem' }} />
        <p className="reach-lede">
          Every red mark is one of us. From port cities to prairie towns, the movement is not a
          place — it is a network. This is where LOD stands today.
        </p>
      </div>

      <div className="reach-stats">
        <div className="reach-stat">
          <div className="reach-stat-num">{TOTAL_MEMBERS}</div>
          <div className="reach-stat-label">Members</div>
        </div>
        <div className="reach-stat">
          <div className="reach-stat-num">{TOTAL_COUNTRIES}</div>
          <div className="reach-stat-label">Countries</div>
        </div>
        <div className="reach-stat">
          <div className="reach-stat-num">{TOTAL_CITIES}</div>
          <div className="reach-stat-label">Cities</div>
        </div>
        <div className="reach-stat">
          <div className="reach-stat-num">6</div>
          <div className="reach-stat-label">Continents</div>
        </div>
      </div>

      <div className="reach-map-wrap">
        <div className="reach-map-panel">
          <div className="reach-map-head">
            <span className="reach-map-title">Member Distribution</span>
            <span className="reach-map-hint">Hover a marker for local numbers</span>
          </div>
          <div className="reach-map-frame">
            <WorldMap activeRegion={activeRegion} hovered={hovered} onHover={setHovered} />
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
                  {hovered.members} {hovered.members === 1 ? 'member' : 'members'}
                </div>
              </div>
            )}
          </div>
          <div className="reach-legend">
            <span className="reach-legend-item"><span className="reach-legend-dot" /> One member</span>
            <span className="reach-legend-item"><span className="reach-legend-land" /> Ground we cover</span>
          </div>
        </div>
      </div>

      <div className="divider" />

      <section className="lod-section">
        <div className="section-label">— Where We Are</div>
        <div className="section-title" style={{ fontSize: '2rem' }}>Strength by Region</div>
        <div className="green-line" />
        <p className="reach-note">
          Highlight a region to isolate it on the map above.
        </p>
        <div className="reach-region-list">
          {REGION_STATS.map(stat => (
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
              <span className="reach-region-num">{stat.members}</span>
              <span className="reach-region-share">{stat.share}%</span>
            </button>
          ))}
        </div>
      </section>

      <div className="divider" />

      <section className="lod-section">
        <div className="section-label">— The Strongholds</div>
        <div className="section-title" style={{ fontSize: '2rem' }}>Largest Cells</div>
        <div className="green-line" />
        <div className="reach-city-grid">
          {TOP_CITIES.map(city => (
            <div key={`${city.city}-${city.country}`} className="reach-city">
              <div className="reach-city-count">{city.members}</div>
              <div>
                <div className="reach-city-name">{city.city}</div>
                <div className="reach-city-country">{city.country}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="divider" />

      <section className="lod-section" style={{ textAlign: 'center' }}>
        <div className="section-title" style={{ fontSize: '2rem' }}>Put a dot on the map</div>
        <p style={{ color: '#888', marginBottom: '2rem', lineHeight: 1.7 }}>
          Wherever you are, there is a place for you in this. Join the movement and stand with the
          others near you.
        </p>
        <Link to="/join"><button className="btn-primary">Join the Movement</button></Link>
      </section>

      <SiteFooter />
    </>
  )
}
