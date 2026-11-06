import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Eyebrow } from '@/components/ui/Typography'
import { featuredHeroes, villains } from '@/data/curated/home'

const randomPool = [...featuredHeroes.map((h) => h.slug), ...villains.map((v) => v.slug)]

/** Giant headline + search (Orbita's "FIND US HERE" + map). */
export function DiscoverySection() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const q = query.trim()
    navigate(q ? `/characters?q=${encodeURIComponent(q)}` : '/characters')
  }

  const openRandom = () => {
    const slug = randomPool[Math.floor(Math.random() * randomPool.length)]
    if (slug) navigate(`/characters/${slug}`)
  }

  return (
    <section aria-labelledby="discovery-heading" className="bg-void pt-24 text-bone sm:pt-32">
      <Container className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[1.3fr_1fr] lg:items-end">
        <h2 id="discovery-heading" data-reveal="heading" className="font-display text-giant uppercase">
          <span className="block">Find</span>
          <span className="block">your</span>
          <span className="block text-red">hero</span>
        </h2>

        <div data-reveal="up" className="flex flex-col gap-6 lg:pb-4">
          <form onSubmit={onSubmit} role="search" className="flex flex-col gap-3">
            <label htmlFor="discovery-search">
              <Eyebrow as="span" className="text-mute">
                Search the archive
              </Eyebrow>
            </label>
            <div className="flex items-center gap-2 border-b-2 border-bone pb-2 focus-within:border-red">
              <input
                id="discovery-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Name, alias or universe"
                autoComplete="off"
                className="w-full min-w-0 flex-1 bg-transparent py-2 text-2xl text-bone outline-none placeholder:text-mute/70"
              />
              <Button type="submit" size="md">
                Search
              </Button>
            </div>
          </form>

          <div className="flex flex-wrap items-center gap-4">
            <Button variant="ghost" onClick={openRandom}>
              Open a random file
            </Button>
            <p className="text-sm text-mute">Not sure where to start? Let the multiverse choose.</p>
          </div>
        </div>
      </Container>
    </section>
  )
}
