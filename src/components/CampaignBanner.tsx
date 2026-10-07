import { useEffect, useState } from 'react'
import { CAMPAIGN } from '../lib/campaign'

const DISMISS_KEY = 'lod-campaign-dismissed'

function remaining(to: number): string | null {
  const ms = to - Date.now()
  if (ms <= 0) return null
  const d = Math.floor(ms / 86_400_000)
  const h = Math.floor((ms % 86_400_000) / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  return d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m`
}

export function CampaignBanner() {
  const target = CAMPAIGN.countdownTo ? new Date(CAMPAIGN.countdownTo).getTime() : null
  const [dismissed, setDismissed] = useState(false)
  const [left, setLeft] = useState<string | null>(target ? remaining(target) : null)

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISS_KEY) === CAMPAIGN.id) setDismissed(true)
    } catch {
      // storage unavailable — just show the banner
    }
    if (!target) return
    const t = setInterval(() => setLeft(remaining(target)), 30_000)
    return () => clearInterval(t)
  }, [target])

  if (!CAMPAIGN.enabled || dismissed) return null
  if (target && !left) return null // countdown finished

  function close() {
    setDismissed(true)
    try { localStorage.setItem(DISMISS_KEY, CAMPAIGN.id) } catch { /* ignore */ }
  }

  const external = /^https?:\/\//.test(CAMPAIGN.href)
  return (
    <div className="campaign" role="region" aria-label="Announcement">
      <span>{CAMPAIGN.text}</span>
      {left && <span className="campaign-count">{left}</span>}
      <a href={CAMPAIGN.href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>{CAMPAIGN.cta} →</a>
      <button className="campaign-close" onClick={close} aria-label="Dismiss announcement">✕</button>
    </div>
  )
}
