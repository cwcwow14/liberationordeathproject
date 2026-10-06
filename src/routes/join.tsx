import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { SiteFooter, SiteNav } from '../components/SiteNav'
import { useIdentity } from '../lib/identity-context'
import { TIERS, type TierId } from '../lib/tiers'
import { createCheckout, getMyMembership, getPortalUrl, type MembershipInfo } from '../server/membership'

export const Route = createFileRoute('/join')({
  head: () => ({
    meta: [
      { title: 'Join LOD — Membership' },
      { name: 'description', content: 'Become a member of LOD — Liberation or Death. The bi-weekly Dispatch newsletter, exclusive posts and videos, and early access. From $3/month.' },
    ],
    links: [{ rel: 'canonical', href: 'https://liberationordeath.net/join' }],
  }),
  component: JoinPage,
})

function JoinPage() {
  const { user, ready } = useIdentity()
  const navigate = useNavigate()
  const [membership, setMembership] = useState<MembershipInfo | null>(null)
  const [busy, setBusy] = useState<TierId | 'portal' | null>(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!ready || !user) { setMembership(null); return }
    getMyMembership().then(r => setMembership(r.membership)).catch(() => setMembership(null))
  }, [ready, user])

  const activeTier = membership?.active ? membership.tier : null

  async function choose(tier: TierId) {
    setErr('')
    if (!user) {
      navigate({ to: '/login', search: { redirect: '/join', mode: 'signup' } })
      return
    }
    setBusy(tier)
    try {
      const { url } = await createCheckout({ data: { tier } })
      window.location.href = url
    } catch (e: any) {
      setErr(e?.message || 'Could not start checkout. Please try again.')
      setBusy(null)
    }
  }

  async function manage() {
    setErr('')
    setBusy('portal')
    try {
      const { url } = await getPortalUrl()
      window.location.href = url
    } catch (e: any) {
      setErr(e?.message || 'Could not open the billing portal.')
      setBusy(null)
    }
  }

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
        {activeTier && (
          <div className="member-banner">
            You're a <strong>{membership?.tierName}</strong> member.{' '}
            <Link to="/members">Go to the members area →</Link>
            <button className="btn-outline btn-small" onClick={manage} disabled={busy === 'portal'}>
              {busy === 'portal' ? 'Opening…' : 'Manage / change plan'}
            </button>
          </div>
        )}
        {err && <div className="contact-error" style={{ marginBottom: '1.5rem' }}>{err}</div>}

        <div className="tiers-grid">
          {TIERS.map(t => (
            <div key={t.id} className={`tier-card${t.featured ? ' featured' : ''}${activeTier === t.id ? ' current' : ''}`}>
              {t.featured && <div className="photo-tag tier-flag">Most popular</div>}
              <div className="tier-name">{t.name}</div>
              <div className="tier-price">{t.price}<span>/month</span></div>
              <p className="tier-blurb">{t.blurb}</p>
              <ul className="tier-perks">
                {t.perks.map(p => <li key={p}>{p}</li>)}
              </ul>
              {activeTier === t.id ? (
                <button className="btn-outline" disabled>Your plan</button>
              ) : activeTier ? (
                <button className="btn-outline" onClick={manage} disabled={busy !== null}>Switch plan</button>
              ) : (
                <button className={t.featured ? 'btn-primary' : 'btn-outline'} onClick={() => choose(t.id)} disabled={busy !== null}>
                  {busy === t.id ? 'Opening checkout…' : `Join as ${t.name}`}
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="tiers-faq">
          <div><strong>How do I pay?</strong> Checkout is handled securely by Lemon Squeezy (card, PayPal and other common methods). Sales tax and VAT are calculated for your country.</div>
          <div><strong>Can I cancel?</strong> Any time, in one click from "Manage membership". You keep access until the end of the month you paid for.</div>
          <div><strong>Do I need an account?</strong> Yes — a free LOD account, so your membership unlocks the members area on this site. {!user && <Link to="/login" search={{ redirect: '/join', mode: 'signup' }}>Create one here.</Link>}</div>
          <div><strong>Is this a donation?</strong> No — it's a paid membership for content. It is not tax-deductible.</div>
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
