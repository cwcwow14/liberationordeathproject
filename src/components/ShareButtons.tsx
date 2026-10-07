import { useEffect, useState } from 'react'
import { trackEvent } from '../lib/track'

// Share a page. On phones the native share sheet comes first (it reaches Instagram,
// TikTok, Messages…); the direct links cover desktop browsers without one.
export function ShareButtons({ path, text, label = 'Share this' }: { path: string; text: string; label?: string }) {
  const url = `https://liberationordeath.net${path}`
  const [canNativeShare, setCanNativeShare] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setCanNativeShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function')
  }, [])

  async function nativeShare() {
    try {
      await navigator.share({ title: 'LOD — Liberation or Death', text, url })
      trackEvent('share', `native:${path}`)
    } catch {
      // Closing the share sheet rejects — nothing to do.
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      trackEvent('share', `copy:${path}`)
    } catch {
      window.prompt('Copy this link:', url)
    }
  }

  const enc = encodeURIComponent
  const links = [
    { name: 'X', href: `https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}` },
    { name: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}` },
    { name: 'WhatsApp', href: `https://wa.me/?text=${enc(`${text} ${url}`)}` },
  ]

  return (
    <div className="share">
      <span className="share-label">{label}</span>
      <div className="share-row">
        {canNativeShare && <button className="share-btn share-btn-main" onClick={nativeShare}>Share ↗</button>}
        {links.map(l => (
          <a
            key={l.name}
            className="share-btn"
            href={l.href}
            target="_blank"
            rel="noreferrer"
            onClick={() => trackEvent('share', `${l.name.toLowerCase()}:${path}`)}
          >
            {l.name}
          </a>
        ))}
        <button className="share-btn" onClick={copy}>{copied ? 'Copied ✓' : 'Copy link'}</button>
      </div>
    </div>
  )
}
