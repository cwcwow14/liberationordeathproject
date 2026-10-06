import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useIdentity } from '../lib/identity-context'

export const TIKTOK_URL = 'https://www.tiktok.com/@liberationord3ath'

export function NavLodLogo() {
  return (
    <svg width="34" height="34" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <polygon points="100,8 192,100 100,192 8,100" fill="none" stroke="#4caf50" strokeWidth="9" />
      <polygon points="100,34 166,100 100,166 34,100" fill="none" stroke="#4caf50" strokeWidth="4" />
      <text x="100" y="118" textAnchor="middle" fontFamily="Arial Black,Arial" fontWeight="900" fontSize="52" fill="#4caf50">LOD</text>
    </svg>
  )
}

// One nav for every page. Collapses into a menu button on phones — most visitors
// arrive from TikTok on mobile.
export function SiteNav({ label = 'LOD' }: { label?: string }) {
  const { user } = useIdentity()
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <nav>
      <Link to="/" className="nav-logo" onClick={close}>
        <NavLodLogo />
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
        <li><Link to="/photos" onClick={close}>Photos</Link></li>
        <li><Link to="/reach" onClick={close}>Reach</Link></li>
        <li><a href={TIKTOK_URL} target="_blank" rel="noreferrer" onClick={close}>TikTok</a></li>
        <li>
          {user
            ? <Link to="/members" onClick={close}>Members</Link>
            : <Link to="/login" search={{ redirect: '/members' }} onClick={close}>Sign In</Link>}
        </li>
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
        <a href={TIKTOK_URL} target="_blank" rel="noreferrer">TikTok</a>
        <Link to="/join">Membership</Link>
        <a href="/#contact">Contact</a>
      </p>
      <p>© 2026 LOD Movement. All rights reserved.</p>
    </footer>
  )
}
