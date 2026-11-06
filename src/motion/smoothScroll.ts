import Lenis from 'lenis'
import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { useUiStore } from '@/stores/uiStore'
import { gsap, ScrollTrigger } from './gsap'
import { getLenis, setLenis } from './lenisInstance'
import { prefersReducedMotion } from './tokens'


/**
 * Smooth scrolling driven by GSAP's ticker, so ScrollTrigger and Lenis share
 * one clock. Skipped entirely for reduced-motion users.
 * Pauses while the mobile menu or the intro holds the screen.
 */
export function useSmoothScroll() {
  const { pathname } = useLocation()
  const locked = useUiStore((s) => s.menuOpen || s.introPlaying)

  useEffect(() => {
    if (prefersReducedMotion()) return

    const instance = new Lenis({ autoRaf: false, lerp: 0.1, anchors: true })
    setLenis(instance)
    instance.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => instance.raf(time * 1000)
    gsap.ticker.add(tick)

    return () => {
      gsap.ticker.remove(tick)
      instance.destroy()
      setLenis(null)
    }
  }, [])

  useEffect(() => {
    const lenis = getLenis()
    if (!lenis) return
    if (locked) lenis.stop()
    else lenis.start()
  }, [locked])

  // New page: jump to top and let triggers re-measure the new layout.
  useEffect(() => {
    getLenis()?.scrollTo(0, { immediate: true, force: true })
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 120)
    return () => window.clearTimeout(id)
  }, [pathname])
}
