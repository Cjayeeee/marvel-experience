import { CameraControls, CameraControlsImpl } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useImperativeHandle, useMemo, useRef, useState, type RefObject } from 'react'
import { Vector3 } from 'three'
import { mediumColor, nodeRadius, universeLayout } from '@/features/multiverse/layout'
import type { RenderTier } from '@/three/capability'
import type { UniverseSummary } from '@/services/universes.service'
import type { Crossing } from '@/types/character'
import { CrossingThreads } from './CrossingThreads'
import { Starfield } from './Starfield'
import { UniverseNode } from './UniverseNode'

export type MultiverseCameraApi = {
  zoomIn: () => void
  zoomOut: () => void
  overview: () => void
}

type MultiverseSceneProps = {
  tier: Exclude<RenderTier, 'none'>
  active: boolean
  universes: UniverseSummary[]
  crossings: Crossing[]
  selectedId: string | null
  onSelect: (id: string) => void
  reducedMotion: boolean
  /** Container of label elements (data-label-id) positioned over the canvas each frame. */
  labelLayer: RefObject<HTMLDivElement | null>
  apiRef: RefObject<MultiverseCameraApi | null>
  onReady: () => void
}

const OVERVIEW = { position: new Vector3(0, 7, 24), target: new Vector3(0, 0, 0) }

/** Flies the camera to the selected universe, or back to the overview. */
function CameraDirector({
  controls,
  selectedId,
  radii,
  smooth,
}: {
  controls: RefObject<CameraControlsImpl | null>
  selectedId: string | null
  radii: Record<string, number>
  smooth: boolean
}) {
  const camera = useThree((s) => s.camera)
  const width = useThree((s) => s.size.width)
  useEffect(() => {
    const c = controls.current
    if (!c) return
    const wide = width >= 1024
    if (!selectedId) {
      // Nudge the cluster right, clear of the title and list column.
      void c.setFocalOffset(wide ? -2.2 : 0, 0, 0, smooth)
      void c.setLookAt(...OVERVIEW.position.toArray(), ...OVERVIEW.target.toArray(), smooth)
      return
    }
    const p = universeLayout[selectedId]
    if (!p) return
    const target = new Vector3(p.x, p.y, p.z)
    const current = new Vector3()
    c.getTarget(current)
    // Keep the current viewing direction so the camera glides rather than spins.
    const direction = camera.position.clone().sub(current).normalize()
    if (direction.lengthSq() < 0.01) direction.set(0, 0.3, 1).normalize()
    const distance = 5 + (radii[selectedId] ?? 1) * 4.2
    const position = target.clone().add(direction.multiplyScalar(distance))
    // On wide screens the detail panel covers the right side: shift the subject left.
    void c.setFocalOffset(wide ? distance * 0.16 : 0, 0, 0, smooth)
    void c.setLookAt(position.x, position.y, position.z, target.x, target.y, target.z, smooth)
  }, [selectedId, controls, radii, smooth, camera, width])
  return null
}

/** Slow orbit around the multiverse while nothing is selected. */
function IdleDrift({ controls, enabled }: { controls: RefObject<CameraControlsImpl | null>; enabled: boolean }) {
  useFrame((_, delta) => {
    const c = controls.current
    if (!enabled || !c || c.currentAction !== 0) return
    void c.rotate(delta * 0.06, 0, false)
  })
  return null
}

/** Projects each universe's position to screen space and moves its DOM label there. */
function LabelProjector({ layer, radii }: { layer: RefObject<HTMLDivElement | null>; radii: Record<string, number> }) {
  const camera = useThree((s) => s.camera)
  const size = useThree((s) => s.size)
  const v = useMemo(() => new Vector3(), [])
  useFrame(() => {
    const el = layer.current
    if (!el) return
    for (const label of Array.from(el.children) as HTMLElement[]) {
      const id = label.dataset.labelId
      const p = id ? universeLayout[id] : undefined
      if (!p) continue
      // Anchor under the sphere (scaled radius plus a little air).
      v.set(p.x, p.y - (radii[id ?? ''] ?? 0.6) * 1.25, p.z).project(camera)
      const visible = v.z < 1 && Math.abs(v.x) < 1.2 && Math.abs(v.y) < 1.2
      const x = (v.x * 0.5 + 0.5) * size.width
      const y = (-v.y * 0.5 + 0.5) * size.height
      label.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
      label.style.opacity = visible ? '1' : '0'
    }
  })
  return null
}

