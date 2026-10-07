import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { SiteFooter, SiteNav, TIKTOK_URL } from '../components/SiteNav'
import { TIERS } from '../lib/tiers'

export const Route = createFileRoute('/')({
  head: () => ({ links: [{ rel: 'canonical', href: 'https://liberationordeath.net/' }] }),
  component: Home,
})

// Free email list — the one channel we own if TikTok ever bans or buries the account.
// Submissions land in Netlify → Forms → "updates".
function UpdatesSignup() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<ContactStatus>('idle')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('submitting')
    try {
      const res = await fetch('/__forms.html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ 'form-name': 'updates', email }).toString(),
      })
      setStatus(res.ok ? 'success' : 'error')
      if (res.ok) setEmail('')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return <div className="contact-success signup-done">You're on the list. If TikTok ever takes us down, this is how we'll find you.</div>
  }
  return (
    <form name="updates" method="POST" data-netlify="true" netlify-honeypot="bot-field" onSubmit={handleSubmit} className="signup-form">
      <input type="hidden" name="form-name" value="updates" />
      <p style={{ display: 'none' }}><label>Don't fill this out: <input name="bot-field" /></label></p>
      <input
        className="contact-input"
        type="email"
        name="email"
        aria-label="Email address"
        placeholder="your@email.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <button type="submit" className="btn-primary" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Joining…' : 'Get Updates'}
      </button>
      {status === 'error' && <div className="contact-error" style={{ flexBasis: '100%' }}>Something went wrong. Please try again.</div>}
    </form>
  )
}

type ContactStatus = 'idle' | 'submitting' | 'success' | 'error'

