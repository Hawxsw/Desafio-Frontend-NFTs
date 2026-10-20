import { http, HttpResponse } from 'msw'
import { requireUser } from '@/mocks/auth'
import { getDb, updateDb } from '@/mocks/db'
import { apiError } from '@/mocks/errors'
import { simulateNetwork } from '@/mocks/network'
import { getScenario } from '@/mocks/scenarios'
import type { FavoritesResponse } from '@/types/favorite'

function favoritesOf(userId: string): FavoritesResponse {
  const db = getDb()
  const nftIds = db.favorites[userId] ?? []
  return { nftIds, nfts: nftIds.flatMap((id) => db.nfts.filter((nft) => nft.id === id)) }
}

function favoritesUnavailable() {
  return apiError(503, 'SERVICE_UNAVAILABLE', 'Não foi possível salvar o favorito. Tente novamente.')
}

export const favoriteHandlers = [
  http.get('/api/favorites', async ({ request }) => {
    const failure = await simulateNetwork()
    if (failure) return failure

    const user = requireUser(request)
    if (user instanceof Response) return user
    return HttpResponse.json(favoritesOf(user.id))
  }),

  http.put<{ nftId: string }>('/api/favorites/:nftId', async ({ params, request }) => {
    const failure = await simulateNetwork()
    if (failure) return failure

    const user = requireUser(request)
    if (user instanceof Response) return user
    if (getScenario() === 'favorites-error') return favoritesUnavailable()
    if (!getDb().nfts.some((nft) => nft.id === params.nftId)) return apiError(404, 'NOT_FOUND', 'NFT não encontrado.')

    updateDb((db) => {
      const current = db.favorites[user.id] ?? []
      if (!current.includes(params.nftId)) db.favorites[user.id] = [...current, params.nftId]
    })
    return HttpResponse.json(favoritesOf(user.id))
  }),

  http.delete<{ nftId: string }>('/api/favorites/:nftId', async ({ params, request }) => {
    const failure = await simulateNetwork()
    if (failure) return failure

    const user = requireUser(request)
    if (user instanceof Response) return user
    if (getScenario() === 'favorites-error') return favoritesUnavailable()

    updateDb((db) => {
      db.favorites[user.id] = (db.favorites[user.id] ?? []).filter((id) => id !== params.nftId)
    })
    return HttpResponse.json(favoritesOf(user.id))
  }),
]
