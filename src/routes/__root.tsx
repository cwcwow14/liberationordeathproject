import { HeadContent, Scripts, createRootRoute, useRouterState } from '@tanstack/react-router'
import { useEffect } from 'react'
import { IdentityProvider } from '../lib/identity-context'
import { CallbackHandler } from '../components/CallbackHandler'
import { trackPageview } from '../lib/track'
import '../styles.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'LOD — Liberation or Death' },
      {
        name: 'description',
        content:
          'LOD — Liberation or Death. A movement for a green future, animal liberation, and radical climate action.',
      },
      // Social share preview (Open Graph) — shown when the link is posted on TikTok, etc.
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: 'LOD — Liberation or Death' },
      {
        property: 'og:description',
        content:
          'A movement for those who refuse to accept the destruction of our planet. Green future, animal liberation, radical climate action.',
      },
      {
        property: 'og:image',
        content: 'https://liberationordeath.net/og-image.png',
      },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: 'LOD — Liberation or Death' },
      { property: 'og:url', content: 'https://liberationordeath.net/' },
      { property: 'og:site_name', content: 'LOD — Liberation or Death' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'theme-color', content: '#0a0a0a' },
      { name: 'twitter:title', content: 'LOD — Liberation or Death' },
      {
        name: 'twitter:description',
        content:
          'A movement for those who refuse to accept the destruction of our planet. Green future, animal liberation, radical climate action.',
      },
      {
        name: 'twitter:image',
        content: 'https://liberationordeath.net/og-image.png',
      },
    ],
    links: [
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <IdentityProvider>
          <CallbackHandler>{children}</CallbackHandler>
          <PageviewTracker />
          {/* Shared SVG filter for the rough, printed-poster headline texture. */}
          <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
            <filter id="lod-rough" x="-2%" y="-5%" width="104%" height="110%">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.2" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </svg>
        </IdentityProvider>
        <Scripts />
      </body>
    </html>
  )
}

// Counts one page view per route change for the visitor stats on /stats.
function PageviewTracker() {
  const path = useRouterState({ select: s => s.location.pathname })
  useEffect(() => {
    if (path !== '/stats') trackPageview(path)
  }, [path])
  return null
}
