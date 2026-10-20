import type { EthAmount, Network } from './common'

export interface Coupon {
  code: string
  discountBps: number
  expiresAt: string
}

export interface QuoteLine {
  nftId: string
  editionId: string
  name: string
  editionName: string
  image: string
  quantity: number
  unitPrice: EthAmount
  lineTotal: EthAmount
  available: number
  tokenId: string
}

export type QuoteIssue =
  | {
      type: 'PRICE_CHANGED'
      nftId: string
      editionId: string
      previousPrice: EthAmount
      currentPrice: EthAmount
    }
  | {
      type: 'INSUFFICIENT_AVAILABILITY'
      nftId: string
      editionId: string
      requested: number
      available: number
    }
  | { type: 'COUPON_INVALID' | 'COUPON_EXPIRED'; code: string }

export interface Quote {
  id: string
  lines: QuoteLine[]
  couponCode: string | null
  subtotal: EthAmount
  discount: EthAmount
  networkFee: EthAmount
  total: EthAmount
  network: Network
  issues: QuoteIssue[]
  createdAt: string
  expiresAt: string
}
