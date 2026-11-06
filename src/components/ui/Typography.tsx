import type { ElementType, HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type EyebrowProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode
  as?: ElementType
}

/** Mono "file label" used for metadata: FILE 0616-A · CLEARANCE 7 */
export function Eyebrow({ children, className, as: Tag = 'p', ...rest }: EyebrowProps) {
  return (
    <Tag
      className={cn(
        'font-mono text-[0.72rem] uppercase leading-snug tracking-[0.14em]',
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  )
}

type SectionHeadingProps = Omit<HTMLAttributes<HTMLHeadingElement>, 'children'> & {
  /** First line, in the surface's text colour. */
  lead: ReactNode
  /** Second line, in the accent colour (Orbita's "MAIN EVENTS / IN ORBIT"). */
  accent?: ReactNode
  as?: 'h1' | 'h2' | 'h3'
  size?: 'big' | 'huge' | 'giant'
}

const headingSizes = {
  big: 'text-big',
  huge: 'text-huge',
  giant: 'text-giant',
} as const

/** Two-line display heading. Lines rise into place on scroll (see useReveals). */
export function SectionHeading({
  lead,
  accent,
  as: Tag = 'h2',
  size = 'huge',
  className,
  ...rest
}: SectionHeadingProps) {
  return (
    <Tag
      data-reveal="heading"
      className={cn('font-display uppercase', headingSizes[size], className)}
      {...rest}
    >
      <span className="block">{lead}</span>
      {accent ? <span className="block text-red">{accent}</span> : null}
    </Tag>
  )
}
