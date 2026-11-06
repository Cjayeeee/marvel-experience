import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Eyebrow, SectionHeading } from '@/components/ui/Typography'
import { universeById } from '@/data/curated/universes'
import { CharacterArt } from '@/features/characters/CharacterArt'
import { CharacterSelect } from '@/features/characters/CharacterSelect'
import { categoryStyles } from '@/features/characters/categoryStyles'
import { useAllCharacters } from '@/features/characters/queries'
import { cn } from '@/lib/cn'
import {
  attributeLabels,
  compareRatings,
  getRatings,
  RATING_MAX,
  RATINGS_NOTE,
  ratingTotal,
} from '@/services/ratings.service'
import { POWER_ATTRIBUTES, type Character } from '@/types/character'

const DEFAULT_A = 'captain-america'
const DEFAULT_B = 'iron-man'

/** /arena: two characters, six editorial ratings, side by side. ?a=slug&b=slug */
export function ArenaPage() {
  const [params, setParams] = useSearchParams()
  const { data: all = [] } = useAllCharacters()
  const [copied, setCopied] = useState(false)

  const bySlug = (slug: string | null) => all.find((c) => c.slug === slug)
  const a = bySlug(params.get('a')) ?? bySlug(DEFAULT_A)
  const b = bySlug(params.get('b')) ?? bySlug(DEFAULT_B)

  const set = (next: { a?: string; b?: string }) => {
    setCopied(false)
    setParams({ a: next.a ?? a?.slug ?? DEFAULT_A, b: next.b ?? b?.slug ?? DEFAULT_B }, { replace: true, preventScrollReset: true })
  }

  const random = () => {
    if (all.length < 2) return
    const i = Math.floor(Math.random() * all.length)
    let j = Math.floor(Math.random() * (all.length - 1))
    if (j >= i) j += 1
    set({ a: all[i]!.slug, b: all[j]!.slug })
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="bg-void text-bone">
      <title>{a && b ? `${a.name} vs ${b.name}: Arena | Multiverse` : 'Arena | Multiverse'}</title>

      <section className="paper-grain bg-paper pt-28 pb-12 text-ink sm:pt-36 sm:pb-16">
        <Container className="flex flex-col gap-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/20 pb-4">
            <Eyebrow className="text-ink-mute">Simulation · Combat assessment</Eyebrow>
            <Eyebrow className="text-ink-mute">Editorial estimates · Not official</Eyebrow>
          </div>
          <SectionHeading as="h1" size="giant" lead="Battle" accent="Arena" />
          <p className="max-w-2xl text-lg leading-relaxed text-ink-mute">
            Pick any two characters and compare them across six attributes. It’s a tale of the tape, not a fight
            result: who’d actually win depends on the writer.
          </p>
        </Container>
      </section>

      {a && b ? (
        <>
          <section aria-label="Matchup" className="border-b border-line py-12 sm:py-16">
            <Container className="flex flex-col gap-10">
              <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-3 sm:gap-8">
                <Fighter character={a} side="a" all={all} onPick={(slug) => set({ a: slug })} />
                <div className="flex flex-col items-center gap-2 self-center pt-10">
                  <span className="font-display text-[clamp(2.5rem,8vw,6rem)] leading-none text-red">VS</span>
                </div>
                <Fighter character={b} side="b" all={all} onPick={(slug) => set({ b: slug })} />
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button variant="ghost" onClick={() => set({ a: b.slug, b: a.slug })}>
                  ⇄ Swap sides
                </Button>
                <Button onClick={random}>Random matchup</Button>
                <Button variant="ghost" onClick={() => void copyLink()}>
                  {copied ? 'Link copied' : 'Copy link'}
                </Button>
              </div>
            </Container>
          </section>

          <TaleOfTheTape a={a} b={b} />
        </>
      ) : (
        <Container className="min-h-[100svh] py-24">
          <p className="text-mute">Loading the roster…</p>
        </Container>
      )}
    </div>
  )
}

function Fighter({
  character,
  side,
  all,
  onPick,
}: {
  character: Character
  side: 'a' | 'b'
  all: Character[]
  onPick: (slug: string) => void
}) {
  const universe = universeById(character.universe)
  const category = categoryStyles[character.category]
  return (
    <div className={cn('flex min-w-0 flex-col gap-4', side === 'b' && 'sm:items-end sm:text-right')}>
      <CharacterSelect
        label={side === 'a' ? 'Left corner' : 'Right corner'}
        characters={all}
        value={character.slug}
        onChange={onPick}
        className="w-full sm:max-w-sm"
      />
      <Link
        to={`/characters/${character.slug}`}
        className={cn(
          'group relative block w-full overflow-hidden border-2 sm:max-w-sm',
          side === 'a' ? 'border-red' : 'border-bone',
        )}
      >
        <CharacterArt
          key={character.slug}
          character={character}
          decorative
          priority
          sizes="(min-width: 640px) 384px, 45vw"
          className="aspect-[4/5] w-full motion-safe:animate-[card-in_0.6s_var(--ease-cinematic)_both]"
        />
        <span
          className={cn(
            'absolute top-3 rounded-full border px-2 py-0.5 font-mono text-[0.6rem] tracking-[0.12em] uppercase',
            side === 'a' ? 'left-3' : 'right-3',
            category.className,
          )}
        >
          {category.label}
        </span>
      </Link>
      <div className="flex min-w-0 flex-col gap-1">
        <h2 className="font-display text-[clamp(1.4rem,4vw,3rem)] uppercase leading-[0.95] [overflow-wrap:anywhere]">
          {character.name}
        </h2>
        <Eyebrow className="text-mute">
          {universe?.designation}
          {character.alias ? ` · ${character.alias}` : ''}
        </Eyebrow>
      </div>
    </div>
  )
}

