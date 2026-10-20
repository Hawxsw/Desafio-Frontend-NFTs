import type { EthAmount } from './common'

export interface CartItem {
  nftId: string
  editionId: string
  quantity: number
  unitPrice: EthAmount
}

export interface Cart {
  ownerKey: string
  items: CartItem[]
  couponCode: string | null
  updatedAt: string
  version: number
}
