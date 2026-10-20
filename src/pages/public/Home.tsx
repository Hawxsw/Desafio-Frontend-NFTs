import { useNavigate, useSearch } from '@tanstack/react-router'
import { useCallback } from 'react'
import { CatalogMobileBar } from '@/components/catalog-mobile-bar'
import { HomeBlog } from '@/components/home-blog'
import { HomeCatalog } from '@/components/home-catalog'
import { HomeHero } from '@/components/home-hero'
import { HomePromos } from '@/components/home-promos'
import { useFeaturedNftQuery, useNftsQuery } from '@/hooks/useNft'
import type { NftListParams } from '@/types/nft'
import { compactCatalogSearch, toNftListParams, validateCatalogSearch } from '@/utils/catalog-search.helper'

export function Home() {
  const search = validateCatalogSearch(useSearch({ strict: false }))
  const navigate = useNavigate()
  const params = toNftListParams(search)
  const nfts = useNftsQuery(params)
  const { data: featured } = useFeaturedNftQuery()

  const updateParams = useCallback(
    (changes: Partial<NftListParams>) => {
      navigate({
        to: '/',
        search: (previous) => compactCatalogSearch({ ...validateCatalogSearch(previous), ...changes }),
        resetScroll: false,
      })
    },
    [navigate],
  )

  const handleSearch = useCallback(
    (q: string) => {
      navigate({
        to: '/',
        search: (previous) => compactCatalogSearch({ ...validateCatalogSearch(previous), q, page: 1 }),
        replace: true,
        resetScroll: false,
      })
    },
    [navigate],
  )

  function handleClear() {
    navigate({ to: '/', search: {}, resetScroll: false })
  }

  return (
    <div className="flex flex-col gap-4 md:gap-24">
      <CatalogMobileBar
        facets={nfts.data?.facets}
        params={params}
        onParamsChange={updateParams}
        onSearch={handleSearch}
      />
      <HomeHero />
      <HomeCatalog
        nfts={nfts.data?.data ?? []}
        featured={featured}
        facets={nfts.data?.facets}
        total={nfts.data?.total}
        totalPages={nfts.data?.totalPages ?? 0}
        isLoading={nfts.isPending}
        isUpdating={nfts.isFetching && !nfts.isPending}
        isError={nfts.isError && !nfts.data}
        onRetry={() => nfts.refetch()}
        params={params}
        onParamsChange={updateParams}
        onSearch={handleSearch}
        onClear={handleClear}
      />
      <HomePromos />
      <HomeBlog />
    </div>
  )
}