function TaleOfTheTape({ a, b }: { a: Character; b: Character }) {
  const ra = getRatings(a.slug)
  const rb = getRatings(b.slug)
  if (!ra || !rb) return null

  const edges = compareRatings(ra, rb)
  const leadA = POWER_ATTRIBUTES.filter((k) => edges[k] === 'a').length
  const leadB = POWER_ATTRIBUTES.filter((k) => edges[k] === 'b').length
  const even = POWER_ATTRIBUTES.length - leadA - leadB
  const totalA = ratingTotal(ra)
  const totalB = ratingTotal(rb)
  const mirror = a.slug === b.slug

  const summary = mirror
    ? 'A mirror match. Every attribute is even.'
    : leadA === leadB
      ? `Dead level on paper: ${leadA} attributes each${even ? `, ${even} even` : ''}.`
      : `On paper, ${leadA > leadB ? a.name : b.name} leads in ${Math.max(leadA, leadB)} of 6${
          Math.min(leadA, leadB) ? `, ${leadA > leadB ? b.name : a.name} in ${Math.min(leadA, leadB)}` : ''
        }${even ? `, ${even} even` : ''}.`

  return (
    <section aria-labelledby="tape-heading" className="py-14 sm:py-20">
      <Container className="flex flex-col gap-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading id="tape-heading" lead="Tale of" accent="The tape" size="big" />
          <p role="status" aria-live="polite" className="max-w-md text-lg leading-snug">
            {summary}
          </p>
        </div>

        <table className="w-full table-fixed border-collapse">
          <caption className="sr-only">
            {a.name} compared with {b.name}, editorial ratings out of {RATING_MAX}
          </caption>
          <thead className="sr-only">
            <tr>
              <th scope="col">{a.name}</th>
              <th scope="col">Attribute</th>
              <th scope="col">{b.name}</th>
            </tr>
          </thead>
          <tbody>
            {POWER_ATTRIBUTES.map((k) => (
              <tr key={k} className="border-t border-line">
                <Bar value={ra[k]} side="a" lead={edges[k] === 'a'} />
                <th scope="row" className="w-28 px-2 py-4 text-center align-middle sm:w-44">
                  <span className="block font-display text-lg uppercase sm:text-2xl">{attributeLabels[k].label}</span>
                  <span className="hidden font-mono text-[0.6rem] tracking-[0.1em] text-mute uppercase sm:block">
                    {attributeLabels[k].hint}
                  </span>
                </th>
                <Bar value={rb[k]} side="b" lead={edges[k] === 'b'} />
              </tr>
            ))}
            <tr className="border-t-2 border-bone">
              <td className="py-5 text-left font-display text-4xl leading-none sm:text-5xl">
                {totalA}
                <span className="text-lg text-mute">/{RATING_MAX * 6}</span>
              </td>
              <th scope="row" className="py-5 text-center font-mono text-[0.7rem] tracking-[0.14em] text-mute uppercase">
                Total
              </th>
              <td className="py-5 text-right font-display text-4xl leading-none sm:text-5xl">
                {totalB}
                <span className="text-lg text-mute">/{RATING_MAX * 6}</span>
              </td>
            </tr>
          </tbody>
        </table>

        <Eyebrow className="border-t border-line pt-6 text-mute">{RATINGS_NOTE}</Eyebrow>
      </Container>
    </section>
  )
}

function Bar({ value, side, lead }: { value: number; side: 'a' | 'b'; lead: boolean }) {
  const pct = (value / RATING_MAX) * 100
  return (
    <td className="py-4 align-middle">
      <div className={cn('flex items-center gap-3', side === 'a' && 'flex-row-reverse')}>
        <span className={cn('w-6 shrink-0 text-center font-display text-2xl leading-none', lead ? 'text-red-bright' : 'text-mute')}>
          {value}
        </span>
        <div className={cn('flex h-3 flex-1 bg-line sm:h-4', side === 'a' && 'justify-end')}>
          <div
            className={cn(
              'h-full transition-[width] duration-700 ease-(--ease-cinematic) motion-reduce:transition-none',
              lead ? 'bg-red' : 'bg-bone/50',
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </td>
  )
}