function ControlsApi({
  controls,
  apiRef,
  smooth,
}: {
  controls: RefObject<CameraControlsImpl | null>
  apiRef: RefObject<MultiverseCameraApi | null>
  smooth: boolean
}) {
  useImperativeHandle(
    apiRef,
    () => ({
      zoomIn: () => void controls.current?.dolly(3, smooth),
      zoomOut: () => void controls.current?.dolly(-3, smooth),
      overview: () =>
        void controls.current?.setLookAt(...OVERVIEW.position.toArray(), ...OVERVIEW.target.toArray(), smooth),
    }),
    [controls, smooth],
  )
  return null
}

export default function MultiverseScene({
  tier,
  active,
  universes,
  crossings,
  selectedId,
  onSelect,
  reducedMotion,
  labelLayer,
  apiRef,
  onReady,
}: MultiverseSceneProps) {
  const controls = useRef<CameraControlsImpl>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  const radii = useMemo(
    () => Object.fromEntries(universes.map((u) => [u.id, nodeRadius(u.characterCount)])),
    [universes],
  )
  const positions = universeLayout
  const connected = useMemo(() => {
    if (!selectedId) return null
    const ids = new Set([selectedId])
    for (const x of crossings) {
      if (x.from === selectedId) ids.add(x.to)
      if (x.to === selectedId) ids.add(x.from)
    }
    return ids
  }, [selectedId, crossings])

  useEffect(() => {
    document.body.style.cursor = hoveredId ? 'pointer' : ''
    return () => {
      document.body.style.cursor = ''
    }
  }, [hoveredId])

  const { ACTION } = CameraControlsImpl

  return (
    <Canvas
      dpr={tier === 'high' ? [1, 1.5] : 1}
      linear
      flat
      frameloop={active ? 'always' : 'never'}
      gl={{ antialias: tier === 'high', alpha: true, powerPreference: 'high-performance' }}
      camera={{ fov: 45, near: 0.1, far: 200, position: OVERVIEW.position.toArray() }}
      resize={{ offsetSize: true }}
      onCreated={() => onReady()}
      aria-hidden="true"
    >
      <Starfield count={tier === 'high' ? 2400 : 900} />
      <CrossingThreads crossings={crossings} positions={positions} selectedId={selectedId} />
      {universes.map((u) => {
        const p = positions[u.id]
        if (!p) return null
        return (
          <UniverseNode
            key={u.id}
            id={u.id}
            position={[p.x, p.y, p.z]}
            radius={radii[u.id] ?? 0.6}
            color={mediumColor[u.medium]}
            selected={u.id === selectedId}
            hovered={u.id === hoveredId}
            dimmed={connected !== null && !connected.has(u.id)}
            onSelect={onSelect}
            onHover={setHoveredId}
          />
        )
      })}
      <CameraControls
        ref={controls}
        makeDefault
        minDistance={3}
        maxDistance={45}
        smoothTime={0.6}
        draggingSmoothTime={0.15}
        mouseButtons={{ left: ACTION.ROTATE, middle: ACTION.NONE, right: ACTION.NONE, wheel: ACTION.NONE }}
        touches={{ one: ACTION.TOUCH_ROTATE, two: ACTION.TOUCH_DOLLY, three: ACTION.NONE }}
      />
      <CameraDirector controls={controls} selectedId={selectedId} radii={radii} smooth={!reducedMotion} />
      <IdleDrift controls={controls} enabled={!selectedId && !reducedMotion} />
      <LabelProjector layer={labelLayer} radii={radii} />
      <ControlsApi controls={controls} apiRef={apiRef} smooth={!reducedMotion} />
    </Canvas>
  )
}
