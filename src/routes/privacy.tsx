import { createFileRoute, Link } from '@tanstack/react-router'
import { SiteFooter, SiteNav } from '../components/SiteNav'

export const Route = createFileRoute('/privacy')({
  head: () => ({
    meta: [
      { title: 'Privacy Policy — LOD' },
      { name: 'description', content: 'What liberationordeath.net collects, why, and how to have it deleted.' },
    ],
    links: [{ rel: 'canonical', href: 'https://liberationordeath.net/privacy' }],
  }),
  component: PrivacyPage,
})

const UPDATED = 'October 7, 2026'

function PrivacyPage() {
  return (
    <>
      <SiteNav />

      <article className="lod-section legal">
        <div className="section-label">— Privacy</div>
        <h1 className="section-title">Privacy Policy</h1>
        <div className="green-line" />
        <p className="legal-updated">Last updated {UPDATED}</p>

        <p>
          This policy explains what liberationordeath.net ("LOD", "we") collects, why, and what you can
          do about it. The short version: we collect as little as possible, we never sell it, and we
          delete it if you ask.
        </p>

        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>Email updates.</strong> If you sign up for updates, we store your email address so
            we can send you news about the movement. You can unsubscribe at any time.
          </li>
          <li>
            <strong>Contact form.</strong> If you contact us, we store your name, email, any phone
            number or other contact details you choose to give, and your message, so we can reply.
          </li>
          <li>
            <strong>The reach map.</strong> If you put yourself on the map, we store only the city you
            pick. To stop repeat submissions we keep a scrambled code derived from your IP address
            that changes every day and can't be turned back into the address. We never store the IP
            address itself, and nothing on the map identifies you.
          </li>
          <li>
            <strong>Visitor statistics.</strong> To understand which pages are useful, we count page
            views and a few clicks (such as on our Patreon and TikTok links, and share buttons). We
            record the page, the website that sent you (for example "tiktok.com"), and whether you're
            on a phone. We don't use cookies for this, and we don't record your IP address, browser
            details or anything else that identifies you.
          </li>
          <li>
            <strong>Accounts.</strong> If you create an account on this site, your email address,
            name and password are handled by our hosting provider's identity service. Passwords are
            never visible to us.
          </li>
        </ul>

        <h2>What we don't do</h2>
        <ul>
          <li>We don't sell, rent or trade your information.</li>
          <li>We don't use advertising trackers or build profiles of you.</li>
          <li>We don't use cookies for statistics or advertising.</li>
        </ul>

        <h2>Other services</h2>
        <p>Some parts of the site come from other companies, each with its own privacy policy:</p>
        <ul>
          <li>
            <strong>Netlify</strong> hosts the site and stores form submissions and site data. Like
            any web host, it processes technical request data (such as IP addresses) to deliver
            pages and keep the site secure.
          </li>
          <li>
            <strong>TikTok.</strong> The videos on the homepage are embedded from TikTok. When they
            load, TikTok may set its own cookies and collect data under the{' '}
            <a href="https://www.tiktok.com/legal/privacy-policy" target="_blank" rel="noreferrer">TikTok privacy policy</a>.
          </li>
          <li>
            <strong>Patreon.</strong> Memberships are sold on Patreon. Anything you give Patreon,
            including payment details, is handled under the{' '}
            <a href="https://privacy.patreon.com/" target="_blank" rel="noreferrer">Patreon privacy policy</a>. We never
            see your card details.
          </li>
          <li>
            <strong>Google Fonts</strong> provides the site's fonts, so your browser requests them from
            Google's servers.
          </li>
        </ul>

        <h2>How long we keep it</h2>
        <p>
          Email addresses stay on our list until you unsubscribe or ask us to remove them. Contact
          messages are kept only as long as needed to respond. Map entries stay on the map until you
          ask us to remove them. Visitor statistics contain no personal information.
        </p>

        <h2>Your choices and rights</h2>
        <p>
          You can ask us to show you, correct or delete any information we hold about you. Depending
          on where you live (for example under the GDPR in the UK and EU, or state privacy laws in
          the US), you may have further rights. We'll honor any reasonable request wherever you live.
          To make a request, use the <Link to="/" hash="contact">contact form</Link> and tell us what
          you'd like us to do.
        </p>

        <h2>Children</h2>
        <p>
          This site isn't directed at children under 13, and we don't knowingly collect information
          from them. If you believe a child has given us information, contact us and we'll delete it.
        </p>

        <h2>Changes</h2>
        <p>
          If we change this policy, we'll update the date at the top of this page.
        </p>
      </article>

      <SiteFooter />
    </>
  )
}
