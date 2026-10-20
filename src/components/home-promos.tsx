import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/shadcn/ui/button'
import { Container } from '@/components/shared/container'
import { cn } from '@/utils/shadcn.helper'

const PROMOS = [
  {
    image: '/images/hero/hero-1.png',
    imageAlt: 'Macaco de óculos redondos e jaqueta verde de colégio',
    title: 'Lançamentos gênesis de edição limitada',
    titleClassName: 'max-w-[206px]',
    description: 'Colecione edições escassas diretamente dos criadores antes da revelação pública.',
  },
  {
    image: '/images/hero/hero-3.png',
    imageAlt: 'Macaco de pelo escuro com jaqueta clara',
    title: 'Arte digital selecionada e muito mais',
    titleClassName: 'max-w-[263px]',
    description: 'Explore novos artistas, coleções verificadas e obras digitais que definem a época.',
  },
]

export function HomePromos() {
  return (
    <section aria-label="Promoções">
      <Container className="grid gap-6 xl:grid-cols-2 xl:gap-7">
        {PROMOS.map((promo) => (
          <article key={promo.title} className="relative flex h-[250px] overflow-hidden rounded-lg bg-surface-card">
            <img
              src={promo.image}
              alt={promo.imageAlt}
              width={292}
              height={250}
              loading="lazy"
              className="h-full w-1/2 max-w-[292px] rounded-[18px] object-cover"
            />
            <div className="ml-auto flex w-1/2 flex-col items-end px-4 pt-[37px] pb-[46px] text-right md:w-[263px] md:px-0 md:pr-[30px] md:box-content">
              <h3 className={cn('text-lg leading-6 font-bold', promo.titleClassName)}>{promo.title}</h3>
              <p className="mt-[9px] text-sm leading-6 text-text-secondary">{promo.description}</p>
              <Button asChild className="mt-auto h-10 w-[140px] gap-2.5 rounded-md text-base leading-5 font-bold">
                <Link to="/" hash="catalogo">
                  Explorar
                  <ArrowRight aria-hidden className="size-4" />
                </Link>
              </Button>
            </div>
          </article>
        ))}
      </Container>
    </section>
  )
}
