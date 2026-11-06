import { useEffect, useRef, useState } from 'react'

/**
 * True once the element has come within `margin` of the viewport (then stays
 * true). Used to fetch per-card data only when it's about to be seen.
 */
export function useInView<T extends Element>(margin = '300px') {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || inView) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: margin },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [inView, margin])

  return { ref, inView }
}
