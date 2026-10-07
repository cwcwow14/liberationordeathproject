import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { PATREON_URL } from '../lib/tiers'
import { LodMark } from './LodMark'

import { TIKTOK_URL } from '../lib/tiktok'
import { trackEvent } from '../lib/track'

export { TIKTOK_URL }

// One nav for every page. Collapses into a menu button on phones — most visitors
// arrive from TikTok on mobile.
export function SiteNav({ label = 'LOD' }: { label?: string }) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <nav>
      <Link to="/" className="nav-logo" onClick={close}>
        <LodMark />
        <span className="logo-text">{label}</span>
      </Link>
      <button
        className="nav-toggle"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
      >
        {open ? '✕' : '☰'}
      </button>
      <ul className={`nav-links${open ? ' open' : ''}`}>
        <li><a href="/#manifesto" onClick={close}>Manifesto</a></li>
        <li><Link to="/action" onClick={close}>Take Action</Link></li>
        <li><Link to="/photos" onClick={close}>Photos</Link></li>
        <li><Link to="/reach" onClick={close}>Reach</Link></li>
        <li><a href={TIKTOK_URL} target="_blank" rel="noreferrer" onClick={() => { trackEvent('tiktok_click', 'nav'); close() }}>TikTok</a></li>
        <li><Link to="/join" className="nav-forum-btn" onClick={close}>Join</Link></li>
      </ul>
    </nav>
  )
}

export function SiteFooter() {
  return (
    <footer>
      <p style={{ color: '#2a4a2a', fontFamily: "'Oswald', sans-serif", letterSpacing: '3px', fontSize: '13px', marginBottom: '0.5rem' }}>LIBERATION OR DEATH</p>
      <p className="footer-links">
        <a href={TIKTOK_URL} target="_blank" rel="noreferrer" onClick={() => trackEvent('tiktok_click', 'footer')}>TikTok</a>
        <Link to="/join">Membership</Link>
        <a href={PATREON_URL} onClick={() => trackEvent('patreon_click', 'footer')}>Patreon</a>
        <Link to="/action">Take Action</Link>
        <a href="/#contact">Contact</a>
        <Link to="/privacy">Privacy</Link>
      </p>
      <p>© 2026 LOD Movement. All rights reserved.</p>
    </footer>
  )
}
