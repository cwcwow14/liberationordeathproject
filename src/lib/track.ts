// Tiny client for the first-party visitor stats (src/routes/api/track.ts).
// Fire-and-forget: tracking never throws and never blocks the page.

export type TrackKind =
  | 'pageview'
  | 'patreon_click'
  | 'tiktok_click'
  | 'share'
  | 'email_signup'
  | 'contact_submit'
  | 'action_click'

function send(payload: Record<string, unknown>) {
  try {
    const body = JSON.stringify(payload)
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/track', new Blob([body], { type: 'application/json' }))
    } else {
      fetch('/api/track', { method: 'POST', body, keepalive: true }).catch(() => {})
    }
  } catch {
    // ignore
  }
}

export function trackEvent(kind: TrackKind, detail?: string) {
  if (typeof window === 'undefined') return
  send({ kind, path: window.location.pathname, detail })
}

let firstView = true

export function trackPageview(path: string) {
  if (typeof window === 'undefined') return
  let referrer: string | undefined
  // Only the first page of a visit has a meaningful referrer; keep just the host
  // of an outside site (e.g. "tiktok.com"), never the full URL.
  if (firstView && document.referrer) {
    try {
      const host = new URL(document.referrer).hostname.replace(/^www\./, '')
      if (host && host !== window.location.hostname.replace(/^www\./, '')) referrer = host
    } catch {
      // ignore malformed referrers
    }
  }
  firstView = false
  send({ kind: 'pageview', path, referrer })
}
