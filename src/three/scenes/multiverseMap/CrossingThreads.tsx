import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { BufferGeometry, Color, Line, LineDashedMaterial, QuadraticBezierCurve3, Vector3 } from 'three'
import type { Crossing } from '@/types/character'

type Position = { x: number; y: number; z: number }

const LIT = new Color('#e62429')
const IDLE = new Color('#8a827a')

/** One curved, dashed thread between two realities. */
function Thread({ from, to, selectedId }: { from: Position & { id: string }; to: Position & { id: string }; selectedId: string | null }) {
  const ref = useRef<Line>(null)

  const line = useMemo(() => {
    const start = new Vector3(from.x, from.y, from.z)
    const end = new Vector3(to.x, to.y, to.z)
    const mid = start.clone().lerp(end, 0.5)
    mid.y += start.distanceTo(end) * 0.22
    const curve = new QuadraticBezierCurve3(start, mid, end)
    const geometry = new BufferGeometry().setFromPoints(curve.getPoints(64))
    const material = new LineDashedMaterial({
      color: IDLE.clone(),
      dashSize: 0.35,
      gapSize: 0.2,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    })
    const l = new Line(geometry, material)
    l.computeLineDistances()
    return l
  }, [from.x, from.y, from.z, to.x, to.y, to.z])

  useEffect(
    () => () => {
      line.geometry.dispose()
      ;(line.material as LineDashedMaterial).dispose()
    },
    [line],
  )

  useFrame((state, delta) => {
    const material = ref.current?.material as LineDashedMaterial | undefined
    if (!material) return
    const ease = Math.min(1, delta * 5)
    const lit = selectedId !== null && (from.id === selectedId || to.id === selectedId)
    const pulse = 0.8 + Math.sin(state.clock.elapsedTime * 3) * 0.15
    const targetOpacity = selectedId === null ? 0.45 : lit ? pulse : 0.12
    material.opacity += (targetOpacity - material.opacity) * ease
    material.color.lerp(lit ? LIT : IDLE, ease)
  })

  return <primitive ref={ref} object={line} />
}

type CrossingThreadsProps = {
  crossings: Crossing[]
  positions: Record<string, Position>
  selectedId: string | null
}

/**
 * Curved threads between realities that a story has connected. Threads touching
 * the selected universe light up red and pulse; the rest stay faint.
 */
export function CrossingThreads({ crossings, positions, selectedId }: CrossingThreadsProps) {
  return (
    <>
      {crossings.map((x) => {
        const a = positions[x.from]
        const b = positions[x.to]
        if (!a || !b) return null
        return <Thread key={x.id} from={{ ...a, id: x.from }} to={{ ...b, id: x.to }} selectedId={selectedId} />
      })}
    </>
  )
}
