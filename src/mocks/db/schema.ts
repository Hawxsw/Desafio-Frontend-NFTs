import type { Cart } from '@/types/cart'
import type { Nft } from '@/types/nft'
import type { Order } from '@/types/order'
import type { Coupon, Quote } from '@/types/quote'
import type { User } from '@/types/user'
import type { Wallet } from '@/types/wallet'

export interface StoredUser extends User {
  passwordHash: string
}

export interface StoredSession {
  token: string
  userId: string
  expiresAt: string
}

export interface IdempotencyRecord {
  orderId: string
  fingerprint: string
}

export interface StoredQuote extends Quote {
  ownerKey: string
}

export interface StoredOrder extends Order {
  ownerKey: string
  settlesAt: string
  outcome: 'confirmed' | 'declined'
}

export interface MockDatabase {
  schemaVersion: number
  nfts: Nft[]
  users: StoredUser[]
  sessions: StoredSession[]
  wallets: Wallet[]
  coupons: Coupon[]
  favorites: Record<string, string[]>
  carts: Record<string, Cart>
  quotes: Record<string, StoredQuote>
  orders: Record<string, StoredOrder>
  idempotency: Record<string, IdempotencyRecord>
  disruptionApplied: boolean
}
