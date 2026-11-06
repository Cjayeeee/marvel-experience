import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { cn } from '@/lib/cn'
import { useUiStore } from '@/stores/uiStore'
import { getRenderTier, type RenderTier } from './capability'
import { PortalFallback } from './fallback/PortalFallback'
import { CANVAS_SCALE } from './scenes/heroPortal/sceneConfig'

import earthTextureUrl from '@/assets/earth/earth-packed.webp'

// three.js + R3F load only here, only on capable devices.
const loadScene = () => import('./scenes/heroPortal/HeroPortalScene')
const HeroPortalScene = lazy(loadScene)

/**
 * Warm the 3D globe while the intro plays: download the Earth texture now
 * (network only, so the intro never stutters) and fetch the 3D code when the
 * browser is idle. When the intro ends, the scene mounts from cache.
 */
let warmed = false
function warmUp() {
  if (warmed || typeof document === 'undefined') return
  warmed = true
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'image'
  link.href = earthTextureUrl
  document.head.append(link)
  const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1200))
  idle(() => void loadScene(), { timeout: 2500 })
}

const overflow = `${((CANVAS_SCALE - 1) / 2) * -100}%`

type HeroPortalProps = {
  className?: string
}

/**
 * The hero sphere. Shows the static portal first; on capable devices the
 * WebGL portal loads in behind it and cross-fades in once its first frame is ready.
 */
export function HeroPortal({ className }: HeroPortalProps) {
  const wrapper = useRef<HTMLDivElement>(null)
  const [tier] = useState<RenderTier>(() => getRenderTier())
  const [ready, setReady] = useState(false)
  const [visible, setVisible] = useState(true)
  const [failed, setFailed] = useState(false)
  // Loading three.js and compiling shaders is heavy; never do it under the intro.
  const introPlaying = useUiStore((s) => s.introPlaying)

  // Stop rendering when the hero is off screen or the tab is hidden.
  useEffect(() => {
    const el = wrapper.current
    if (!el || tier === 'none') return
    const state = { inView: true }
    const update = () => setVisible(state.inView && document.visibilityState === 'visible')
    const observer = new IntersectionObserver(([entry]) => {
      state.inView = Boolean(entry?.isIntersecting)
      update()
    })
    observer.observe(el)
    document.addEventListener('visibilitychange', update)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', update)
    }
  }, [tier])

  const show3D = tier !== 'none' && !failed && !introPlaying

  useEffect(() => {
    if (tier !== 'none') warmUp()
  }, [tier])

  return (
    <div ref={wrapper} className={cn('relative aspect-square', className)}>
      <PortalFallback
        className={cn(
          'absolute inset-0 transition-opacity duration-700',
          show3D && ready ? 'opacity-0' : 'opacity-100',
        )}
      />
      {show3D ? (
        <div
          aria-hidden="true"
          className={cn('absolute transition-opacity duration-700', ready ? 'opacity-100' : 'opacity-0')}
          style={{ inset: overflow }}
        >
          <ErrorBoundary name="HeroPortal" fallback={<FailSignal onFail={() => setFailed(true)} />}>
            <Suspense fallback={null}>
              <HeroPortalScene tier={tier} active={visible} onReady={() => setReady(true)} />
            </Suspense>
          </ErrorBoundary>
        </div>
      ) : null}
    </div>
  )
}

/** Tells the parent the 3D layer failed so the static portal stays visible. */
function FailSignal({ onFail }: { onFail: () => void }) {
  useEffect(() => onFail(), [onFail])
  return null
}
