import type { EthAmount, Network } from './common'
import type { QuoteLine } from './quote'

export type OrderStatus = 'pending' | 'confirmed' | 'declined'

export type OrderItem = Omit<QuoteLine, 'available'>

export interface Buyer {
  name: string
  email: string
  phone: string
}

export interface Order {
  id: string
  userId: string
  idempotencyKey: string
  quoteId: string
  status: OrderStatus
  items: OrderItem[]
  couponCode: string | null
  subtotal: EthAmount
  discount: EthAmount
  networkFee: EthAmount
  total: EthAmount
  walletId: string
  walletAddress: string
  network: Network
  buyer: Buyer
  txHash: string | null
  explorerUrl: string | null
  declineReason: string | null
  createdAt: string
  updatedAt: string
  version: number
}

export interface CreateOrderInput {
  quoteId: string
  walletId: string
  network: Network
  buyer: Buyer
}
