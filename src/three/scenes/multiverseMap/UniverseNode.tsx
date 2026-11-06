import type { ThreeEvent } from '@react-three/fiber'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { AdditiveBlending, BackSide, Color, type Group, type ShaderMaterial } from 'three'
import { haloFragmentShader, nodeFragmentShader, nodeVertexShader } from './nodeShader'

type UniverseNodeProps = {
  id: string
  position: [number, number, number]
  radius: number
  color: string
  selected: boolean
  hovered: boolean
  dimmed: boolean
  onSelect: (id: string) => void
  onHover: (id: string | null) => void
}

/** One reality on the map: glowing sphere, halo, and a ring when selected. */
export function UniverseNode({ id, position, radius, color, selected, hovered, dimmed, onSelect, onHover }: UniverseNodeProps) {
  const group = useRef<Group>(null)
  const ring = useRef<Group>(null)
  const core = useRef<ShaderMaterial>(null)
  const halo = useRef<ShaderMaterial>(null)

  const uniforms = useMemo(
    () => ({ uColor: { value: new Color(color) }, uGlow: { value: 0 }, uTime: { value: 0 } }),
    [color],
  )
  const haloUniforms = useMemo(() => ({ uColor: { value: new Color(color) }, uGlow: { value: 0 } }), [color])

  useFrame((state, delta) => {
    const target = selected ? 1 : hovered ? 0.6 : dimmed ? -0.4 : 0
    const ease = Math.min(1, delta * 6)
    // Mutate through the material refs (three.js objects), not the memoised props.
    const cu = core.current?.uniforms
    const hu = halo.current?.uniforms
    if (cu?.uGlow && cu.uTime) {
      cu.uGlow.value += (target - cu.uGlow.value) * ease
      cu.uTime.value = state.clock.elapsedTime
      if (hu?.uGlow) hu.uGlow.value = Math.max(0, cu.uGlow.value)
    }
    if (group.current) {
      const s = 1 + (selected ? 0.12 + Math.sin(state.clock.elapsedTime * 2) * 0.03 : hovered ? 0.08 : 0)
      group.current.scale.setScalar(group.current.scale.x + (s - group.current.scale.x) * ease)
      group.current.rotation.y += delta * 0.15
    }
    if (ring.current) {
      ring.current.rotation.z += delta * 0.4
      const rs = selected ? 1 : 0.001
      ring.current.scale.setScalar(ring.current.scale.x + (rs - ring.current.scale.x) * ease)
    }
  })

  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    // Ignore the click that ends a drag-to-rotate.
    if (e.delta > 6) return
    onSelect(id)
  }

  return (
    <group position={position}>
      <group ref={group}>
        <mesh
          onClick={click}
          onPointerOver={(e) => {
            e.stopPropagation()
            onHover(id)
          }}
          onPointerOut={() => onHover(null)}
        >
          <sphereGeometry args={[radius, 48, 48]} />
          <shaderMaterial
            ref={core}
            uniforms={uniforms}
            vertexShader={nodeVertexShader}
            fragmentShader={nodeFragmentShader}
          />
        </mesh>
        <mesh scale={1.55} raycast={() => null}>
          <sphereGeometry args={[radius, 32, 32]} />
          <shaderMaterial
            ref={halo}
            uniforms={haloUniforms}
            vertexShader={nodeVertexShader}
            fragmentShader={haloFragmentShader}
            side={BackSide}
            blending={AdditiveBlending}
            transparent
            depthWrite={false}
          />
        </mesh>
      </group>
      <group ref={ring} rotation={[Math.PI / 2.4, 0, 0]} scale={0.001}>
        <mesh raycast={() => null}>
          <torusGeometry args={[radius * 1.9, 0.015, 8, 96]} />
          <meshBasicMaterial color="#e62429" />
        </mesh>
      </group>
    </group>
  )
}
