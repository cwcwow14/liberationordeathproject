// Membership tiers — shared by the pricing page, the members area and the server.
//
// Prices shown here are display copy only; what a member is actually charged is set
// on the matching variant in the Lemon Squeezy dashboard. Keep the two in step.
// Each tier's Lemon Squeezy variant ID is read from an env var on the server
// (see variantIdForTier in src/server/membership.ts).

export type TierId = 'supporter' | 'activist' | 'inner_circle'

export type Tier = {
  id: TierId
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
      'Full newsletter archive in the members area',
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

const RANK: Record<TierId, number> = { supporter: 1, activist: 2, inner_circle: 3 }

export function isTierId(v: unknown): v is TierId {
  return v === 'supporter' || v === 'activist' || v === 'inner_circle'
}

export function tierRank(t: TierId): number {
  return RANK[t]
}

export function tierName(t: TierId): string {
  return TIERS.find(x => x.id === t)?.name ?? t
}

// Lemon Squeezy subscription statuses that still grant access. `cancelled` is
// handled separately: access continues until `ends_at` (the paid-up period).
const LIVE_STATUSES = new Set(['active', 'on_trial', 'past_due'])

export function statusGrantsAccess(status: string, endsAt: Date | string | null): boolean {
  if (LIVE_STATUSES.has(status)) return true
  if (status === 'cancelled' && endsAt) return new Date(endsAt).getTime() > Date.now()
  return false
}
