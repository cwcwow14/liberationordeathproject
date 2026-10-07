import { useEffect } from 'react'
import { FEATURED_VIDEOS, TIKTOK_HANDLE, TIKTOK_URL } from '../lib/tiktok'

const EMBED_SRC = 'https://www.tiktok.com/embed.js'

function videoId(url: string): string | null {
  return url.match(/\/video\/(\d+)/)?.[1] ?? null
}

// TikTok's embed script turns the <blockquote>s below into players. It only scans
// the page when it loads, so re-add it on every mount (client-side navigation
// back to the homepage would otherwise leave bare links).
function useTikTokEmbedScript() {
  useEffect(() => {
    document.querySelectorAll(`script[src="${EMBED_SRC}"]`).forEach(s => s.remove())
    const s = document.createElement('script')
    s.src = EMBED_SRC
    s.async = true
    document.body.appendChild(s)
  }, [])
}

export function TikTokFeed() {
  useTikTokEmbedScript()
  const videos = FEATURED_VIDEOS.map(url => ({ url, id: videoId(url) })).filter(v => v.id)

  if (videos.length === 0) {
    return (
      <div className="tiktok-embed-wrap">
        <blockquote
          className="tiktok-embed"
          cite={TIKTOK_URL}
          data-unique-id={TIKTOK_HANDLE}
          data-embed-type="creator"
          style={{ maxWidth: 780, minWidth: 288, margin: '0 auto' }}
        >
          <section>
            <a target="_blank" rel="noreferrer" href={`${TIKTOK_URL}?refer=creator_embed`}>@{TIKTOK_HANDLE}</a>
          </section>
        </blockquote>
      </div>
    )
  }

  return (
    <div className="tiktok-grid">
      {videos.map(v => (
        <blockquote key={v.id} className="tiktok-embed" cite={v.url} data-video-id={v.id!} style={{ maxWidth: 605, minWidth: 288, margin: 0 }}>
          <section>
            <a target="_blank" rel="noreferrer" href={v.url}>Watch on TikTok</a>
          </section>
        </blockquote>
      ))}
    </div>
  )
}
