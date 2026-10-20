import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { useSessionQuery } from '@/hooks/useAuth'
import { announce } from '@/lib/announcer'
import { favoriteService } from '@/services/api/clients/favorite.service'
import type { FavoritesResponse } from '@/types/favorite'
import type { Nft } from '@/types/nft'
import { getErrorMessage } from '@/utils/api-error.helper'

export const favoriteKeys = {
  all: ['favorites'] as const,
  list: (userId: string) => [...favoriteKeys.all, userId] as const,
}

export function useFavoritesQuery() {
  const { data: user } = useSessionQuery()
  return useQuery({
    queryKey: favoriteKeys.list(user?.id ?? 'anonymous'),
    queryFn: async ({ signal }) => (await favoriteService.getAll(signal)).data,
    enabled: Boolean(user),
  })
}

interface ToggleFavoriteVariables {
  nft: Nft
  favorite: boolean
}

export function useToggleFavoriteMutation() {
  const queryClient = useQueryClient()
  const { data: user } = useSessionQuery()
  const key = favoriteKeys.list(user?.id ?? 'anonymous')

  return useMutation({
    mutationFn: async ({ nft, favorite }: ToggleFavoriteVariables) =>
      (favorite ? await favoriteService.add(nft.id) : await favoriteService.remove(nft.id)).data,
    onMutate: async ({ nft, favorite }) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<FavoritesResponse>(key)
      if (previous) {
        queryClient.setQueryData<FavoritesResponse>(key, {
          nftIds: favorite ? [...previous.nftIds, nft.id] : previous.nftIds.filter((id) => id !== nft.id),
          nfts: favorite ? [...previous.nfts, nft] : previous.nfts.filter((item) => item.id !== nft.id),
        })
      }
      return { previous }
    },
    onError: (error, { nft }, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous)
      announce(`${nft.name}: ${getErrorMessage(error)}`, 'assertive')
    },
    onSuccess: (data, { nft, favorite }) => {
      queryClient.setQueryData(key, data)
      announce(favorite ? `${nft.name} adicionado aos favoritos.` : `${nft.name} removido dos favoritos.`)
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  })
}

export function useFavoriteToggle() {
  const { data: user } = useSessionQuery()
  const favorites = useFavoritesQuery()
  const toggle = useToggleFavoriteMutation()
  const navigate = useNavigate()
  const location = useLocation()

  function isFavorite(nftId: string) {
    return favorites.data?.nftIds.includes(nftId) ?? false
  }

  function onToggle(nft: Nft) {
    if (!user) {
      navigate({ to: '/login', search: { redirect: location.href } })
      return
    }
    toggle.mutate({ nft, favorite: !isFavorite(nft.id) })
  }

  return { isFavorite, onToggle, authenticated: Boolean(user) }
}
