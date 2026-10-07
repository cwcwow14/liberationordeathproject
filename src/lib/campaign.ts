// The campaign banner shown above the nav on every page. Point it at whatever
// matters this week — a new video, the map, a Patreon drop, an event.
//
//   enabled      false hides it everywhere
//   id           change this whenever the message changes, so people who closed
//                the old banner see the new one
//   text / cta / href   the message and its link (site paths like '/reach#add',
//                or full https:// links)
//   countdownTo  optional ISO date/time; shows a live "2d 4h 10m" countdown and
//                hides the banner once it has passed
export const CAMPAIGN: {
  enabled: boolean
  id: string
  text: string
  cta: string
  href: string
  countdownTo?: string
} = {
  enabled: true,
  id: 'map-launch-2026-10',
  text: 'New: the LOD map is live — stand up and be counted',
  cta: 'Add your city',
  href: '/reach#add',
}
