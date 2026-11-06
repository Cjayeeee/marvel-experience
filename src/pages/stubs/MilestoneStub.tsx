import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Eyebrow, SectionHeading } from '@/components/ui/Typography'

type MilestoneStubProps = {
  file: string
  lead: string
  accent: string
  milestone: number
  summary: string
  detail?: string
}

/**
 * Honest placeholder for routes that are built in later milestones.
 * Keeps every nav link working while the foundation is reviewed.
 */
export function MilestoneStub({ file, lead, accent, milestone, summary, detail }: MilestoneStubProps) {
  return (
    <>
    <title>{`${lead} ${accent} — Multiverse`}</title>
    <section className="paper-grain flex min-h-[88dvh] items-end bg-paper pt-32 pb-16 text-ink sm:pb-24">
      <Container className="flex flex-col gap-8">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/20 pb-4">
          <Eyebrow className="text-ink-mute">{file}</Eyebrow>
          <Eyebrow className="rounded-full border border-ink px-3 py-1.5">
            Under construction · Milestone {milestone}
          </Eyebrow>
        </div>
        <SectionHeading as="h1" size="giant" lead={lead} accent={accent} />
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex max-w-xl flex-col gap-3">
            <p className="text-lg leading-relaxed">{summary}</p>
            {detail ? (
              <p className="font-mono text-[0.8rem] tracking-[0.04em] text-ink-mute">{detail}</p>
            ) : null}
          </div>
          <ButtonLink to="/" variant="ink" size="lg">
            Back to the hub
          </ButtonLink>
        </div>
      </Container>
    </section>
    </>
  )
}
