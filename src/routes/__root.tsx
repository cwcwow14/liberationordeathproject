import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { IdentityProvider } from '../lib/identity-context'
import { CallbackHandler } from '../components/CallbackHandler'
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
        content: 'https://liberationordeathproject.netlify.app/lod-logo.jpg',
      },
      { property: 'og:url', content: 'https://liberationordeathproject.netlify.app/' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'LOD — Liberation or Death' },
      {
        name: 'twitter:description',
        content:
          'A movement for those who refuse to accept the destruction of our planet. Green future, animal liberation, radical climate action.',
      },
      {
        name: 'twitter:image',
        content: 'https://liberationordeathproject.netlify.app/lod-logo.jpg',
      },
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
        </IdentityProvider>
        <Scripts />
      </body>
    </html>
  )
}
