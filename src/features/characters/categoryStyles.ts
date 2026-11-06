import type { CharacterCategory } from '@/types/character'

/** Badge label and colours per classification. */
export const categoryStyles: Record<CharacterCategory, { label: string; className: string }> = {
  hero: { label: 'Hero', className: 'border-bone/60 text-bone' },
  villain: { label: 'Villain', className: 'border-red bg-red text-white' },
  antihero: { label: 'Antihero', className: 'border-gold text-gold' },
}
