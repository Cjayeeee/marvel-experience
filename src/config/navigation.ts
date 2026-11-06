export type NavItem = {
  label: string
  to: string
  /** File index shown in the mobile menu, e.g. "01". */
  index: string
  /** Shows a pulsing "live" dot next to the label. */
  live?: boolean
}

export const primaryNav: NavItem[] = [
  { label: 'Characters', to: '/characters', index: '01' },
  { label: 'Multiverse', to: '/multiverse', index: '02' },
  { label: 'Movies & Series', to: '/movies', index: '03' },
  { label: 'Timeline', to: '/timeline', index: '04' },
  { label: 'Team Builder', to: '/team-builder', index: '05' },
  { label: 'Arena', to: '/arena', index: '06' },
  { label: 'Doomsday', to: '/doomsday', index: '07', live: true },
]

export const footerNav: { heading: string; links: { label: string; to: string }[] }[] = [
  {
    heading: 'Explore',
    links: [
      { label: 'Characters', to: '/characters' },
      { label: 'Multiverse map', to: '/multiverse' },
      { label: 'Movies', to: '/movies' },
      { label: 'Series', to: '/series' },
      { label: 'Timeline', to: '/timeline' },
      { label: 'Doomsday countdown', to: '/doomsday' },
    ],
  },
  {
    heading: 'Play',
    links: [
      { label: 'Team Builder', to: '/team-builder' },
      { label: 'Battle Arena', to: '/arena' },
    ],
  },
  {
    heading: 'Yours',
    links: [{ label: 'My archive', to: '/me' }],
  },
]
