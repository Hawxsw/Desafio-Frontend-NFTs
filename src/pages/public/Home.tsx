import { useState } from 'react'
import { CatalogMobileBar } from '@/components/catalog-mobile-bar'
import { HomeBlog } from '@/components/home-blog'
import { HomeCatalog } from '@/components/home-catalog'
import { HomeHero } from '@/components/home-hero'
import { HomePromos } from '@/components/home-promos'
import { useFeaturedNftQuery, useNftsQuery } from '@/hooks/useNft'
import type { NftListParams } from '@/types/nft'

export function Home() {
  const [params, setParams] = useState<NftListParams>({ tab: 'all', sort: 'recent', page: 1 })
  const { data, isPending } = useNftsQuery(params)
  const { data: featured } = useFeaturedNftQuery()

  function updateParams(changes: Partial<NftListParams>) {
    setParams((current) => ({ ...current, ...changes }))
  }

  return (
    <div className="flex flex-col gap-4 md:gap-24">
      <CatalogMobileBar facets={data?.facets} params={params} onParamsChange={updateParams} />
      <HomeHero />
      <HomeCatalog
        nfts={data?.data ?? []}
        featured={featured}
        facets={data?.facets}
        totalPages={data?.totalPages ?? 0}
        isLoading={isPending}
        params={params}
        onParamsChange={updateParams}
      />
      <HomePromos />
      <HomeBlog />
    </div>
  )
}
