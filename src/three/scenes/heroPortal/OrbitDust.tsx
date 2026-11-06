import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { NormalBlending, type Points, type ShaderMaterial } from 'three'

type OrbitDustProps = {
  count: number
}

const vertexShader = /* glsl */ `
attribute float aSize;
attribute float aRed;
uniform float uDpr;
varying float vRed;
void main() {
  vRed = aRed;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * uDpr * (8.0 / -mv.z);
  gl_Position = projectionMatrix * mv;
}
`

const fragmentShader = /* glsl */ `
varying float vRed;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float alpha = smoothstep(0.5, 0.2, d) * 0.7;
  vec3 ink = vec3(0.04);
  vec3 red = vec3(0.902, 0.141, 0.161);
  gl_FragColor = vec4(mix(ink, red, vRed), alpha);
}
`

/** Small deterministic PRNG so the ring is identical on every render. */
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** A tilted ring of debris around the portal, echoing the SVG word ring. */
export function OrbitDust({ count }: OrbitDustProps) {
  const points = useRef<Points>(null)
  const material = useRef<ShaderMaterial>(null)
  const dpr = useThree((state) => state.viewport.dpr)

  const { positions, sizes, reds } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    const reds = new Float32Array(count)
    const random = mulberry32(616)
    for (let i = 0; i < count; i++) {
      const angle = random() * Math.PI * 2
      // Denser near the inner edge, thinning outward.
      const radius = 1.45 + Math.pow(random(), 1.8) * 1.9
      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = (random() - 0.5) * 0.12 * radius
      positions[i * 3 + 2] = Math.sin(angle) * radius
      sizes[i] = 1.2 + random() * 2.6
      reds[i] = random() < 0.06 ? 1 : 0
    }
    return { positions, sizes, reds }
  }, [count])

  const uniforms = useMemo(() => ({ uDpr: { value: 1 } }), [])

  useFrame((_, delta) => {
    if (points.current) points.current.rotation.y += delta * 0.05
    if (material.current) material.current.uniforms.uDpr!.value = dpr
  })

  return (
    <group rotation={[1.28, 0, -0.16]}>
      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
          <bufferAttribute attach="attributes-aRed" args={[reds, 1]} />
        </bufferGeometry>
        <shaderMaterial
          ref={material}
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent
          depthWrite={false}
          blending={NormalBlending}
        />
      </points>
    </group>
  )
}

