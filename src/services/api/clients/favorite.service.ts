import type { AxiosInstance } from 'axios'
import { api } from '@/services/api/api'
import type { FavoritesResponse } from '@/types/favorite'

export class FavoriteService {
  private readonly api: AxiosInstance

  constructor(instance: AxiosInstance) {
    this.api = instance
  }

  getAll(signal?: AbortSignal) {
    return this.api.get<FavoritesResponse>('/favorites', { signal })
  }

  add(nftId: string) {
    return this.api.put<FavoritesResponse>(`/favorites/${nftId}`)
  }

  remove(nftId: string) {
    return this.api.delete<FavoritesResponse>(`/favorites/${nftId}`)
  }
}

export const favoriteService = new FavoriteService(api)
