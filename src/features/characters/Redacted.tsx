import { useRef, type ReactNode } from 'react'
import { gsap, SplitText, useGSAP } from '@/motion/gsap'

type RedactedProps = {
  children: ReactNode
  className?: string
}

/**
 * Paragraph that starts "redacted" — each line under an ink bar — and is
 * declassified line by line as it scrolls into view. Plain text for
 * reduced-motion users and without JavaScript.
 */
export function Redacted({ children, className }: RedactedProps) {
  const ref = useRef<HTMLParagraphElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const el = ref.current
        if (!el) return
        const split = SplitText.create(el, {
          type: 'lines',
          linesClass: 'redact-line',
          autoSplit: true,
          onSplit: (self) =>
            gsap.fromTo(
              self.lines,
              { backgroundSize: '100% 100%' },
              {
                backgroundSize: '0% 100%',
                duration: 0.9,
                ease: 'power3.inOut',
                stagger: 0.12,
                scrollTrigger: { trigger: el, start: 'top 80%', once: true },
              },
            ),
        })
        return () => split.revert()
      })
    },
    { scope: ref },
  )

  return (
    <p ref={ref} className={className}>
      {children}
    </p>
  )
}
