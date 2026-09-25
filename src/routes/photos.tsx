import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/photos')({
  component: PhotosPage,
})

function NavLodLogo() {
  return (
    <svg width="34" height="34" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <polygon points="100,8 192,100 100,192 8,100" fill="none" stroke="#4caf50" strokeWidth="9" />
      <polygon points="100,34 166,100 100,166 34,100" fill="none" stroke="#4caf50" strokeWidth="4" />
      <text x="100" y="118" textAnchor="middle" fontFamily="Arial Black,Arial" fontWeight="900" fontSize="52" fill="#4caf50">LOD</text>
    </svg>
  )
}

type Photo = { src: string; caption: string; tag?: string }

// Drop additional image files into /public and add entries here to grow the gallery.
const photos: Photo[] = [
  {
    src: '/IMG_0192.jpeg',
    caption: 'Animal Liberation — On the Front Lines',
    tag: 'Direct Action',
  },
  {
    src: '/alf-beagle-rescue.jpeg',
    caption: 'Beagles Freed from a Testing Facility',
    tag: 'Rescue',
  },
  {
    src: '/alf-horse-rescue.jpeg',
    caption: 'A Masked Activist Leads a Horse to Safety',
    tag: 'Rescue',
  },
  {
    src: '/alf-banner-beagles.jpeg',
    caption: 'Under the Banner — Beagles Liberated',
    tag: 'Direct Action',
  },
  {
    src: '/alf-rabbits-liberated.jpeg',
    caption: 'Rabbits Freed from a Testing Lab',
    tag: 'Direct Action',
  },
  {
    src: '/alf-beagles-fed.jpeg',
    caption: 'Among the Freed — Beagles Fed in Safety',
    tag: 'Rescue',
  },
  {
    src: '/alf-beagles-blue.jpeg',
    caption: 'Many Hands, Many Saved',
    tag: 'Rescue',
  },
  {
    src: '/alf-beagles-vintage.jpeg',
    caption: 'Beagles Freed — A Movement’s Record',
    tag: 'Rescue',
  },
  {
    src: '/alf-rabbits-white.jpeg',
    caption: 'Two White Rabbits, Carried to Safety',
    tag: 'Rescue',
  },
  {
    src: '/alf-rabbits-forest.jpeg',
    caption: 'Out of the Cage and Into the Trees',
    tag: 'Rescue',
  },
  {
    src: '/alf-rabbit-held.jpeg',
    caption: 'Cradled Out of the Lab',
    tag: 'Rescue',
  },
  {
    src: '/alf-duckling.jpeg',
    caption: 'A Rescued Duckling in Gloved Hands',
    tag: 'Rescue',
  },
]

function Lightbox({
  photo,
  index,
  total,
  onClose,
  onPrev,
  onNext,
}: {
  photo: Photo
  index: number
  total: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') onPrev()
      else if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, onPrev, onNext])

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-inner" onClick={e => e.stopPropagation()}>
        <button className="lightbox-close" onClick={onClose} aria-label="Close">✕</button>
        {total > 1 && (
          <button className="lightbox-nav lightbox-prev" onClick={onPrev} aria-label="Previous">‹</button>
        )}
        <img src={photo.src} alt={photo.caption} className="lightbox-img" />
        {total > 1 && (
          <button className="lightbox-nav lightbox-next" onClick={onNext} aria-label="Next">›</button>
        )}
        {photo.caption && <div className="lightbox-caption">{photo.caption}</div>}
        {total > 1 && <div className="lightbox-counter">{index + 1} / {total}</div>}
      </div>
    </div>
  )
}

function PhotosPage() {
  const [active, setActive] = useState<number | null>(null)

  const featured = photos[0]
  const rest = photos.slice(1)

  return (
    <>
      <nav>
        <a href="/" className="nav-logo" style={{ textDecoration: 'none' }}>
          <NavLodLogo />
          <span className="logo-text">LOD</span>
        </a>
        <ul className="nav-links">
          <li><a href="/#manifesto">Manifesto</a></li>
          <li><a href="/#pillars">Goals</a></li>
          <li><a href="/#tiktok">TikTok</a></li>
          <li><a href="/#contact">Contact</a></li>
          <li><a href="/reach">Reach</a></li>
          <li><a href="/photos" className="nav-forum-btn">Photos</a></li>
        </ul>
      </nav>

      <div className="photos-hero">
        <div className="section-label">— The Movement in Pictures</div>
        <h1 className="section-title" style={{ color: '#fff' }}>Photos</h1>
        <div className="green-line" style={{ margin: '0 auto 1.5rem' }} />
        <p style={{ color: '#888', maxWidth: 540, textAlign: 'center', lineHeight: 1.7 }}>
          Images from the front lines of animal liberation — documenting the resistance, the community, and the cause.
        </p>
      </div>

      <div className="photos-grid-wrap">
        {featured && (
          <div
            className="photo-featured"
            onClick={() => setActive(0)}
            tabIndex={0}
            role="button"
            onKeyDown={e => e.key === 'Enter' && setActive(0)}
          >
            <img src={featured.src} alt={featured.caption} className="photo-featured-img" />
            <div className="photo-featured-overlay">
              {featured.tag && <span className="photo-tag">{featured.tag}</span>}
              <span className="photo-featured-caption">{featured.caption}</span>
              <span className="photo-expand">⤢ View full</span>
            </div>
          </div>
        )}

        {rest.length > 0 && (
          <div className="photos-grid">
            {rest.map((photo, i) => {
              const idx = i + 1
              return (
                <div
                  key={idx}
                  className="photo-card"
                  style={{ animationDelay: `${i * 60}ms` }}
                  onClick={() => setActive(idx)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={e => e.key === 'Enter' && setActive(idx)}
                >
                  <img src={photo.src} alt={photo.caption} className="photo-thumb" />
                  <div className="photo-overlay">
                    <span className="photo-expand">⤢ View</span>
                  </div>
                  {photo.tag && <span className="photo-tag photo-tag-corner">{photo.tag}</span>}
                  {photo.caption && <div className="photo-caption">{photo.caption}</div>}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {active !== null && (
        <Lightbox
          photo={photos[active]}
          index={active}
          total={photos.length}
          onClose={() => setActive(null)}
          onPrev={() => setActive((active - 1 + photos.length) % photos.length)}
          onNext={() => setActive((active + 1) % photos.length)}
        />
      )}

      <footer style={{ textAlign: 'center', padding: '3rem 1rem', borderTop: '1px solid #1e3a1e' }}>
        <p style={{ color: '#2a4a2a', fontFamily: "'Oswald', sans-serif", letterSpacing: '3px', fontSize: '13px', marginBottom: '0.5rem' }}>LIBERATION OR DEATH</p>
        <p style={{ color: '#555', fontSize: '13px' }}>© 2026 LOD Movement. All rights reserved.</p>
      </footer>
    </>
  )
}
