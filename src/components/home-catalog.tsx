import { Button } from '@/components/shadcn/ui/button'
import { Container } from '@/components/shared/container'
import type { Nft, NftFacets, NftListParams } from '@/types/nft'
import { cn } from '@/utils/shadcn.helper'
import { CatalogFilters } from './catalog-filters'
import { CatalogPagination } from './catalog-pagination'
import { CatalogSearch } from './catalog-search'
import { CatalogToolbar } from './catalog-toolbar'
import { FeaturedNftBanner } from './featured-nft-banner'
import { NftGrid } from './nft-grid'

interface HomeCatalogProps {
  nfts: Nft[]
  featured?: Nft
  facets?: NftFacets
  total?: number
  totalPages: number
  isLoading?: boolean
  isUpdating?: boolean
  isError?: boolean
  onRetry: () => void
  params: NftListParams
  onParamsChange: (changes: Partial<NftListParams>) => void
  onSearch: (value: string) => void
  onClear: () => void
}

export function HomeCatalog({
  nfts,
  featured,
  facets,
  total,
  totalPages,
  isLoading = false,
  isUpdating = false,
  isError = false,
  onRetry,
  params,
  onParamsChange,
  onSearch,
  onClear,
}: HomeCatalogProps) {
  return (
    <section id="catalogo" aria-labelledby="catalogo-title" className="scroll-mt-24">
      <h2 id="catalogo-title" className="sr-only">
        Catálogo de NFTs
      </h2>
      <Container className="flex gap-12">
        <aside className="hidden w-[310px] shrink-0 flex-col gap-6 xl:flex">
          <CatalogSearch value={params.q ?? ''} onSearch={onSearch} />
          <CatalogFilters
            key={`${params.minPrice}-${params.maxPrice}`}
            facets={facets}
            params={params}
            onParamsChange={onParamsChange}
          />
          {featured && <FeaturedNftBanner nft={featured} />}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-12 xl:gap-[88px]">
          <div className="flex flex-col gap-8">
            <CatalogToolbar params={params} onParamsChange={onParamsChange} />
            <p role="status" className="sr-only">
              {isLoading ? 'Carregando NFTs' : total !== undefined ? `${total} NFTs encontrados` : ''}
            </p>
            {isError ? (
              <div role="alert" className="flex flex-col items-start gap-4 py-16">
                <p className="text-lg leading-6 font-bold">Não foi possível carregar o catálogo.</p>
                <p className="text-sm leading-6 text-text-secondary">Verifique sua conexão e tente novamente.</p>
                <Button type="button" onClick={onRetry} className="h-10 rounded-md px-4 text-base font-bold">
                  Tentar novamente
                </Button>
              </div>
            ) : (
              <div aria-busy={isUpdating} className={cn('transition-opacity', isUpdating && 'opacity-60')}>
                <NftGrid nfts={nfts} isLoading={isLoading} onClear={onClear} />
              </div>
            )}
          </div>
          {!isError && (
            <CatalogPagination
              page={params.page ?? 1}
              totalPages={totalPages}
              onPageChange={(page) => onParamsChange({ page })}
            />
          )}
        </div>
      </Container>
    </section>
  )
}
