import type { Nft } from './nft'
import type { Order } from './order'

export type RealtimeResourceType = 'nft' | 'order'

export interface RealtimeEvent<Type extends string, Data> {
  id: string
  type: Type
  resource: { type: RealtimeResourceType; id: string }
  version: number
  occurredAt: string
  data: Data
}

export type NftUpdatedEvent = RealtimeEvent<'nft.updated', Nft>

export type OrderUpdatedEvent = RealtimeEvent<'order.updated', Order>

export type AnyRealtimeEvent = NftUpdatedEvent | OrderUpdatedEvent
