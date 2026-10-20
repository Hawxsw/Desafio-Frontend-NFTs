import { useQueryClient, type QueryClient } from '@tanstack/react-query'
import { useEffect, useSyncExternalStore } from 'react'
import { useSessionQuery } from '@/hooks/useAuth'
import { cartKeys } from '@/hooks/useCart'
import { favoriteKeys } from '@/hooks/useFavorites'
import { nftKeys } from '@/hooks/useNft'
import { orderKeys } from '@/hooks/useOrders'
import { announce } from '@/lib/announcer'
import {
  createRealtimeSocket,
  getRealtimeStatus,
  RealtimeEventTracker,
  setRealtimeStatus,
  subscribeRealtimeStatus,
} from '@/lib/realtime'
import type { FavoritesResponse } from '@/types/favorite'
import type { Nft, NftListResponse } from '@/types/nft'
import type { Order } from '@/types/order'
import type { Quote } from '@/types/quote'
import type { NftUpdatedEvent, OrderUpdatedEvent } from '@/types/realtime'
import { getSessionToken } from '@/utils/session-token.helper'

function newer<T extends { version: number }>(current: T, incoming: T) {
  return incoming.version > current.version ? incoming : current
}

function applyNftUpdate(queryClient: QueryClient, event: NftUpdatedEvent) {
  const nft = event.data
  const replace = (item: Nft) => (item.id === nft.id ? newer(item, nft) : item)

  queryClient.setQueryData<Nft>(nftKeys.detail(nft.id), (current) => (current ? newer(current, nft) : current))
  queryClient.setQueryData<Nft>(nftKeys.featured(), (current) => (current ? replace(current) : current))
  queryClient.setQueriesData<NftListResponse>({ queryKey: nftKeys.lists() }, (current) =>
    current ? { ...current, data: current.data.map(replace) } : current,
  )
  queryClient.setQueriesData<FavoritesResponse>({ queryKey: favoriteKeys.all }, (current) =>
    current ? { ...current, nfts: current.nfts.map(replace) } : current,
  )

  const inCart = queryClient
    .getQueriesData<Quote>({ queryKey: cartKeys.all })
    .some(([, quote]) => quote?.lines.some((line) => line.nftId === nft.id))
  if (inCart) {
    queryClient.invalidateQueries({ queryKey: cartKeys.all })
    announce(`O preço ou a disponibilidade de ${nft.name} mudou. O resumo do carrinho foi atualizado.`, 'assertive')
  }
}

function applyOrderUpdate(queryClient: QueryClient, userId: string, event: OrderUpdatedEvent) {
  const order = event.data
  queryClient.setQueryData<Order>(orderKeys.detail(userId, order.id), (current) =>
    current ? newer(current, order) : order,
  )
  if (order.status === 'confirmed') {
    queryClient.invalidateQueries({ queryKey: cartKeys.all })
    queryClient.invalidateQueries({ queryKey: nftKeys.all })
    announce('Pagamento confirmado. Seus NFTs estão na sua carteira.')
  }
  if (order.status === 'declined') announce('Pagamento recusado pela carteira.', 'assertive')
}

function reconcile(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: nftKeys.all, refetchType: 'active' })
  queryClient.invalidateQueries({ queryKey: cartKeys.all, refetchType: 'active' })
  queryClient.invalidateQueries({ queryKey: orderKeys.all, refetchType: 'active' })
}

export function useRealtimeSync() {
  const queryClient = useQueryClient()
  const session = useSessionQuery()
  const userId = session.data?.id ?? null
  const ready = !session.isPending

  useEffect(() => {
    if (!ready) return

    const socket = createRealtimeSocket(userId ? getSessionToken() : null)
    const tracker = new RealtimeEventTracker()
    let connectedBefore = false

    setRealtimeStatus('connecting')

    function handleConnect() {
      setRealtimeStatus('connected')
      if (connectedBefore) reconcile(queryClient)
      connectedBefore = true
    }

    function handleDisconnect() {
      setRealtimeStatus('reconnecting')
    }

    function handleConnectError() {
      setRealtimeStatus(connectedBefore ? 'reconnecting' : 'offline')
    }

    function handleNftUpdated(event: NftUpdatedEvent) {
      if (tracker.accept(event)) applyNftUpdate(queryClient, event)
    }

    function handleOrderUpdated(event: OrderUpdatedEvent) {
      if (!userId || event.data.userId !== userId) return
      if (tracker.accept(event)) applyOrderUpdate(queryClient, userId, event)
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('connect_error', handleConnectError)
    socket.on('nft.updated', handleNftUpdated)
    socket.on('order.updated', handleOrderUpdated)

    return () => {
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('connect_error', handleConnectError)
      socket.off('nft.updated', handleNftUpdated)
      socket.off('order.updated', handleOrderUpdated)
      socket.disconnect()
    }
  }, [queryClient, userId, ready])
}

export function useRealtimeStatus() {
  return useSyncExternalStore(subscribeRealtimeStatus, getRealtimeStatus)
}
