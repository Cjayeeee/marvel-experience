import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

// Register once, import from here everywhere so plugins are always available.
gsap.registerPlugin(useGSAP, Flip, ScrollTrigger, SplitText)

gsap.defaults({ ease: 'expo.out', duration: 0.9 })

export { Flip, gsap, ScrollTrigger, SplitText, useGSAP }
