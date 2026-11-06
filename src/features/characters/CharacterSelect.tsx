import { useId } from 'react'
import { cn } from '@/lib/cn'
import type { Character, CharacterCategory } from '@/types/character'
import { characterLabel } from './characterLabel'

const GROUPS: { category: CharacterCategory; label: string }[] = [
  { category: 'hero', label: 'Heroes' },
  { category: 'antihero', label: 'Antiheroes' },
  { category: 'villain', label: 'Villains' },
]

type CharacterSelectProps = {
  label: string
  characters: Character[]
  value: string
  onChange: (slug: string) => void
  /** Hide the visible label (it's still read by screen readers). */
  hideLabel?: boolean
  placeholder?: string
  disabledSlugs?: ReadonlySet<string>
  className?: string
}

/** Native select grouped by category: keyboard, screen-reader and mobile friendly. */
export function CharacterSelect({
  label,
  characters,
  value,
  onChange,
  hideLabel = false,
  placeholder,
  disabledSlugs,
  className,
}: CharacterSelectProps) {
  const id = useId()
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={id} className={cn('font-mono text-[0.68rem] tracking-[0.14em] uppercase opacity-70', hideLabel && 'sr-only')}>
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-12 w-full appearance-none rounded-full border border-current/40 bg-transparent pr-9 pl-4 font-display text-sm tracking-[0.03em] uppercase sm:pr-10 sm:pl-5 sm:text-base hover:border-current focus-visible:border-current [&>optgroup]:bg-void [&>optgroup]:text-bone"
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {GROUPS.map((g) => (
            <optgroup key={g.category} label={g.label}>
              {characters
                .filter((c) => c.category === g.category)
                .map((c) => (
                  <option key={c.slug} value={c.slug} disabled={disabledSlugs?.has(c.slug)}>
                    {characterLabel(c)}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
        <span aria-hidden="true" className="pointer-events-none absolute top-1/2 right-5 -translate-y-1/2 text-xs">
          ▾
        </span>
      </div>
    </div>
  )
}
