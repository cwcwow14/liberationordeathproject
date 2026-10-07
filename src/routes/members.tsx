import { createFileRoute, Link } from '@tanstack/react-router'
import { SiteFooter, SiteNav } from '../components/SiteNav'
import { PATREON_URL } from '../lib/tiers'

// Member content lives on Patreon. This page stays so old links and bookmarks
// to /members still land somewhere useful.
export const Route = createFileRoute('/members')({
  head: () => ({ meta: [{ title: 'Members — LOD' }, { name: 'robots', content: 'noindex' }] }),
  component: MembersPage,
})

function MembersPage() {
  return (
    <>
      <SiteNav />

      <div className="photos-hero" style={{ minHeight: '60vh', justifyContent: 'center' }}>
        <div className="section-label">— Members Area</div>
        <div className="section-title">The Inside Line</div>
        <div className="green-line" style={{ margin: '0 auto 1.5rem' }} />
        <p className="reach-lede" style={{ marginBottom: '2rem' }}>
          The Dispatch newsletter, exclusive posts and videos, and early access all live on our
          Patreon. Already a member? Open Patreon to catch up.
        </p>
        <div className="hero-cta">
          <a href={PATREON_URL}><button className="btn-primary">Open Patreon</button></a>
          <Link to="/join"><button className="btn-outline">See Memberships</button></Link>
        </div>
      </div>

      <SiteFooter />
    </>
  )
}
