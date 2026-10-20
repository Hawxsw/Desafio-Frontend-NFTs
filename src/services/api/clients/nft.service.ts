import type { AxiosInstance } from 'axios'
import { api } from '@/services/api/api'
import type { Nft, NftListParams, NftListResponse } from '@/types/nft'

export class NftService {
  private readonly api: AxiosInstance

  constructor(instance: AxiosInstance) {
    this.api = instance
  }

  getAll(params: NftListParams, signal?: AbortSignal) {
    return this.api.get<NftListResponse>('/nfts', { params, signal })
  }

  get(id: string, signal?: AbortSignal) {
    return this.api.get<Nft>(`/nfts/${id}`, { signal })
  }

  getFeatured(signal?: AbortSignal) {
    return this.api.get<Nft>('/nfts/featured', { signal })
  }
}

export const nftService = new NftService(api)
