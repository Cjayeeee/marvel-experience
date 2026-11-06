/**
 * Shared, non-reactive scroll progress of the hero dive (0 → 1).
 * Written by the hero's ScrollTrigger, read every frame by the 3D scene —
 * kept out of React state so scrolling never triggers re-renders.
 */
export const heroProgress = { value: 0 }
