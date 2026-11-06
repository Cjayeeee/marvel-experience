import { useRef } from 'react'
import { useReveals } from '@/motion/useReveals'
import { DiscoverySection } from './sections/DiscoverySection'
import { FeaturedHeroesSection } from './sections/FeaturedHeroesSection'
import { FeaturedTitlesSection } from './sections/FeaturedTitlesSection'
import { HeroSection } from './sections/HeroSection'
import { LatestSection } from './sections/LatestSection'
import { ManifestoSection } from './sections/ManifestoSection'
import { MultiverseMapSection } from './sections/MultiverseMapSection'
import { SignalBand } from './sections/SignalBand'
import { TeamsSection } from './sections/TeamsSection'
import { TimelinePreviewSection } from './sections/TimelinePreviewSection'
import { VillainsSection } from './sections/VillainsSection'

export function HomePage() {
  const root = useRef<HTMLDivElement>(null)
  useReveals(root)

  return (
    <div ref={root}>
      <title>Marvel: Multiverse | Every Universe. Every Hero. Every Possibility.</title>
      <HeroSection />
      <FeaturedHeroesSection />
      <ManifestoSection />
      <SignalBand />
      <MultiverseMapSection />
      <FeaturedTitlesSection />
      <TimelinePreviewSection />
      <TeamsSection />
      <VillainsSection />
      <LatestSection />
      <DiscoverySection />
    </div>
  )
}
