import type { EthAmount, Network, Paginated } from './common'

export type NftCategory =
  | 'arte-digital'
  | 'fotografia'
  | 'musica'
  | 'arte-3d'
  | 'colecionaveis'
  | 'generativa'
  | 'jogos'
  | 'assinaturas'
  | 'utilidade'

export interface NftEdition {
  id: string
  name: string
  price: EthAmount
  previousPrice: EthAmount | null
  supply: number
  available: number
  maxPerOrder: number
}

export interface Nft {
  id: string
  name: string
  description: string
  creator: string
  category: NftCategory
  network: Network
  images: string[]
  editions: NftEdition[]
  featured: boolean
  likes: number
  rating: number
  reviewCount: number
  contractAddress: string
  tokenId: string
  attributes: string[]
  createdAt: string
  version: number
}

export type NftSort = 'recent' | 'price-asc' | 'price-desc' | 'popular' | 'name'

export type CatalogTab = 'all' | 'new' | 'trending'

export interface NftListParams {
  q?: string
  tab?: CatalogTab
  exclude?: string
  category?: NftCategory[]
  network?: Network[]
  minPrice?: EthAmount
  maxPrice?: EthAmount
  availableOnly?: boolean
  sort?: NftSort
  page?: number
  pageSize?: number
}

export interface FacetCount<T extends string> {
  value: T
  count: number
}

export interface NftFacets {
  categories: FacetCount<NftCategory>[]
  networks: FacetCount<Network>[]
  priceBounds: [EthAmount, EthAmount]
}

export interface NftListResponse extends Paginated<Nft> {
  facets: NftFacets
}
