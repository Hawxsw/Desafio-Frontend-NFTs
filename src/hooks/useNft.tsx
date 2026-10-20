import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { nftService } from '@/services/api/clients/nft.service'
import type { NftListParams } from '@/types/nft'

export const nftKeys = {
  all: ['nfts'] as const,
  list: (params: NftListParams) => [...nftKeys.all, 'list', params] as const,
  detail: (id: string) => [...nftKeys.all, 'detail', id] as const,
  featured: () => [...nftKeys.all, 'featured'] as const,
}

export function useNftsQuery(params: NftListParams) {
  return useQuery({
    queryKey: nftKeys.list(params),
    queryFn: async ({ signal }) => (await nftService.getAll(params, signal)).data,
    placeholderData: keepPreviousData,
  })
}

export function useNftQuery(id: string) {
  return useQuery({
    queryKey: nftKeys.detail(id),
    queryFn: async ({ signal }) => (await nftService.get(id, signal)).data,
  })
}

export function useFeaturedNftQuery() {
  return useQuery({
    queryKey: nftKeys.featured(),
    queryFn: async ({ signal }) => (await nftService.getFeatured(signal)).data,
  })
}
