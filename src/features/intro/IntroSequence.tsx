import { useCallback, useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '@/motion/gsap'
import { useUiStore } from '@/stores/uiStore'
import { introFrames } from './introFrameList'
import { resetScrollForIntro } from './introSession'

/** Resolves once fonts and the page's initial resources are loaded (max 3s). */
function waitForQuietPage(): Promise<void> {
  const fonts = document.fonts?.ready ?? Promise.resolve()
  const loaded =
    document.readyState === 'complete'
      ? Promise.resolve()
      : new Promise<void>((resolve) => window.addEventListener('load', () => resolve(), { once: true }))
  const settled = Promise.all([fonts, loaded]).then(
    // Two frames so the first paint after loading is done before we start.
    () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
  )
  const timeout = new Promise<void>((resolve) => window.setTimeout(resolve, 3000))
  return Promise.race([settled, timeout])
}

const WORDS = ['Every', 'Universe', 'Every', 'Hero', 'Every', 'Possibility']

/** Font size that makes a word fill the frame width without overflowing. */
function wordSize(word: string): string {
  const fit = 92 / (word.length * 0.47)
  return `min(44vh, ${fit.toFixed(2)}vw)`
}

/**
 * Opening title sequence. Plays on every full load of the homepage., modelled on the reference video:
 * red words cut against dark frames, accelerating, then the last word
 * collapses into a red slit and the screen opens like doors onto the site.
 *
 * Photosensitivity: each word is one light/dark change, and words never come
 * faster than one per ~0.37s (< 3 flashes per second, WCAG 2.3.1).
 */
export function IntroSequence() {
  const active = useUiStore((s) => s.introPlaying)
  const setIntroPlaying = useUiStore((s) => s.setIntroPlaying)
  const root = useRef<HTMLDivElement>(null)
  const timeline = useRef<gsap.core.Timeline | null>(null)

  const finish = useCallback(() => {
    setIntroPlaying(false)
  }, [setIntroPlaying])

  useEffect(() => {
    if (!active) return
    resetScrollForIntro()
    document.documentElement.style.overflow = 'hidden'
    return () => {
      document.documentElement.style.overflow = ''
      // Layout can differ once scrolling is unlocked; re-measure every trigger.
      requestAnimationFrame(() => ScrollTrigger.refresh())
    }
  }, [active])

  const skip = useCallback(() => {
    const tl = timeline.current
    if (!tl) return finish()
    // Jump to the door reveal rather than cutting straight to the page.
    if (tl.time() < tl.labels.doors!) tl.seek('doors')
    tl.play()
  }, [finish])

  useEffect(() => {
    if (!active) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') skip()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active, skip])

  useGSAP(
    () => {
      if (!active) return
      const q = gsap.utils.selector(root)
      const words = q<HTMLElement>('[data-intro-word]')
      const frames = q<HTMLElement>('[data-intro-frame]')

      gsap.set([...words, ...frames], { autoAlpha: 0 })
      const tl = gsap.timeline({ paused: true, defaults: { duration: 0 }, onComplete: finish })
      timeline.current = tl

      let t = 0.45 // opening black
      let previous: HTMLElement | null = null
      const cut = (el: HTMLElement, hold: number) => {
        if (previous) tl.set(previous, { autoAlpha: 0 }, t)
        tl.set(el, { autoAlpha: 1 }, t)
        previous = el
        t += hold
      }

      words.forEach((word, i) => {
        const isLast = i === words.length - 1
        const slow = i < 2
        cut(word, isLast ? 0.6 : slow ? 0.32 : 0.23)
        const frame = frames[i % frames.length]
        if (!isLast && frame) cut(frame, slow ? 0.2 : 0.14)
      })

      // Slit: last word collapses to a hairline, which stretches across the screen.
      const last = words[words.length - 1]
      tl.addLabel('slit', t)
      tl.to(last ?? [], { scaleY: 0.01, duration: 0.42, ease: 'power4.in' }, 'slit')
      tl.fromTo(
        q('[data-intro-line]'),
        { scaleX: 0.25, autoAlpha: 0 },
        { scaleX: 1, autoAlpha: 1, duration: 0.35, ease: 'expo.out' },
        'slit+=0.38',
      )
      tl.set(last ?? [], { autoAlpha: 0 }, 'slit+=0.42')

      // Doors open onto the site.
      tl.addLabel('doors', 'slit+=0.8')
      tl.call(resetScrollForIntro, undefined, 'doors')
      tl.set(q('[data-intro-stage]'), { autoAlpha: 0 }, 'doors')
      tl.to(q('[data-intro-door="top"]'), { yPercent: -100, duration: 0.9, ease: 'power3.inOut' }, 'doors')
      tl.to(q('[data-intro-door="bottom"]'), { yPercent: 100, duration: 0.9, ease: 'power3.inOut' }, 'doors')
      tl.to(q('[data-intro-line]'), { autoAlpha: 0, duration: 0.3 }, 'doors+=0.1')
      tl.set(q('[data-intro-skip]'), { autoAlpha: 0 }, 'doors')

      // Hold on black until fonts and the first wave of scripts have loaded,
      // so no download or compile stalls land in the middle of the cuts.
      const state = { cancelled: false }
      waitForQuietPage().then(() => {
        if (state.cancelled) return
        resetScrollForIntro()
        tl.play()
      })
      return () => {
        state.cancelled = true
      }
    },
    { dependencies: [active], scope: root },
  )

  if (!active) return null

  return (
    <div ref={root} className="fixed inset-0 z-[80]" aria-label="Opening titles" role="dialog" aria-modal="true">
      <div data-intro-door="top" className="absolute inset-x-0 top-0 h-1/2 bg-black" />
      <div data-intro-door="bottom" className="absolute inset-x-0 bottom-0 h-1/2 bg-black" />

      <div data-intro-stage className="absolute inset-0 overflow-hidden" aria-hidden="true">
        {introFrames.map((Frame, i) => (
          <div key={i} data-intro-frame className="invisible absolute inset-0">
            <Frame />
          </div>
        ))}
        {WORDS.map((word, i) => (
          <div
            key={`${word}-${i}`}
            data-intro-word
            className="invisible absolute inset-0 flex items-center justify-center bg-black"
          >
            <span
              className="font-display leading-none text-red uppercase"
              style={{ fontSize: wordSize(word) }}
            >
              {word}
            </span>
          </div>
        ))}
      </div>

      <div
        data-intro-line
        aria-hidden="true"
        className="invisible absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 bg-red"
      />

      <p className="sr-only">Every universe. Every hero. Every possibility.</p>

      <button
        type="button"
        data-intro-skip
        onClick={skip}
        className="absolute right-5 bottom-5 z-10 rounded-full border border-bone/40 px-4 py-2.5 font-mono text-[0.7rem] tracking-[0.14em] text-bone/80 uppercase transition-colors hover:border-bone hover:text-bone sm:right-8 sm:bottom-8"
      >
        Skip intro
      </button>
    </div>
  )
}
