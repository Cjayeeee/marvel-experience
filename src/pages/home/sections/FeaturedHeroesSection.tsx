import { Link } from 'react-router'
import { Container } from '@/components/ui/Container'
import { Eyebrow, SectionHeading } from '@/components/ui/Typography'
import { featuredHeroes } from '@/data/curated/home'
import { CharacterArt } from '@/features/characters/CharacterArt'

/** Poster grid with universe designations underneath (Orbita's event dates). */
export function FeaturedHeroesSection() {
  return (
    <section aria-labelledby="featured-heroes" className="bg-void pt-16 pb-24 text-bone sm:pt-20 sm:pb-32">
      <Container className="flex flex-col gap-12">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading id="featured-heroes" lead="Featured heroes" accent="Across realities" />
          <Link
            to="/characters"
            className="font-mono text-[0.78rem] uppercase tracking-[0.12em] text-mute underline-offset-4 transition-colors hover:text-bone hover:underline"
          >
            All characters →
          </Link>
        </div>

        <ul data-reveal="stagger" className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
          {featuredHeroes.map((hero) => (
            <li key={hero.slug}>
              <Link to={`/characters/${hero.slug}`} className="group flex flex-col gap-4">
                <div className="relative overflow-hidden">
                  <CharacterArt
                    character={hero}
                    decorative
                    className="aspect-[3/4] w-full grayscale transition-[transform,filter] duration-700 ease-(--ease-cinematic) group-hover:scale-[1.03] group-hover:grayscale-0"
                  />
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 bg-red opacity-0 mix-blend-multiply transition-opacity duration-500 group-hover:opacity-80"
                  />
                  <Eyebrow className="absolute top-3 left-3 text-bone/70">{hero.universe}</Eyebrow>
                </div>
                <div className="flex flex-col items-center gap-1 text-center">
                  <span className="font-display text-[clamp(1.5rem,2.6vw,2.25rem)] uppercase leading-none transition-colors group-hover:text-red-bright">
                    {hero.name}
                  </span>
                  <span className="font-mono text-[0.72rem] uppercase tracking-[0.12em] text-mute">
                    {hero.alias}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
