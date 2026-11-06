import { creator, creatorEmail } from '@/config/creator'
import { cn } from '@/lib/cn'

const linkClass = 'underline decoration-red decoration-2 underline-offset-4 transition-colors hover:text-red-bright'

/** "Open to freelance work" pill with a softly pulsing dot. */
export function AvailabilityBadge({ className }: { className?: string }) {
  if (!creator.openToWork) return null
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 font-mono text-[0.68rem] tracking-[0.12em] text-emerald-300 uppercase',
        className,
      )}
    >
      <span aria-hidden="true" className="relative flex size-2">
        <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-75 motion-safe:animate-ping" />
        <span className="relative size-2 rounded-full bg-emerald-400" />
      </span>
      Open to freelance work
    </span>
  )
}

/** Portfolio and email links. */
export function CreatorLinks({ className }: { className?: string }) {
  const email = creatorEmail()
  return (
    <span className={cn('flex flex-wrap items-center gap-x-4 gap-y-2', className)}>
      <a href={creator.portfolio} target="_blank" rel="noopener" className={linkClass}>
        Portfolio<span aria-hidden="true"> ↗</span>
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
      <a href={`mailto:${email}`} className={linkClass}>
        {email}
      </a>
    </span>
  )
}
