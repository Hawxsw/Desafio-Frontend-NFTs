import type { Nft } from './nft'

export interface FavoritesResponse {
  nftIds: string[]
  nfts: Nft[]
}
