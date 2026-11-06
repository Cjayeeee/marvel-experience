import { useFrame, useLoader, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { Color, NoColorSpace, RepeatWrapping, TextureLoader, type Group, type ShaderMaterial } from 'three'
import earthTextureUrl from '@/assets/earth/earth-packed.webp'
import { heroProgress } from './heroProgress'
import { portalFragmentShader, portalVertexShader } from './portalShader'

type PortalSphereProps = {
  segments: number
  /** Normalised pointer position (-1..1), updated outside React. */
  pointer: RefObject<{ x: number; y: number }>
  /** Called once the Earth texture has loaded and the sphere can be shown. */
  onReady: () => void
}

export function PortalSphere({ segments, pointer, onReady }: PortalSphereProps) {
  // Suspends until loaded; the static sphere stays visible meanwhile.
  const earth = useLoader(TextureLoader, earthTextureUrl)

  const group = useRef<Group>(null)
  const material = useRef<ShaderMaterial>(null)
  const dpr = useThree((state) => state.viewport.dpr)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uProgress: { value: 0 },
      uDpr: { value: 1 },
      uRed: { value: new Color(0.902, 0.141, 0.161) },
      uViolet: { value: new Color(0.357, 0.247, 0.839) },
      uCyan: { value: new Color(0.31, 0.82, 1.0) },
      uEarth: { value: earth },
    }),
    [earth],
  )

  // Configure the texture through the material (a three.js object), then reveal.
  useEffect(() => {
    const texture = material.current?.uniforms.uEarth?.value as typeof earth | undefined
    if (texture) {
      texture.colorSpace = NoColorSpace // data texture, not a colour image
      texture.wrapS = RepeatWrapping
      texture.anisotropy = 4
      texture.needsUpdate = true
    }
    onReady()
  }, [earth, onReady])

  useFrame((state, delta) => {
    const m = material.current
    const g = group.current
    if (!m || !g) return
    const u = m.uniforms as typeof uniforms
    u.uTime.value = state.clock.elapsedTime
    u.uDpr.value = dpr
    u.uProgress.value = heroProgress.value

    // Slow spin plus a gentle lean toward the pointer.
    g.rotation.y += delta * 0.12
    const targetX = pointer.current.y * 0.25
    const targetZ = -pointer.current.x * 0.12
    g.rotation.x += (targetX - g.rotation.x) * Math.min(1, delta * 3)
    g.rotation.z += (targetZ - g.rotation.z) * Math.min(1, delta * 3)
  })

  return (
    <group ref={group}>
      {/* Start with Africa and Europe (≈15°E) facing the camera. */}
      <mesh rotation={[0, -1.83, 0]}>
        <sphereGeometry args={[1, segments, segments]} />
        <shaderMaterial
          ref={material}
          uniforms={uniforms}
          vertexShader={portalVertexShader}
          fragmentShader={portalFragmentShader}
        />
      </mesh>
    </group>
  )
}
