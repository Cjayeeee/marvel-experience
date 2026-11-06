import type { Crossing } from '@/types/character'

/**
 * Documented crossings between realities: stories in which characters
 * travelled from one universe to another. Each one is a published story or
 * released film; summaries are written for this archive.
 */
export const crossings: Crossing[] = [
  {
    id: 'spider-men',
    from: 'earth-616',
    to: 'earth-1610',
    event: 'Spider-Men',
    year: 2012,
    kind: 'comic',
    summary: 'Peter Parker is pulled into the Ultimate Universe and meets Miles Morales for the first time.',
  },
  {
    id: 'spider-verse-2014',
    from: 'earth-616',
    to: 'earth-65',
    event: 'Spider-Verse',
    year: 2014,
    kind: 'comic',
    summary: 'Spider-heroes from across the multiverse band together against the Inheritors, including Gwen Stacy of Earth-65.',
  },
  {
    id: 'spider-man-2099-present',
    from: 'earth-928',
    to: 'earth-616',
    event: 'Spider-Man 2099',
    year: 2014,
    kind: 'comic',
    summary: 'Miguel O’Hara is stranded in the present day of the main Marvel universe and has to protect his own future from there.',
  },
  {
    id: 'old-man-logan-616',
    from: 'earth-807128',
    to: 'earth-616',
    event: 'Old Man Logan',
    year: 2016,
    kind: 'comic',
    summary: 'After Secret Wars, the Wastelands’ Logan finds himself in the past of the main universe: a world where his worst night hasn’t happened yet.',
  },
  {
    id: 'into-the-spider-verse',
    from: 'earth-65',
    to: 'earth-1610',
    event: 'Spider-Man: Into the Spider-Verse',
    year: 2018,
    kind: 'film',
    summary: 'A collider rips open the multiverse and drops Gwen Stacy into Miles Morales’ New York.',
  },
  {
    id: 'across-the-spider-verse',
    from: 'earth-1610',
    to: 'earth-928',
    event: 'Spider-Man: Across the Spider-Verse',
    year: 2023,
    kind: 'film',
    summary: 'Miles follows Gwen to Miguel O’Hara’s Spider-Society headquarters on Earth-928.',
  },
  {
    id: 'no-way-home',
    from: 'earth-96283',
    to: 'earth-199999',
    event: 'Spider-Man: No Way Home',
    year: 2021,
    kind: 'film',
    summary: 'A botched spell draws Peter Parker and his villains from other realities into the Marvel Cinematic Universe.',
  },
  {
    id: 'multiverse-of-madness',
    from: 'earth-199999',
    to: 'earth-838',
    event: 'Doctor Strange in the Multiverse of Madness',
    year: 2022,
    kind: 'film',
    summary: 'Doctor Strange and America Chavez land on Earth-838 and face its Illuminati.',
  },
  {
    id: 'deadpool-and-wolverine',
    from: 'earth-10005',
    to: 'earth-199999',
    event: 'Deadpool & Wolverine',
    year: 2024,
    kind: 'film',
    summary: 'Deadpool is taken by the TVA and drawn into the Marvel Cinematic Universe’s multiversal problems.',
  },
]
