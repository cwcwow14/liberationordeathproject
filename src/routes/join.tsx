import { createFileRoute } from '@tanstack/react-router'
import { SiteFooter, SiteNav } from '../components/SiteNav'
import { PATREON_URL, TIERS } from '../lib/tiers'

export const Route = createFileRoute('/join')({
  head: () => ({
    meta: [
      { title: 'Join LOD — Membership' },
      { name: 'description', content: 'Become a member of LOD — Liberation or Death on Patreon. The bi-weekly Dispatch newsletter, exclusive posts and videos, and early access. From $3/month.' },
    ],
    links: [{ rel: 'canonical', href: 'https://liberationordeath.net/join' }],
  }),
  component: JoinPage,
})

function JoinPage() {
  return (
    <>
      <SiteNav />

      <div className="photos-hero">
        <div className="section-label">— Membership</div>
        <div className="section-title">Fund the Fight</div>
        <div className="green-line" style={{ margin: '0 auto 1.5rem' }} />
        <p className="reach-lede">
          LOD is funded by the people who watch it. Members keep the movement independent — no
          sponsors, no brand deals telling us what we can say. In return you get what doesn't make it
          onto TikTok.
        </p>
      </div>

      <section className="tiers-wrap">
        <div className="tiers-grid">
          {TIERS.map(t => (
            <div key={t.id} className={`tier-card${t.featured ? ' featured' : ''}`}>
              {t.featured && <div className="photo-tag tier-flag">Most popular</div>}
              <div className="tier-name">{t.name}</div>
              <div className="tier-price">{t.price}<span>/month</span></div>
              <p className="tier-blurb">{t.blurb}</p>
              <ul className="tier-perks">
                {t.perks.map(p => <li key={p}>{p}</li>)}
              </ul>
              <a href={PATREON_URL}>
                <button className={t.featured ? 'btn-primary' : 'btn-outline'}>Join as {t.name}</button>
              </a>
            </div>
          ))}
        </div>

        <div className="tiers-faq">
          <div><strong>How do I join?</strong> Memberships run on Patreon. Tap any tier, pick it on our Patreon page, and you're in. Patreon handles payment securely.</div>
          <div><strong>How do I get the newsletter?</strong> Every Dispatch is posted on Patreon and emailed straight to you. You can also read it in the Patreon app.</div>
          <div><strong>Can I cancel?</strong> Any time, from your Patreon account. You can also switch tiers there.</div>
          <div><strong>Is this a donation?</strong> No — it's a paid membership for content. It is not tax-deductible.</div>
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
