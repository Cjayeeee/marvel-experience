import { useEffect, useRef } from 'react'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Eyebrow } from '@/components/ui/Typography'
import { gsap, SplitText, useGSAP } from '@/motion/gsap'
import { useUiStore } from '@/stores/uiStore'
import { HeroPortal } from '@/three/HeroPortal'
import { heroProgress } from '@/three/scenes/heroPortal/heroProgress'
import earthHorizon from '@/assets/earth/earth-horizon.webp'
import { OrbitRing } from '../components/OrbitRing'

const ringText = 'HEROES · VILLAINS · REALITIES · VARIANTS ·'

/**
 * Paper hero: giant wordmark with the portal sphere in front of it and a ring
 * of words wrapped around it. On scroll the hero pins, the camera dives into
 * the portal and the void spreads out from its core into the next section.
 */
export function HeroSection() {
  const root = useRef<HTMLElement>(null)
  const introPlaying = useUiStore((s) => s.introPlaying)
  const entrance = useRef<gsap.core.Timeline | null>(null)

  // Entrance: built (and its start state applied) immediately so nothing
  // flashes behind the intro; it plays once the intro's doors open.
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const q = gsap.utils.selector(root)
        const title = q('[data-hero-title]')[0]
        const split = title ? SplitText.create(title, { type: 'chars', mask: 'chars' }) : null
        const tl = gsap.timeline({ paused: true, delay: 0.15 })
        if (split) tl.from(split.chars, { yPercent: 110, duration: 1.3, stagger: 0.045, immediateRender: true }, 0)
        tl.from(q('[data-hero-portal-inner]'), { scale: 0.55, autoAlpha: 0, duration: 1.6, immediateRender: true }, 0.25)
        tl.from(q('[data-hero-ring] > svg'), { autoAlpha: 0, scale: 0.8, duration: 1.4, immediateRender: true }, 0.6)
        tl.from(q('[data-hero-fade]'), { y: 24, autoAlpha: 0, duration: 1, stagger: 0.1, immediateRender: true }, 0.7)
        entrance.current = tl
        return () => {
          entrance.current = null
          split?.revert()
        }
      })
    },
    { scope: root },
  )

  useEffect(() => {
    if (!introPlaying) entrance.current?.play()
  }, [introPlaying])

  // Words drift slowly around the orbit. Both halves share the same path and
  // offset, so text flows from the far side to the near side without a seam.
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const paths = gsap.utils.toArray<SVGTextPathElement>('[data-orbit-text]', root.current)
        const first = paths[0]
        if (!first) return
        let tween: gsap.core.Tween | undefined
        const start = () => {
          const repeats = Number(first.dataset.repeats) || 1
          // One copy of the phrase, in path units; shifting by exactly this loops seamlessly.
          const period = first.getComputedTextLength() / repeats
          if (!period) return
          tween?.kill()
          tween = gsap.fromTo(
            paths,
            { attr: { startOffset: 0 } },
            { attr: { startOffset: -period }, duration: 48, ease: 'none', repeat: -1 },
          )
        }
        // Measure once the display font has loaded.
        void document.fonts.ready.then(start)
        return () => tween?.kill()
      })
    },
    { scope: root },
  )

  // Scroll dive into the portal.
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const section = root.current
        const q = gsap.utils.selector(root)
        const portal = q('[data-hero-portal]')[0]
        const earth = q('[data-hero-earth]')[0] as HTMLImageElement | undefined
        if (!section || !portal) return

        const center = () => {
          const s = section.getBoundingClientRect()
          const p = portal.getBoundingClientRect()
          return { x: p.left - s.left + p.width / 2, y: p.top - s.top + p.height / 2 }
        }
        const radius = () => Math.hypot(section.offsetWidth, section.offsetHeight)

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: '+=110%',
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              heroProgress.value = self.progress
              // The horizon image (~500 KB) is only seen at the end of the dive: fetch it once the dive starts.
              if (self.progress > 0.15 && earth && !earth.getAttribute('src')) earth.setAttribute('src', earthHorizon)
            },
          },
        })

        // Entrance animates inner elements; the dive animates their wrappers,
        // so the two never fight over the same properties.
        tl.fromTo(q('[data-hero-chrome]'), { y: 0, autoAlpha: 1 }, { y: -40, autoAlpha: 0, duration: 0.25 }, 0)
          .fromTo(q('[data-hero-ring]'), { autoAlpha: 1, scale: 1 }, { autoAlpha: 0, scale: 1.25, duration: 0.3 }, 0)
          .fromTo(q('[data-hero-title]'), { scale: 1, autoAlpha: 1 }, { scale: 1.3, autoAlpha: 0, duration: 0.45 }, 0)
          .fromTo(portal, { scale: 1 }, { scale: 3.4, duration: 1, ease: 'power2.in' }, 0)
          .fromTo(
            q('[data-hero-void]'),
            { clipPath: () => `circle(0px at ${center().x}px ${center().y}px)` },
            { clipPath: () => `circle(${radius()}px at ${center().x}px ${center().y}px)`, duration: 0.6, ease: 'power2.in' },
            0.4,
          )
          .fromTo(
            q('[data-hero-earth]'),
            { yPercent: 22, scale: 1.12, autoAlpha: 0 },
            { yPercent: 0, scale: 1, autoAlpha: 0.3, duration: 0.3, ease: 'power2.out' },
            0.7,
          )
          .from(q('[data-hero-arrival] > *'), { y: 30, autoAlpha: 0, duration: 0.15, stagger: 0.04, ease: 'power2.out' }, 0.85)
        return () => {
          heroProgress.value = 0
        }
      })
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      aria-labelledby="hero-title"
      className="paper-grain relative overflow-hidden bg-paper text-ink"
    >
      <Container className="relative flex min-h-[100svh] flex-col pt-24 pb-10 lg:pt-28">
        {/* Corner notes */}
        <div data-hero-chrome className="flex items-start justify-between gap-6">
          <Eyebrow data-hero-fade className="max-w-[16rem] text-ink-mute">
            Every universe.
            <br />
            Every hero.
            <br />
            Every possibility.
          </Eyebrow>
          <Eyebrow data-hero-fade className="hidden text-right text-ink-mute sm:block">
            File 0000 · Open archive
            <br />
            Unofficial fan project
          </Eyebrow>
        </div>

        {/* Wordmark + portal */}
        <div className="relative my-auto flex items-center justify-center py-10">
          <h1
            id="hero-title"
            data-hero-title
            className="relative z-0 text-center font-display text-mega tracking-[-0.01em] whitespace-nowrap select-none"
          >
            <span className="sr-only">Marvel: </span>MULTIVERSE
          </h1>

          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="relative w-[min(68vw,32rem)] translate-y-[12%]">
              <div data-hero-ring className="absolute inset-0">
                <OrbitRing
                  half="back"
                  text={ringText}
                  className="absolute top-1/2 left-1/2 w-[175%] -translate-x-1/2 -translate-y-1/2 -rotate-[9deg] text-red"
                />
              </div>
              <div data-hero-portal className="relative">
                <div data-hero-portal-inner>
                  <HeroPortal className="w-full" />
                </div>
              </div>
              <div data-hero-ring className="absolute inset-0">
                <OrbitRing
                  half="front"
                  text={ringText}
                  className="absolute top-1/2 left-1/2 w-[175%] -translate-x-1/2 -translate-y-1/2 -rotate-[9deg] text-red"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Supporting copy + CTAs */}
        <div data-hero-chrome className="relative z-20 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <p data-hero-fade className="max-w-xs text-[1.05rem] leading-snug">
            Explore the infinite realities of the Marvel Multiverse.
          </p>
          <div data-hero-fade className="flex flex-wrap gap-3">
            <ButtonLink to="/multiverse" size="lg">
              Enter the Multiverse
            </ButtonLink>
            <ButtonLink
              to="/characters"
              size="lg"
              variant="ghost"
              className="hover:border-ink hover:bg-ink hover:text-paper"
            >
              Explore characters
            </ButtonLink>
          </div>
        </div>
      </Container>

      {/* Horizon: paper curves into the void (shown when the dive is off) */}
      <div aria-hidden="true" className="relative h-[clamp(3rem,9vw,8rem)] overflow-hidden">
        <div className="absolute top-0 left-1/2 h-[1200%] w-[170%] -translate-x-1/2 rounded-[50%] bg-void" />
      </div>

      {/* The void spreading out of the portal during the dive */}
      <div
        data-hero-void
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-void text-bone"
        style={{ clipPath: 'circle(0px at 50% 50%)' }}
      >
        {/* Earth-616 rising behind the title card: a pre-rendered halftone horizon */}
        <img
          data-hero-earth
          alt=""
          width={2000}
          height={1000}
          decoding="async"
          fetchPriority="low"
          className="invisible absolute bottom-0 left-1/2 w-[min(160svh,230vw)] max-w-none -translate-x-1/2 origin-bottom select-none"
        />

        {/* Title card at the bottom of the dive */}
        <div
          data-hero-arrival
          className="relative isolate flex flex-col items-center gap-4 px-5 text-center before:absolute before:-inset-x-16 before:-inset-y-14 before:-z-10 before:bg-[radial-gradient(closest-side,var(--color-void)_45%,transparent)]"
        >
          <Eyebrow className="text-mute">Crossing complete · Now entering</Eyebrow>
          <p className="font-display text-giant uppercase">Earth-616</p>
          <Eyebrow className="text-red-bright">Scroll to explore the archive</Eyebrow>
        </div>
      </div>
    </section>
  )
}
