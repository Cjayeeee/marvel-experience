import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { AdditiveBlending, type Points, type ShaderMaterial } from 'three'

const vertexShader = /* glsl */ `
attribute float aSize;
uniform float uDpr;
varying float vAlpha;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize * uDpr;
  vAlpha = clamp(aSize / 2.6, 0.25, 1.0);
  gl_Position = projectionMatrix * mv;
}
`

const fragmentShader = /* glsl */ `
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float a = smoothstep(0.5, 0.0, d) * vAlpha * 0.8;
  gl_FragColor = vec4(vec3(0.93, 0.9, 0.85) * a, a);
}
`

/** Seeded PRNG so the sky is identical every visit. */
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Distant stars on a spherical shell, drifting very slowly. */
export function Starfield({ count }: { count: number }) {
  const points = useRef<Points>(null)
  const material = useRef<ShaderMaterial>(null)
  const dpr = useThree((s) => s.viewport.dpr)

  const { positions, sizes } = useMemo(() => {
    const random = mulberry32(199999)
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      const u = random() * 2 - 1
      const theta = random() * Math.PI * 2
      const r = 35 + random() * 40
      const s = Math.sqrt(1 - u * u)
      positions[i * 3] = r * s * Math.cos(theta)
      positions[i * 3 + 1] = r * u
      positions[i * 3 + 2] = r * s * Math.sin(theta)
      sizes[i] = 0.8 + Math.pow(random(), 3) * 2.4
    }
    return { positions, sizes }
  }, [count])

  const uniforms = useMemo(() => ({ uDpr: { value: 1 } }), [])

  useFrame((_, delta) => {
    const u = material.current?.uniforms.uDpr
    if (u) u.value = dpr
    if (points.current) points.current.rotation.y += delta * 0.004
  })

  return (
    <points ref={points} raycast={() => null}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aSize" args={[sizes, 1]} />
      </bufferGeometry>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={AdditiveBlending}
      />
    </points>
  )
}
