import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/shadcn/ui/button'
import { Container } from '@/components/shared/container'
import { cn } from '@/utils/shadcn.helper'

const SLIDES = [
  { image: '/images/hero/hero-1.png', alt: 'Macaco de óculos redondos e jaqueta verde de colégio' },
  { image: '/images/hero/hero-2.png', alt: 'Macaco de chapéu bucket verde e moletom lilás' },
  { image: '/images/hero/hero-3.png', alt: 'Macaco de pelo escuro com jaqueta clara' },
]

export function HomeHero() {
  const [current, setCurrent] = useState(0)
  const slide = SLIDES[current]
  const next = SLIDES[(current + 1) % SLIDES.length]

  return (
    <section aria-labelledby="hero-title" className="pt-4 md:pt-8">
      <Container>
        <div className="relative flex items-center gap-2 overflow-hidden rounded-2xl bg-surface-dark px-2 pt-4 pb-8 md:h-[450px] md:justify-between md:gap-0 md:overflow-visible md:rounded-none md:bg-transparent md:py-0 md:pr-0 md:pl-10">
          <div className="flex min-w-0 flex-1 flex-col md:w-[600px] md:flex-none">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-1">
                <div className="flex flex-col gap-2">
                  <p className="text-sm leading-4 font-medium tracking-[0.1em] text-text-primary">Bem-vindo à Kurio</p>
                  <h1 id="hero-title" className="text-lg leading-[29px] font-bold uppercase md:text-display md:leading-[70px]">
                    <span className="md:hidden">Seja dono da cultura digital</span>
                    <span className="hidden md:inline">
                      Seja dono do futuro
                      <br />
                      da arte digital
                    </span>
                  </h1>
                </div>

                <p className="text-sm leading-[18px] text-text-secondary md:w-[557px] md:leading-6">
                  <span className="md:hidden">Descubra NFTs selecionados de criadores do mundo todo.</span>
                  <span className="hidden md:inline">
                    Descubra NFTs selecionados de criadores emergentes e consagrados. Colecione arte digital rara,
                    apoie artistas e tenha uma parte da cultura da internet.
                  </span>
                </p>
              </div>

              <Link
                to="/"
                hash="catalogo"
                className="-mt-6 inline-flex items-center gap-2 self-start text-sm font-bold text-text-accent uppercase md:hidden"
              >
                Explorar
                <ArrowRight aria-hidden className="size-4" />
              </Link>

              <Button
                asChild
                className="hidden h-10 w-[140px] gap-2.5 self-start rounded-md bg-primary py-2.5 pr-9 pl-7 text-base leading-5 font-bold text-primary-foreground uppercase md:inline-flex"
              >
                <Link to="/" hash="catalogo">
                  Explorar
                </Link>
              </Button>
            </div>

            <HeroDots current={current} onSelect={setCurrent} className="mt-11 hidden gap-2 self-end md:flex" />
          </div>

          <div className="relative shrink-0">
            <img
              src={slide.image}
              alt={slide.alt}
              width={450}
              height={450}
              fetchPriority="high"
              className="h-[146px] w-[138px] rounded-2xl object-cover md:size-[450px] md:rounded-[24px]"
            />
            <img
              src={next.image}
              alt=""
              width={56}
              height={56}
              className="absolute bottom-0 -left-3 size-14 rounded-xl border-2 border-surface-dark object-cover md:hidden"
            />
          </div>

          <HeroDots
            current={current}
            onSelect={setCurrent}
            className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2 md:hidden"
          />
        </div>
      </Container>
    </section>
  )
}

interface HeroDotsProps {
  current: number
  onSelect: (index: number) => void
  className?: string
}

function HeroDots({ current, onSelect, className }: HeroDotsProps) {
  return (
    <div role="group" aria-label="Destaques" className={className}>
      {SLIDES.map((item, index) => (
        <button
          key={item.image}
          type="button"
          aria-label={`Mostrar destaque ${index + 1}`}
          aria-current={index === current}
          onClick={() => onSelect(index)}
          className={cn(
            'relative size-2 rounded-full bg-primary transition-opacity after:absolute after:-inset-1',
            index === current ? 'opacity-100' : 'opacity-40',
          )}
        />
      ))}
    </div>
  )
}
