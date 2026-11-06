import { Link } from 'react-router'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Eyebrow } from '@/components/ui/Typography'
import { featuredTitles } from '@/data/curated/home'
import { TitlePoster } from '@/features/titles/TitlePoster'
import { cn } from '@/lib/cn'

/** Stepped headline + small poster cards (Orbita's "smart casual" menu block). */
export function FeaturedTitlesSection() {
  return (
    <section aria-labelledby="titles-heading" className="paper-grain bg-paper py-24 text-ink sm:py-32">
      <Container className="flex flex-col gap-14">
        <h2 id="titles-heading" data-reveal="heading" className="font-display text-huge uppercase">
          <span className="block">Now showing</span>
          <span className="block pl-[12%] text-red">in this reality</span>
        </h2>

        <ul data-reveal="stagger" className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-6">
          {featuredTitles.map((title, index) => (
            <li key={title.id} className={cn(index % 2 === 1 && 'xl:translate-y-10')}>
              <Link
                to={`/titles/${title.id}`}
                className="group flex h-full flex-col gap-3 bg-paper-dim p-3 transition-colors duration-300 hover:bg-ink hover:text-paper"
              >
                <Eyebrow className="flex justify-between text-current opacity-70">
                  <span>{title.kind === 'film' ? 'Film' : 'Series'}</span>
                  <span>{title.releaseDate.slice(0, 4)}</span>
                </Eyebrow>
                <TitlePoster title={title} className="aspect-[2/3]" />
                <span className="font-display text-xl uppercase leading-[1.02]">{title.title}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-3 xl:mt-8">
          <ButtonLink to="/movies" variant="ink" size="lg">
            All movies
          </ButtonLink>
          <ButtonLink to="/series" variant="ghost" size="lg" className="hover:border-ink hover:bg-ink hover:text-paper">
            All series
          </ButtonLink>
        </div>
      </Container>
    </section>
  )
}
