import type { Team } from '@/types/character'

export const teams: Team[] = [
  { slug: 'avengers', name: 'Avengers', line: "Earth's mightiest" },
  { slug: 'x-men', name: 'X-Men', line: 'Feared and hated' },
  { slug: 'fantastic-four', name: 'Fantastic Four', line: 'First family' },
  { slug: 'guardians-of-the-galaxy', name: 'Guardians of the Galaxy', line: 'Unlikely heroes' },
  { slug: 'defenders', name: 'Defenders', line: 'Street level' },
  { slug: 'thunderbolts', name: 'Thunderbolts', line: 'Second chances' },
]

export function teamBySlug(slug: string): Team | undefined {
  return teams.find((t) => t.slug === slug)
}
