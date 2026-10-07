import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { SiteFooter, SiteNav } from '../components/SiteNav'
import { ShareButtons } from '../components/ShareButtons'
import { trackEvent } from '../lib/track'

export const Route = createFileRoute('/action')({
  head: () => ({
    meta: [
      { title: 'Take Action — LOD' },
      { name: 'description', content: 'Things you can do this week for animals and the planet: contact your representatives, switch to cruelty-free, support sanctuaries, and spread the word.' },
    ],
    links: [{ rel: 'canonical', href: 'https://liberationordeath.net/action' }],
  }),
  component: ActionPage,
})

type ActionLink = { label: string; href: string }

function Out({ link, id }: { link: ActionLink; id: string }) {
  return (
    <a className="action-link" href={link.href} target="_blank" rel="noreferrer" onClick={() => trackEvent('action_click', id)}>
      {link.label} ↗
    </a>
  )
}

const REPS: ActionLink[] = [
  { label: 'United States — House', href: 'https://www.house.gov/representatives/find-your-representative' },
  { label: 'United States — Senate', href: 'https://www.senate.gov/senators/senators-contact.htm' },
  { label: 'United Kingdom — MPs', href: 'https://members.parliament.uk/FindYourMP' },
  { label: 'Canada — MPs', href: 'https://www.ourcommons.ca/members/en' },
  { label: 'Australia — Parliament', href: 'https://www.aph.gov.au/Senators_and_Members' },
  { label: 'European Union — MEPs', href: 'https://www.europarl.europa.eu/meps/en/home' },
]

const LETTER = `Dear [Representative's name],

I'm a constituent writing to ask you to support legislation that ends cruel animal testing, protects wildlife habitats, and commits to real cuts in emissions — not offsets and promises.

Specifically, I'm asking you to:
• Back funding and approval pathways for non-animal research methods.
• Support stronger protections for animals in farms, labs and the wild.
• Vote for climate policy that phases out fossil fuels on a clear timeline.

These issues matter to me and to many voters in our area. I'd appreciate knowing where you stand.

Thank you,
[Your name]
[Your town / postcode]`

function LetterTemplate() {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(LETTER)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      trackEvent('action_click', 'copy-letter')
    } catch {
      window.prompt('Copy this message:', LETTER)
    }
  }
  return (
    <div className="letter">
      <pre className="letter-text">{LETTER}</pre>
      <button className="btn-outline btn-compact" onClick={copy}>{copied ? 'Copied ✓' : 'Copy message'}</button>
    </div>
  )
}

function ActionPage() {
  return (
    <>
      <SiteNav />

      <div className="photos-hero">
        <div className="section-label">— Take Action</div>
        <h1 className="section-title">Watching Isn't Enough</h1>
        <div className="green-line" style={{ margin: '0 auto 1.5rem' }} />
        <p className="reach-lede">
          Every big change is millions of small ones. Pick one thing from this page and do it this
          week. Then come back and pick another.
        </p>
      </div>

      <section className="action-wrap">
        <div className="action-card">
          <div className="action-num">01</div>
          <div className="action-body">
            <h2 className="action-title">Contact your representatives</h2>
            <p className="action-text">
              Lawmakers count messages. A short, polite note from a real constituent carries more
              weight than you'd think. Find yours, then copy the message below and make it your own.
            </p>
            <div className="action-links">
              {REPS.map(r => <Out key={r.href} link={r} id={`reps:${r.label}`} />)}
            </div>
            <LetterTemplate />
          </div>
        </div>

        <div className="action-card">
          <div className="action-num">02</div>
          <div className="action-body">
            <h2 className="action-title">Switch what you buy</h2>
            <p className="action-text">
              Your money is a vote. Choose cruelty-free products, and try eating plant-based — even a
              few days a week cuts demand for factory farming and slashes your footprint.
            </p>
            <div className="action-links">
              <Out link={{ label: 'Leaping Bunny — cruelty-free brands', href: 'https://www.leapingbunny.org/' }} id="shop:leaping-bunny" />
              <Out link={{ label: 'Challenge 22 — free plant-based mentoring', href: 'https://challenge22.com/' }} id="shop:challenge22" />
              <Out link={{ label: 'Veganuary — try plant-based', href: 'https://veganuary.com/' }} id="shop:veganuary" />
            </div>
          </div>
        </div>

        <div className="action-card">
          <div className="action-num">03</div>
          <div className="action-body">
            <h2 className="action-title">Support rescued animals</h2>
            <p className="action-text">
              Sanctuaries give rescued animals a life, and lab-animal rescues re-home dogs, cats and
              rabbits released from testing. Visit, volunteer, donate — or adopt.
            </p>
            <div className="action-links">
              <Out link={{ label: 'Find an accredited sanctuary', href: 'https://sanctuaryfederation.org/' }} id="rescue:gfas" />
              <Out link={{ label: 'Beagle Freedom Project — adopt a lab survivor', href: 'https://bfp.org/' }} id="rescue:bfp" />
            </div>
          </div>
        </div>

        <div className="action-card">
          <div className="action-num">04</div>
          <div className="action-body">
            <h2 className="action-title">Organize locally for the climate</h2>
            <p className="action-text">
              Join people near you who are already pushing for climate action — campaigns,
              strikes and local pressure on councils and companies.
            </p>
            <div className="action-links">
              <Out link={{ label: '350.org — find a local group', href: 'https://350.org/' }} id="climate:350" />
              <Out link={{ label: 'Fridays for Future', href: 'https://fridaysforfuture.org/' }} id="climate:fff" />
            </div>
          </div>
        </div>

        <div className="action-card">
          <div className="action-num">05</div>
          <div className="action-body">
            <h2 className="action-title">Show up — and know your rights</h2>
            <p className="action-text">
              Peaceful protest is one of the most powerful tools we have. Before you go, know your
              rights and stay safe.
            </p>
            <div className="action-links">
              <Out link={{ label: "ACLU — protesters' rights (US)", href: 'https://www.aclu.org/know-your-rights/protesters-rights' }} id="protest:aclu" />
              <Out link={{ label: 'Liberty — protest rights (UK)', href: 'https://www.libertyhumanrights.org.uk/advice_information/protest/' }} id="protest:liberty" />
            </div>
          </div>
        </div>

        <div className="action-card">
          <div className="action-num">06</div>
          <div className="action-body">
            <h2 className="action-title">Spread the word</h2>
            <p className="action-text">
              The movement grows one share at a time. Send this page to someone who cares, and put
              yourself on the map so others near you know they're not alone.
            </p>
            <ShareButtons path="/action" text="Watching isn't enough. Here's what you can actually do this week:" />
            <div className="action-links" style={{ marginTop: '1rem' }}>
              <Link className="action-link" to="/quotes">Make a quote card →</Link>
              <Link className="action-link" to="/reach" hash="add">Put yourself on the map →</Link>
              <Link className="action-link" to="/join">Become a member →</Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </>
  )
}
