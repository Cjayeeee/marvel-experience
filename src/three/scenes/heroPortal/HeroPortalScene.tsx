import { Canvas, useFrame } from '@react-three/fiber'
import { Suspense, useEffect, useRef, useState } from 'react'
import type { RenderTier } from '@/three/capability'
import { heroProgress } from './heroProgress'
import { OrbitDust } from './OrbitDust'
import { PortalSphere } from './PortalSphere'
import { CANVAS_SCALE, FOV } from './sceneConfig'

/**
 * Camera framing: the canvas is 2.6× the sphere's DOM box, so the unit sphere
 * must span 1/2.6 of the view height → distance = 2.6 / tan(fov / 2).
 */
const BASE_DISTANCE = CANVAS_SCALE / Math.tan((FOV / 2) * (Math.PI / 180))
const DIVE_DISTANCE = 4.4

/** Drops resolution once if the device can't hold ~45fps over a 2s window. */
function FrameRateGuard({ onSlow }: { onSlow: () => void }) {
  const sample = useRef({ frames: 0, time: 0, done: false })
  useFrame((_, delta) => {
    const s = sample.current
    if (s.done) return
    s.frames += 1
    s.time += delta
    if (s.time >= 2) {
      s.done = true
      if (s.frames / s.time < 45) onSlow()
    }
  })
  return null
}

function CameraRig() {
  useFrame(({ camera }) => {
    const t = heroProgress.value
    camera.position.z = BASE_DISTANCE + (DIVE_DISTANCE - BASE_DISTANCE) * t * t
  })
  return null
}

type HeroPortalSceneProps = {
  tier: Exclude<RenderTier, 'none'>
  /** Render only while visible. */
  active: boolean
  onReady: () => void
}

export default function HeroPortalScene({ tier, active, onReady }: HeroPortalSceneProps) {
  const pointer = useRef({ x: 0, y: 0 })
  const [dpr, setDpr] = useState<number>(tier === 'high' ? 1.5 : 1)

  useEffect(() => {
    if (tier === 'low') return
    const onMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [tier])

  return (
    <Canvas
      dpr={dpr}
      linear
      flat
      frameloop={active ? 'always' : 'never'}
      gl={{ antialias: tier === 'high', alpha: true, powerPreference: 'high-performance' }}
      camera={{ fov: FOV, near: 0.1, far: 50, position: [0, 0, BASE_DISTANCE] }}
      // Measure layout size, not transformed size: the hero scales this canvas's
      // ancestors during the entrance and the dive.
      resize={{ offsetSize: true }}
      style={{ pointerEvents: 'none' }}
    >
      {dpr > 1 ? <FrameRateGuard onSlow={() => setDpr(1)} /> : null}
      <CameraRig />
      <Suspense fallback={null}>
        <PortalSphere segments={tier === 'high' ? 96 : 64} pointer={pointer} onReady={onReady} />
      </Suspense>
      <OrbitDust count={tier === 'high' ? 1400 : 500} />
    </Canvas>
  )
}
