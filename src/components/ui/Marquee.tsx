import { cn } from '@/lib/cn'

type MarqueeProps = {
  items: string[]
  className?: string
}

/** Infinite ticker band. Content is duplicated once so the loop is seamless. */
export function Marquee({ items, className }: MarqueeProps) {
  const sequence = [...items, ...items]
  return (
    <div className={cn('overflow-hidden', className)}>
      <p className="sr-only">{items.join('. ')}</p>
      <div className="marquee-track flex w-max" aria-hidden="true">
        {sequence.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="flex items-center gap-6 pr-6 font-display text-[clamp(1.5rem,3vw,2.5rem)] uppercase leading-none"
          >
            {item}
            <span className="inline-block size-2.5 rotate-45 bg-current" />
          </span>
        ))}
      </div>
    </div>
  )
}