function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<ContactStatus>('idle')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('submitting')
    try {
      const body = new URLSearchParams({
        'form-name': 'contact',
        name,
        email,
        phone,
        message,
      }).toString()
      const res = await fetch('/__forms.html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      })
      if (res.ok) {
        setStatus('success')
        setName(''); setEmail(''); setPhone(''); setMessage('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <form
      name="contact"
      method="POST"
      data-netlify="true"
      netlify-honeypot="bot-field"
      onSubmit={handleSubmit}
      className="contact-form"
    >
      <input type="hidden" name="form-name" value="contact" />
      <p style={{ display: 'none' }}>
        <label>Don't fill this out: <input name="bot-field" /></label>
      </p>
      <div className="contact-row">
        <div className="contact-field">
          <label className="contact-label">Full Name *</label>
          <input
            className="contact-input"
            type="text"
            name="name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your name"
            required
          />
        </div>
        <div className="contact-field">
          <label className="contact-label">Email Address *</label>
          <input
            className="contact-input"
            type="email"
            name="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />
        </div>
      </div>
      <div className="contact-field">
        <label className="contact-label">Phone / Other Contact Info</label>
        <input
          className="contact-input"
          type="text"
          name="phone"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="Phone number, Signal handle, etc. (optional)"
        />
      </div>
      <div className="contact-field">
        <label className="contact-label">Message *</label>
        <textarea
          className="contact-textarea"
          name="message"
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Tell us why you want to get involved, what you stand for, or ask us anything…"
          required
        />
      </div>
      {status === 'success' && (
        <div className="contact-success">
          Message received. We'll be in touch soon — stay ready.
        </div>
      )}
      {status === 'error' && (
        <div className="contact-error">
          Something went wrong. Please try again or email us directly.
        </div>
      )}
      <button
        type="submit"
        className="btn-primary"
        disabled={status === 'submitting'}
        style={{ width: '100%', marginTop: '0.5rem' }}
      >
        {status === 'submitting' ? 'Sending…' : 'Send Message'}
      </button>
    </form>
  )
}

function Home() {
  return (
    <>
      <SiteNav />

      <div className="hero">
        <img src="/lod-logo.jpg" alt="LOD — Liberation or Death" className="hero-logo" />
        <div className="hero-title">LOD</div>
        <div className="hero-subtitle">Liberation or Death</div>
        <a href={TIKTOK_URL} target="_blank" rel="noreferrer" className="hero-proof">75K+ followers on TikTok ↗</a>
        <p className="hero-tagline">A movement for those who refuse to accept the destruction of our planet. We fight for a green future, animal liberation, and radical climate action.</p>
        <div className="hero-cta">
          <Link to="/join"><button className="btn-primary">Become a Member</button></Link>
          <a href="#manifesto"><button className="btn-outline">Read the Manifesto</button></a>
        </div>
        <div className="hero-signup">
          <p className="hero-signup-label">Not ready to join? Get free updates by email.</p>
          <UpdatesSignup />
        </div>
      </div>

      <div className="divider" />

      <section className="lod-section" id="manifesto">
        <div className="section-label">— Our Manifesto</div>
        <div className="section-title">Liberation or Death</div>
        <div className="green-line" />
        <div className="manifesto-quote">"The earth does not belong to us. We belong to the earth."</div>
        <p className="manifesto-text">We are <strong>LOD — Liberation or Death</strong>. We exist because the time for polite conversation is over. Our planet is burning, our animals are suffering, and our future is being sold for profit. We refuse to be silent.</p>
        <p className="manifesto-text">We believe in a <strong>green society</strong> — one built not on consumption and extraction, but on harmony with the natural world. A society that measures its success not in GDP, but in the health of its ecosystems and the wellbeing of all living creatures.</p>
        <p className="manifesto-text">We demand <strong>real environmental action</strong> — not greenwashing, not carbon credits, not incremental half-measures. We demand a wholesale transformation of how humanity relates to the planet that sustains it.</p>
        <p className="manifesto-text">We stand for <strong>animal rights</strong> — the recognition that sentient beings are not resources, not property, not products. Every creature that feels pain deserves protection from those who would exploit them.</p>
        <p className="manifesto-text">And we fight against <strong>climate change</strong> — the greatest crisis of our era, driven by greed and enabled by cowardice. We hold accountable those who knew and did nothing.</p>
        <p className="manifesto-text">Liberation or Death is not a slogan. It is a choice. We choose liberation — of our planet, of animals, of the future. The alternative is a death we will not accept.</p>
      </section>

      <div className="divider" />

      <section className="lod-section" id="pillars">
        <div className="section-label">— What We Stand For</div>
        <div className="section-title">Our Core Goals</div>
        <div className="pillars-grid">
          <div className="pillar"><div className="pillar-icon">🌿</div><div className="pillar-title">Green Society</div><p className="pillar-text">Rebuilding civilization around ecological harmony — renewable systems, sustainable communities, and economies that work with nature, not against it.</p></div>
          <div className="pillar"><div className="pillar-icon">⚡</div><div className="pillar-title">Environmental Action</div><p className="pillar-text">Direct, radical, and uncompromising action to protect ecosystems, hold polluters accountable, and reverse the destruction caused by industrial capitalism.</p></div>
          <div className="pillar"><div className="pillar-icon">🐾</div><div className="pillar-title">Animal Rights</div><p className="pillar-text">Fighting for the recognition of all sentient beings as rights-holders — free from exploitation, factory farming, experimentation, and abuse of any kind.</p></div>
          <div className="pillar"><div className="pillar-icon">🌡️</div><div className="pillar-title">Climate Justice</div><p className="pillar-text">Confronting the climate crisis with urgency and honesty — demanding systemic change, fossil fuel abolition, and justice for frontline communities.</p></div>
        </div>
      </section>

      <div className="divider" />

      <section className="lod-section" id="tiktok">
        <div className="section-label">— Follow the Movement</div>
        <div className="section-title">Find Us on TikTok</div>
        <div className="tiktok-block">
          <div className="tiktok-handle">@liberationord3ath</div>
          <p className="tiktok-desc">We're on TikTok spreading the message, building community, and documenting the fight for a liberated planet. Join 75,000+ people watching and taking action.</p>
          <a href={TIKTOK_URL} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
            <button className="btn-primary">Follow on TikTok ↗</button>
          </a>
        </div>
      </section>

      <div className="divider" />

      <section className="lod-section" id="membership" style={{ textAlign: 'center' }}>
        <div className="section-label">— Membership</div>
        <div className="section-title">Go Beyond the Feed</div>
        <div className="green-line" style={{ margin: '0 auto 2rem' }} />
        <p className="manifesto-text" style={{ maxWidth: 620, margin: '0 auto 2rem' }}>
          TikTok gets 60 seconds. Members get the whole story — <strong>the bi-weekly Dispatch</strong>,
          <strong> exclusive posts and videos</strong>, and <strong>early access</strong> to new drops.
          Memberships run on Patreon, and every one keeps LOD independent.
        </p>
        <div className="tier-strip">
          {TIERS.map(t => (
            <Link key={t.id} to="/join" className={`tier-chip${t.featured ? ' featured' : ''}`}>
              <span className="tier-chip-name">{t.name}</span>
              <span className="tier-chip-price">{t.price}/mo</span>
            </Link>
          ))}
        </div>
        <Link to="/join"><button className="btn-primary">See What Members Get</button></Link>
      </section>

      <div className="divider" />

      <section className="lod-section" style={{ textAlign: 'center' }}>
        <div className="section-title" style={{ fontSize: '2rem' }}>See the movement in action</div>
        <p style={{ color: '#888', marginBottom: '2rem' }}>Photos from the front lines — animal liberation, direct action, and community.</p>
        <Link to="/photos"><button className="btn-primary">View Photos</button></Link>
      </section>

      <div className="divider" />

      <section className="lod-section" id="reach" style={{ textAlign: 'center' }}>
        <div className="section-label">— Global Presence</div>
        <div className="section-title">How Far We Reach</div>
        <div className="green-line" style={{ margin: '0 auto 2rem' }} />
        <p className="manifesto-text" style={{ maxWidth: 620, margin: '0 auto 2rem' }}>
          <strong>250 members</strong> across <strong>40 countries</strong> — from Portland to
          Prague to Cape Town. See every one of us on the map.
        </p>
        <Link to="/reach"><button className="btn-primary">View the Map</button></Link>
      </section>

      <div className="divider" />

      <section className="lod-section" id="contact">
        <div className="section-label">— Get in Touch</div>
        <div className="section-title">Contact Us</div>
        <div className="green-line" />
        <p className="manifesto-text" style={{ marginBottom: '2rem' }}>
          Want to get involved, ask a question, or connect with the movement? Leave your information below and we'll reach out.
        </p>
        <ContactForm />
      </section>

      <div className="divider" />

      <SiteFooter />
    </>
  )
}
