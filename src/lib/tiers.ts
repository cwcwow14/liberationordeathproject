// Membership tiers, as shown on the site. Memberships are sold and delivered on
// Patreon — the newsletter, exclusive posts/videos and early access all live there.
//
// Keep names, prices and perks in step with the tiers set up on Patreon.

// The LOD Patreon page. Every "join" button on the site links here.
export const PATREON_URL = 'https://www.patreon.com/cw/liberationordeath'

export type Tier = {
  id: 'supporter' | 'activist' | 'inner_circle'
  name: string
  price: string
  blurb: string
  perks: string[]
  featured?: boolean
}

export const TIERS: Tier[] = [
  {
    id: 'supporter',
    name: 'Supporter',
    price: '$3',
    blurb: 'Stay informed and keep the movement going.',
    perks: [
      'The LOD Dispatch — a bi-weekly newsletter',
      'The good news and the bad: what is happening on the page and around the world',
      'Full newsletter archive on Patreon',
    ],
  },
  {
    id: 'activist',
    name: 'Activist',
    price: '$8',
    blurb: 'Go deeper than what makes it onto TikTok.',
    perks: [
      'Everything in Supporter',
      'Exclusive members-only posts',
      'Exclusive videos — uncut footage and behind the scenes',
    ],
    featured: true,
  },
  {
    id: 'inner_circle',
    name: 'Inner Circle',
    price: '$20',
    blurb: 'First to see everything. The core of the movement.',
    perks: [
      'Everything in Activist',
      'Early access — new videos and posts before anyone else',
      'Newsletter delivered first',
    ],
  },
]
