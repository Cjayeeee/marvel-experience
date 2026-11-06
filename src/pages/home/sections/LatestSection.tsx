import { Container } from '@/components/ui/Container'
import { Eyebrow, SectionHeading } from '@/components/ui/Typography'
import { useLatestTitles } from '@/features/titles/queries'
import { TitleCard } from '@/features/titles/TitleCard'

/** The four most recent releases in the catalogue, with OMDb posters. */
export function LatestSection() {
  const { data: latest = [] } = useLatestTitles(4)

  return (
    <section aria-labelledby="latest-heading" className="paper-grain bg-paper-dim py-24 text-ink sm:py-32">
      <Container className="flex flex-col gap-12">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading id="latest-heading" lead="Latest" accent="From the multiverse" />
          <Eyebrow className="rounded-full border border-ink px-3 py-1.5">Most recent releases</Eyebrow>
        </div>

        <ul data-reveal="stagger" className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {latest.map((t) => (
            <li key={t.id}>
              <TitleCard title={t} tone="paper" />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
