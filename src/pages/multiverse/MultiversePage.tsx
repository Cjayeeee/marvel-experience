import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { Container } from '@/components/ui/Container'
import { Eyebrow } from '@/components/ui/Typography'
import { BlueprintMap } from '@/features/multiverse/BlueprintMap'
import { mediumColor, mediumLabel } from '@/features/multiverse/layout'
import { useCrossings, useUniverseDetail, useUniverses } from '@/features/multiverse/queries'
import { UniversePanel } from '@/features/multiverse/UniversePanel'
import { cn } from '@/lib/cn'
import { prefersReducedMotion } from '@/motion/tokens'
import { getRenderTier, type RenderTier } from '@/three/capability'
import type { MultiverseCameraApi } from '@/three/scenes/multiverseMap/MultiverseScene'
import type { UniverseMedium } from '@/types/character'

const MultiverseScene = lazy(() => import('@/three/scenes/multiverseMap/MultiverseScene'))

const MEDIA: UniverseMedium[] = ['comics', 'screen', 'both']

/** /multiverse: navigable 3D map of realities (2D blueprint fallback). */
export function MultiversePage() {
  const [params, setParams] = useSearchParams()
  const selectedId = params.get('u')
  const universes = useUniverses()
  const crossings = useCrossings()
  const detail = useUniverseDetail(selectedId)

  const [tier] = useState<RenderTier>(() => getRenderTier())
  const [reducedMotion] = useState(() => prefersReducedMotion())
  const [failed, setFailed] = useState(false)
  const [ready, setReady] = useState(false)
  const use3D = tier !== 'none' && !failed

  const stage = useRef<HTMLDivElement>(null)
  const labelLayer = useRef<HTMLDivElement>(null)
  const cameraApi = useRef<MultiverseCameraApi | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const select = useCallback(
    (id: string | null) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (id) next.set('u', id)
          else next.delete('u')
          return next
        },
        { replace: true, preventScrollReset: true },
      )
    },
    [setParams],
  )

  // Render the 3D scene only while the stage is on screen and the tab is visible.
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const el = stage.current
    if (!el || !use3D) return
    const state = { inView: true }
    const update = () => setVisible(state.inView && document.visibilityState === 'visible')
    const io = new IntersectionObserver(([e]) => {
      state.inView = Boolean(e?.isIntersecting)
      update()
    })
    io.observe(el)
    document.addEventListener('visibilitychange', update)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', update)
    }
  }, [use3D])

  // On phones the panel sits below the map; bring it into view on selection.
  useEffect(() => {
    if (!selectedId || !panelRef.current) return
    if (window.matchMedia('(max-width: 1023px)').matches) {
      panelRef.current.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
    }
  }, [selectedId, reducedMotion])

  const list = universes.data ?? []
  const invalidSelection = Boolean(selectedId) && detail.isSuccess && detail.data === null

  return (
    <div className="bg-void text-bone">
      <title>{`${detail.data ? `${detail.data.universe.designation} · ` : ''}Multiverse Map | Multiverse`}</title>

      <section aria-labelledby="multiverse-title" className="relative lg:h-[100svh] lg:min-h-[44rem]">
        {/* Stage: 3D canvas or 2D blueprint */}
        <div
          ref={stage}
          className={cn(
            'relative h-[64svh] min-h-[26rem] w-full overflow-hidden lg:absolute lg:inset-0 lg:h-auto',
            !use3D && 'flex items-center justify-center px-5 pt-24 pb-6 lg:pr-[30rem] lg:pl-[22rem]',
          )}
          style={{
            background:
              'radial-gradient(ellipse at 50% 45%, rgba(91,63,214,0.16) 0%, rgba(18,16,17,0) 55%), var(--color-void)',
          }}
        >
          {use3D ? (
            <>
              <ErrorBoundary name="MultiverseScene" fallback={<FailSignal onFail={() => setFailed(true)} />}>
                <Suspense fallback={null}>
                  <MultiverseScene
                    tier={tier}
                    active={visible}
                    universes={list}
                    crossings={crossings.data ?? []}
                    selectedId={detail.data ? selectedId : null}
                    onSelect={select}
                    reducedMotion={reducedMotion}
                    labelLayer={labelLayer}
                    apiRef={cameraApi}
                    onReady={() => setReady(true)}
                  />
                </Suspense>
              </ErrorBoundary>

              {/* Labels that follow the 3D nodes (positioned every frame by the scene) */}
              <div ref={labelLayer} aria-hidden="true" className="pointer-events-none absolute inset-0">
                {list.map((u) => (
                  <div key={u.id} data-label-id={u.id} className="absolute top-0 left-0 transition-opacity duration-300 will-change-transform" style={{ opacity: 0 }}>
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => select(u.id)}
                      className={cn(
                        'pointer-events-auto -translate-x-1/2 translate-y-1 font-display text-sm whitespace-nowrap uppercase transition-colors sm:text-base',
                        u.id === selectedId ? 'text-bone' : 'text-bone/55 hover:text-bone',
                      )}
                    >
                      {u.designation}
                    </button>
                  </div>
                ))}
              </div>

              {!ready ? (
                <p role="status" className="absolute inset-0 flex items-center justify-center font-mono text-[0.75rem] tracking-[0.14em] text-mute uppercase">
                  Mapping known realities…
                </p>
              ) : null}

              {/* Camera controls */}
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 lg:bottom-8">
                <MapButton label="Zoom in" onClick={() => cameraApi.current?.zoomIn()}>
                  +
                </MapButton>
                <MapButton label="Zoom out" onClick={() => cameraApi.current?.zoomOut()}>
                  −
                </MapButton>
                <button
                  type="button"
                  onClick={() => (selectedId ? select(null) : cameraApi.current?.overview())}
                  className="h-11 rounded-full border border-line bg-void/80 px-4 font-mono text-[0.68rem] tracking-[0.12em] uppercase backdrop-blur hover:border-bone"
                >
                  Overview
                </button>
              </div>
              <p className="pointer-events-none absolute right-5 bottom-5 hidden font-mono text-[0.65rem] tracking-[0.12em] text-mute uppercase xl:block">
                Drag to orbit · Pinch or buttons to zoom
              </p>
            </>
          ) : (
            <BlueprintMap
              universes={list}
              crossings={crossings.data ?? []}
              selectedId={selectedId}
              onSelect={select}
              className="aspect-[4/3] w-full max-w-4xl"
            />
          )}
        </div>

        {/* Left column: title, legend, accessible list of realities */}
        <div className="pointer-events-none relative px-5 pt-8 sm:px-8 lg:absolute lg:top-0 lg:bottom-0 lg:left-0 lg:w-[21rem] lg:px-12 lg:pt-28">
          <div className="pointer-events-auto flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <Eyebrow className="text-mute">Cartography · {list.length} known realities</Eyebrow>
              <h1 id="multiverse-title" className="font-display text-[clamp(2.75rem,5vw,4.5rem)] uppercase leading-[0.88]">
                The
                <span className="block text-red">Multiverse</span>
              </h1>
            </div>

            <ul className="flex flex-wrap gap-x-4 gap-y-1" aria-label="Legend">
              {MEDIA.map((m) => (
                <li key={m} className="flex items-center gap-2 font-mono text-[0.65rem] tracking-[0.1em] text-mute uppercase">
                  <span aria-hidden="true" className="size-2 rounded-full" style={{ background: mediumColor[m] }} />
                  {mediumLabel[m]}
                </li>
              ))}
            </ul>

            <nav aria-label="Realities">
              <ul className="flex flex-col border-t border-line">
                {list.map((u) => {
                  const active = u.id === selectedId
                  return (
                    <li key={u.id} className="border-b border-line">
                      <button
                        type="button"
                        onClick={() => select(active ? null : u.id)}
                        aria-pressed={active}
                        className={cn(
                          'flex min-h-11 w-full items-center gap-3 py-2 text-left transition-colors',
                          active ? 'text-bone' : 'text-bone/65 hover:text-bone',
                        )}
                      >
                        <span aria-hidden="true" className="size-2 shrink-0 rounded-full" style={{ background: mediumColor[u.medium] }} />
                        <span className={cn('font-display text-lg uppercase leading-none', active && 'text-red-bright')}>
                          {u.designation}
                        </span>
                        <span className="ml-auto font-mono text-[0.65rem] text-mute">
                          {u.characterCount ? `${u.characterCount} on file` : ''}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </div>
        </div>

        {/* Right column: selected reality */}
        <div
          ref={panelRef}
          aria-live="polite"
          className="relative scroll-mt-20 px-5 pt-8 pb-16 sm:px-8 lg:absolute lg:top-24 lg:right-8 lg:bottom-8 lg:w-[27rem] lg:overflow-y-auto lg:p-0"
          data-lenis-prevent
        >
          {detail.data ? (
            <UniversePanel detail={detail.data} onSelect={select} onClose={() => select(null)} className="border border-line" />
          ) : invalidSelection ? (
            <div className="flex flex-col gap-3 border border-line bg-void/90 p-6">
              <Eyebrow className="text-red-bright">Unknown reality</Eyebrow>
              <p>No reality with that designation is on file.</p>
              <button type="button" onClick={() => select(null)} className="w-fit font-mono text-[0.7rem] uppercase underline">
                Back to overview
              </button>
            </div>
          ) : (
            <div className="hidden flex-col gap-3 border border-line bg-void/80 p-6 backdrop-blur lg:flex">
              <Eyebrow className="text-mute">How to explore</Eyebrow>
              <p className="leading-relaxed text-bone/80">
                Each sphere is a reality. Threads mark stories where heroes crossed from one to another. Pick a
                reality to fly to it and open its file.
              </p>
            </div>
          )}
        </div>
      </section>

      <Container className="border-t border-line py-6">
        <Eyebrow className="text-mute">
          Curated map · Designations from Marvel’s handbook numbering · Crossings are published stories and released films
        </Eyebrow>
      </Container>
    </div>
  )
}

function MapButton({ label, onClick, children }: { label: string; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex size-11 items-center justify-center rounded-full border border-line bg-void/80 font-display text-xl backdrop-blur hover:border-bone"
    >
      {children}
    </button>
  )
}

function FailSignal({ onFail }: { onFail: () => void }) {
  useEffect(() => onFail(), [onFail])
  return null
}
