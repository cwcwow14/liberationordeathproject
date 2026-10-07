import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { SiteNav } from '../components/SiteNav'
import { useIdentity } from '../lib/identity-context'
import { getStats, type Row, type Stats } from '../server/stats'

// Admin-only visitor stats. Sign in with an ADMIN_EMAILS account (or an Identity
// user with the "admin" role) to see them.
export const Route = createFileRoute('/stats')({
  head: () => ({ meta: [{ title: 'Stats — LOD' }, { name: 'robots', content: 'noindex' }] }),
  component: StatsPage,
})

const RANGES = [7, 30, 90] as const

function fmtDay(day: string) {
  return new Date(`${day}T00:00:00Z`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' })
}

// Bar with rounded top corners, anchored flat to the baseline.
function barPath(x: number, w: number, h: number, base: number) {
  const r = Math.min(4, h / 2, w / 2)
  const top = base - h
  return `M${x},${base} V${top + r} Q${x},${top} ${x + r},${top} H${x + w - r} Q${x + w},${top} ${x + w},${top + r} V${base} Z`
}

function Tile({ value, label, note }: { value: string | number; label: string; note?: string }) {
  return (
    <div className="stat-tile">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {note && <div className="stat-note">{note}</div>}
    </div>
  )
}

// One series (page views per day) in the brand green — no legend needed; the
// panel title names it. Hover/tap a bar for its exact value.
function DailyChart({ daily }: { daily: Stats['daily'] }) {
  const [hover, setHover] = useState<number | null>(null)
  const max = Math.max(1, ...daily.map(d => d.count))
  const W = 720
  const H = 180
  const gap = 2
  const bw = W / daily.length - gap
  const h = hover !== null ? daily[hover] : null

  return (
    <div className="stat-chart">
      <div className="stat-chart-head">
        <span className="reach-map-title">Page views per day</span>
        <span className="stat-chart-readout">
          {h ? <>{fmtDay(h.day)} · <strong>{h.count}</strong> views</> : <>Peak <strong>{max}</strong> / day</>}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="stat-chart-svg" role="img" aria-label="Page views per day">
        <line x1="0" y1={H - 0.5} x2={W} y2={H - 0.5} stroke="#1e3a1e" />
        <line x1="0" y1={0.5} x2={W} y2={0.5} stroke="#1e3a1e" strokeDasharray="3 4" />
        {daily.map((d, i) => {
          const bh = d.count ? Math.max(3, (d.count / max) * (H - 12)) : 0
          const x = i * (bw + gap)
          return (
            <g key={d.day} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} onClick={() => setHover(i)}>
              {/* Full-height hit target, larger than the bar itself. */}
              <rect x={x} y={0} width={bw + gap} height={H} fill="transparent" />
              {bh > 0 && (
                <path
                  d={barPath(x, bw, bh, H)}
                  fill={hover === i ? '#66bb6a' : '#4caf50'}
                />
              )}
            </g>
          )
        })}
      </svg>
      <div className="stat-chart-axis">
        <span>{fmtDay(daily[0].day)}</span>
        <span>{fmtDay(daily[daily.length - 1].day)}</span>
      </div>
    </div>
  )
}

function Table({ title, rows, empty, labelFor }: { title: string; rows: Row[]; empty: string; labelFor?: (l: string) => string }) {
  const max = Math.max(1, ...rows.map(r => r.count))
  return (
    <div className="stat-table">
      <div className="reach-map-title" style={{ marginBottom: '0.75rem' }}>{title}</div>
      {rows.length === 0 ? (
        <p className="stat-empty">{empty}</p>
      ) : (
        <table>
          <tbody>
            {rows.map(r => (
              <tr key={r.label}>
                <td className="stat-row-label">
                  <span className="stat-row-bar" style={{ width: `${(r.count / max) * 100}%` }} />
                  <span className="stat-row-text">{labelFor ? labelFor(r.label) : r.label}</span>
                </td>
                <td className="stat-row-num">{r.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

const TIER_LABEL: Record<string, string> = {
  supporter: 'Join page — Supporter',
  activist: 'Join page — Activist',
  inner_circle: 'Join page — Inner Circle',
  footer: 'Footer link',
  members: 'Members page',
}

function StatsPage() {
  const { user, ready } = useIdentity()
  const [days, setDays] = useState<number>(30)
  const [stats, setStats] = useState<Stats | null>(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!ready || !user) return
    setErr('')
    getStats({ data: { days } })
      .then(setStats)
      .catch((e: any) => setErr(/admin/i.test(e?.message ?? '') ? 'This page is only for LOD admins.' : 'Could not load stats right now.'))
  }, [ready, user, days])

  return (
    <>
      <SiteNav />
      <section className="stats-wrap">
        <div className="stats-head">
          <div>
            <div className="section-label">— Admin</div>
            <h1 className="section-title" style={{ fontSize: '2.2rem' }}>Visitor Stats</h1>
          </div>
          <div className="stats-range" role="tablist" aria-label="Time range">
            {RANGES.map(r => (
              <button key={r} role="tab" aria-selected={days === r} className={`auth-tab${days === r ? ' active' : ''}`} onClick={() => setDays(r)}>
                {r} days
              </button>
            ))}
          </div>
        </div>

        {ready && !user && (
          <p className="reach-note">
            <Link to="/login" search={{ redirect: '/stats' }} style={{ color: '#4caf50' }}>Sign in</Link> with an admin account to see stats.
          </p>
        )}
        {err && <div className="contact-error">{err}</div>}
        {user && !stats && !err && <p className="reach-note">Loading…</p>}

        {stats && (
          <>
            <div className="stat-tiles">
              <Tile value={stats.pageviews} label="Page views" note={`${stats.mobileShare}% on phones`} />
              <Tile value={stats.patreonClicks} label="Patreon clicks" note={stats.pageviews ? `${((stats.patreonClicks / stats.pageviews) * 100).toFixed(1)}% of views` : undefined} />
              <Tile value={stats.emailSignups} label="Email signups" />
              <Tile value={stats.mapPinsTotal} label="On the map" note="all time" />
              <Tile value={stats.tiktokClicks} label="TikTok clicks" />
              <Tile value={stats.contactSubmits} label="Contact messages" />
            </div>

            <DailyChart daily={stats.daily} />

            <div className="stat-tables">
              <Table title="Top pages" rows={stats.topPages} empty="No page views yet." />
              <Table title="Where visitors come from" rows={stats.referrers} empty="No outside referrers yet — direct visits and apps like TikTok often hide where they came from." />
              <Table title="Patreon clicks by button" rows={stats.patreonBy} empty="No Patreon clicks yet." labelFor={l => TIER_LABEL[l] ?? l} />
              <Table title="Take Action clicks" rows={stats.actions} empty="No action clicks yet." />
              <Table title="Shares" rows={stats.shares} empty="No shares yet." />
            </div>
          </>
        )}
      </section>
    </>
  )
}
