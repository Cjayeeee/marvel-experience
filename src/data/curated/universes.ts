import type { Universe } from '@/types/character'

/**
 * Curated universe records. Designations follow Marvel's published
 * handbook numbering; descriptions are written for this archive.
 * `notable` lists a few key stories, not a complete bibliography.
 */
export const universes: Universe[] = [
  {
    id: 'earth-616',
    designation: 'Earth-616',
    name: 'Prime comics continuity',
    description: 'The main reality of Marvel Comics, where most stories since 1961 take place. Nearly every hero in the archive was born here.',
    medium: 'comics',
    notable: [
      { title: 'Fantastic Four #1', year: 1961, kind: 'comic' },
      { title: 'Amazing Fantasy #15', year: 1962, kind: 'comic' },
      { title: 'The Avengers #1', year: 1963, kind: 'comic' },
    ],
  },
  {
    id: 'earth-199999',
    designation: 'Earth-199999',
    name: 'Marvel Cinematic Universe',
    description: 'The handbook designation for the reality of the Marvel Studios films and series, beginning with Iron Man in 2008.',
    medium: 'screen',
    notable: [
      { title: 'Iron Man', year: 2008, kind: 'film' },
      { title: 'Avengers: Endgame', year: 2019, kind: 'film' },
      { title: 'Loki', year: 2021, kind: 'series' },
    ],
  },
  {
    id: 'earth-1610',
    designation: 'Earth-1610',
    name: 'Ultimate Universe',
    description: 'A modern re-imagining of Marvel’s heroes launched in 2000, and the original home of Miles Morales.',
    medium: 'both',
    notable: [
      { title: 'Ultimate Spider-Man #1', year: 2000, kind: 'comic' },
      { title: 'Ultimate Fallout #4', year: 2011, kind: 'comic' },
      { title: 'Spider-Man: Into the Spider-Verse', year: 2018, kind: 'film' },
    ],
  },
  {
    id: 'earth-838',
    designation: 'Earth-838',
    name: 'Reality of the Illuminati',
    description: 'The reality visited in Doctor Strange in the Multiverse of Madness, guarded by its own council of heroes, the Illuminati.',
    medium: 'screen',
    notable: [{ title: 'Doctor Strange in the Multiverse of Madness', year: 2022, kind: 'film' }],
  },
  {
    id: 'earth-65',
    designation: 'Earth-65',
    name: 'Gwen Stacy’s reality',
    description: 'A world where Gwen Stacy, not Peter Parker, was bitten by the radioactive spider.',
    medium: 'both',
    notable: [
      { title: 'Edge of Spider-Verse #2', year: 2014, kind: 'comic' },
      { title: 'Spider-Man: Across the Spider-Verse', year: 2023, kind: 'film' },
    ],
  },
  {
    id: 'earth-928',
    designation: 'Earth-928',
    name: 'The year 2099',
    description: 'A corporate-ruled future New York, protected by Miguel O’Hara.',
    medium: 'both',
    notable: [
      { title: 'Spider-Man 2099 #1', year: 1992, kind: 'comic' },
      { title: 'Spider-Man: Across the Spider-Verse', year: 2023, kind: 'film' },
    ],
  },
  {
    id: 'earth-807128',
    designation: 'Earth-807128',
    name: 'The Wastelands',
    description: 'A future where the villains won, and an aging Logan put down his claws.',
    medium: 'comics',
    notable: [{ title: 'Wolverine #66 (“Old Man Logan”)', year: 2008, kind: 'comic' }],
  },
  {
    id: 'earth-10005',
    designation: 'Earth-10005',
    name: 'Fox X-Men films',
    description: 'The reality of 20th Century Fox’s X-Men films, home to Hugh Jackman’s Wolverine and Ryan Reynolds’ Deadpool.',
    medium: 'screen',
    notable: [
      { title: 'X-Men', year: 2000, kind: 'film' },
      { title: 'Logan', year: 2017, kind: 'film' },
      { title: 'Deadpool', year: 2016, kind: 'film' },
    ],
  },
  {
    id: 'earth-96283',
    designation: 'Earth-96283',
    name: 'Raimi Spider-Man films',
    description: 'The reality of Sam Raimi’s Spider-Man trilogy, with Tobey Maguire as Peter Parker.',
    medium: 'screen',
    notable: [
      { title: 'Spider-Man', year: 2002, kind: 'film' },
      { title: 'Spider-Man 2', year: 2004, kind: 'film' },
    ],
  },
]

export function universeById(id: string): Universe | undefined {
  return universes.find((u) => u.id === id)
}
