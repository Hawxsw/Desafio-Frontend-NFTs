import { Container } from '@/components/shared/container'

const POSTS = [
  { image: '/images/hero/hero-3.png', date: '12 de setembro', readTime: 6, title: 'Como avaliar a raridade de um NFT', summary: 'Entenda edições, tiragem e histórico antes de comprar.' },
  { image: '/images/hero/hero-1.png', date: '13 de setembro', readTime: 2, title: 'Carteiras: principal e secundária', summary: 'Organize seus ativos com segurança entre redes diferentes.' },
  { image: '/images/hero/hero-2.png', date: '15 de setembro', readTime: 3, title: 'O que muda em uma edição gênesis', summary: 'Por que as primeiras cunhagens costumam valorizar.' },
  { image: '/images/hero/hero-4.png', date: '15 de setembro', readTime: 2, title: 'Taxas de rede sem surpresas', summary: 'Como a taxa entra no total do seu pedido.' },
]

export function HomeBlog() {
  return (
    <section aria-labelledby="diario-title" id="diario" className="scroll-mt-24">
      <Container className="flex flex-col gap-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 id="diario-title" className="text-section font-bold">
            Diário da Cunhagem
          </h2>
          <p className="text-sm leading-[22px] text-text-secondary">
            Histórias, guias e insights para colecionadores sobre o universo da propriedade digital.
          </p>
        </div>
        <ul className="grid gap-6 sm:grid-cols-2 xl:grid-cols-[repeat(4,268px)]">
          {POSTS.map((post) => (
            <li key={post.title}>
              <article className="flex h-full flex-col overflow-hidden rounded-lg bg-surface-card">
                <img src={post.image} alt="" width={268} height={195} loading="lazy" className="h-[195px] w-full object-cover" />
                <div className="flex flex-1 flex-col gap-2 px-4 pt-3 pb-4">
                  <p className="text-xs leading-[14px] text-text-secondary">
                    {post.date} | Leitura de {post.readTime} min
                  </p>
                  <h3 className="text-base leading-5 font-bold">{post.title}</h3>
                  <p className="text-xs leading-[18px] text-text-secondary">{post.summary}</p>
                  <span aria-disabled="true" title="Disponível em breve" className="mt-auto text-xs leading-[18px] font-bold text-text-accent">
                    Ler mais
                    <span className="sr-only"> (indisponível)</span>
                  </span>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
