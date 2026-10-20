import { Container } from '@/components/shared/container'
import type { Nft, NftFacets, NftListParams } from '@/types/nft'
import { CatalogFilters } from './catalog-filters'
import { CatalogPagination } from './catalog-pagination'
import { CatalogToolbar } from './catalog-toolbar'
import { FeaturedNftBanner } from './featured-nft-banner'
import { NftGrid } from './nft-grid'

interface HomeCatalogProps {
  nfts: Nft[]
  featured?: Nft
  facets?: NftFacets
  totalPages: number
  isLoading?: boolean
  params: NftListParams
  onParamsChange: (changes: Partial<NftListParams>) => void
}

export function HomeCatalog({
  nfts,
  featured,
  facets,
  totalPages,
  isLoading = false,
  params,
  onParamsChange,
}: HomeCatalogProps) {
  return (
    <section id="catalogo" aria-labelledby="catalogo-title" className="scroll-mt-24">
      <h2 id="catalogo-title" className="sr-only">
        Catálogo de NFTs
      </h2>
      <Container className="flex gap-12">
        <aside className="hidden w-[310px] shrink-0 flex-col gap-6 xl:flex">
          <CatalogFilters facets={facets} params={params} onParamsChange={onParamsChange} />
          {featured && <FeaturedNftBanner nft={featured} />}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-12 xl:gap-[88px]">
          <div className="flex flex-col gap-8">
            <CatalogToolbar params={params} onParamsChange={onParamsChange} />
            <NftGrid nfts={nfts} isLoading={isLoading} />
          </div>
          <CatalogPagination
            page={params.page ?? 1}
            totalPages={totalPages}
            onPageChange={(page) => onParamsChange({ page })}
          />
        </div>
      </Container>
    </section>
  )
}
