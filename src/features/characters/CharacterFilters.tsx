import type { ReactNode } from 'react'
import { Eyebrow } from '@/components/ui/Typography'
import { cn } from '@/lib/cn'
import type { CharacterFacets } from '@/services/characters.service'
import type { CharacterQuery } from '@/types/character'
import { characterFilters, filterLabels } from './useCharacterParams'

type CharacterFiltersProps = {
  query: CharacterQuery
  facets: CharacterFacets | undefined
  onChange: (patch: { filter?: string; team?: string; universe?: string }) => void
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-3">
        <Eyebrow as="span" className="text-mute">
          {title}
        </Eyebrow>
      </legend>
      {children}
    </fieldset>
  )
}

function Option({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean
  onClick: () => void
  label: string
  count?: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'group flex min-h-10 w-full items-center justify-between gap-3 border-l-2 py-1.5 pr-1 pl-3 text-left transition-colors',
        active ? 'border-red text-bone' : 'border-line text-bone/70 hover:border-bone hover:text-bone',
      )}
    >
      <span className={cn('font-display text-lg uppercase leading-none', active && 'text-red-bright')}>{label}</span>
      {count !== undefined ? <span className="font-mono text-[0.7rem] text-mute">{count}</span> : null}
    </button>
  )
}

/** Category / team / universe filters. Used in the desktop rail and the mobile sheet. */
export function CharacterFilters({ query, facets, onChange }: CharacterFiltersProps) {
  return (
    <div className="flex flex-col gap-9">
      <Group title="Classification">
        <div className="flex flex-wrap gap-2">
          {characterFilters.map((f) => {
            const active = (query.filter ?? 'all') === f
            return (
              <button
                key={f}
                type="button"
                onClick={() => onChange({ filter: f })}
                aria-pressed={active}
                className={cn(
                  'min-h-10 rounded-full border px-4 font-mono text-[0.72rem] tracking-[0.12em] uppercase transition-colors',
                  active ? 'border-red bg-red text-white' : 'border-line text-bone/80 hover:border-bone hover:text-bone',
                )}
              >
                {filterLabels[f]}
              </button>
            )
          })}
        </div>
      </Group>

      <Group title="Team">
        <div className="flex flex-col">
          <Option active={!query.team} onClick={() => onChange({ team: undefined })} label="Any team" />
          {facets?.teams.map((t) => (
            <Option
              key={t.slug}
              active={query.team === t.slug}
              onClick={() => onChange({ team: query.team === t.slug ? undefined : t.slug })}
              label={t.name}
              count={t.count}
            />
          ))}
        </div>
      </Group>

      <Group title="Universe">
        <div className="flex flex-col">
          <Option active={!query.universe} onClick={() => onChange({ universe: undefined })} label="Every reality" />
          {facets?.universes.map((u) => (
            <Option
              key={u.id}
              active={query.universe === u.id}
              onClick={() => onChange({ universe: query.universe === u.id ? undefined : u.id })}
              label={u.designation}
              count={u.count}
            />
          ))}
        </div>
      </Group>
    </div>
  )
}
