import { HttpResponse } from 'msw'
import { hasAuthorization, requireUser } from '@/mocks/auth'
import { updateEdition } from '@/mocks/catalog'
import { getDb, updateDb } from '@/mocks/db'
import type { MockDatabase, StoredQuote } from '@/mocks/db/schema'
import { apiError } from '@/mocks/errors'
import { getScenario } from '@/mocks/scenarios'
import type { Cart } from '@/types/cart'
import type { Quote, QuoteIssue, QuoteLine } from '@/types/quote'
import { addEth, applyBps, compareEth, mulEth, subEth } from '@/utils/money.helper'

export const CART_ID_HEADER = 'X-Cart-Id'
const NETWORK_FEE = '0.016'
const QUOTE_TTL_MS = 5 * 60 * 1000
const DISRUPTION_DELAY_MS = 4000
const PRICE_INCREASE_BPS = 1000

export const userCartKey = (userId: string) => `user:${userId}`
export const guestCartKey = (cartId: string) => `guest:${cartId}`

export function resolveCartOwner(request: Request): string | Response {
  if (hasAuthorization(request)) {
    const user = requireUser(request)
    if (user instanceof Response) return user
    return userCartKey(user.id)
  }
  const cartId = request.headers.get(CART_ID_HEADER)
  if (!cartId) return apiError(422, 'VALIDATION_ERROR', 'Identificador do carrinho ausente.')
  return guestCartKey(cartId)
}

function emptyCart(ownerKey: string): Cart {
  return { ownerKey, items: [], couponCode: null, updatedAt: new Date().toISOString(), version: 1 }
}

export function getCart(db: MockDatabase, ownerKey: string): Cart {
  db.carts[ownerKey] ??= emptyCart(ownerKey)
  return db.carts[ownerKey]
}

export function touch(cart: Cart) {
  cart.updatedAt = new Date().toISOString()
  cart.version += 1
}

export function findEdition(db: MockDatabase, nftId: string, editionId: string) {
  const nft = db.nfts.find((item) => item.id === nftId)
  const edition = nft?.editions.find((item) => item.id === editionId)
  return nft && edition ? { nft, edition } : null
}

export function maxQuantity(available: number, maxPerOrder: number) {
  return Math.min(available, maxPerOrder)
}

function activeCoupon(db: MockDatabase, code: string | null) {
  if (!code) return null
  const coupon = db.coupons.find((item) => item.code === code)
  if (!coupon || coupon.expiresAt < new Date().toISOString()) return null
  return coupon
}

export function buildQuote(db: MockDatabase, cart: Cart): StoredQuote {
  const issues: QuoteIssue[] = []
  const lines: QuoteLine[] = []

  for (const item of cart.items) {
    const found = findEdition(db, item.nftId, item.editionId)
    if (!found) continue
    const { nft, edition } = found
    const available = maxQuantity(edition.available, edition.maxPerOrder)

    if (compareEth(item.unitPrice, edition.price) !== 0) {
      issues.push({
        type: 'PRICE_CHANGED',
        nftId: nft.id,
        editionId: edition.id,
        previousPrice: item.unitPrice,
        currentPrice: edition.price,
      })
    }
    if (item.quantity > available) {
      issues.push({
        type: 'INSUFFICIENT_AVAILABILITY',
        nftId: nft.id,
        editionId: edition.id,
        requested: item.quantity,
        available,
      })
    }

    lines.push({
      nftId: nft.id,
      editionId: edition.id,
      name: nft.name,
      editionName: edition.name,
      image: nft.images[0],
      tokenId: nft.tokenId,
      quantity: item.quantity,
      unitPrice: edition.price,
      lineTotal: mulEth(edition.price, item.quantity),
      available,
    })
  }

  if (cart.couponCode) {
    const coupon = db.coupons.find((item) => item.code === cart.couponCode)
    if (!coupon) issues.push({ type: 'COUPON_INVALID', code: cart.couponCode })
    else if (coupon.expiresAt < new Date().toISOString()) issues.push({ type: 'COUPON_EXPIRED', code: cart.couponCode })
  }

  const coupon = activeCoupon(db, cart.couponCode)
  const subtotal = addEth(...lines.map((line) => line.lineTotal))
  const discount = coupon ? applyBps(subtotal, coupon.discountBps) : '0'
  const networkFee = lines.length > 0 ? NETWORK_FEE : '0'
  const firstNft = db.nfts.find((nft) => nft.id === lines[0]?.nftId)
  const createdAt = new Date()

  return {
    id: `qt-${crypto.randomUUID()}`,
    ownerKey: cart.ownerKey,
    lines,
    couponCode: coupon?.code ?? null,
    subtotal,
    discount,
    networkFee,
    total: addEth(subEth(subtotal, discount), networkFee),
    network: firstNft?.network ?? 'ethereum',
    issues,
    createdAt: createdAt.toISOString(),
    expiresAt: new Date(createdAt.getTime() + QUOTE_TTL_MS).toISOString(),
  }
}

export function toPublicQuote({ ownerKey: _ownerKey, ...quote }: StoredQuote): Quote {
  return quote
}

export function quoteResponse(db: MockDatabase, cart: Cart) {
  const now = new Date().toISOString()
  Object.entries(db.quotes)
    .filter(([, quote]) => quote.expiresAt < now)
    .forEach(([id]) => delete db.quotes[id])
  const quote = buildQuote(db, cart)
  db.quotes[quote.id] = quote
  return HttpResponse.json(toPublicQuote(quote))
}

let pendingDisruption: ReturnType<typeof setTimeout> | null = null

export function applyDisruption(ownerKey: string): boolean {
  const scenario = getScenario()
  const db = getDb()
  if (db.disruptionApplied || (scenario !== 'price-changed' && scenario !== 'sold-out')) return false
  const item = db.carts[ownerKey]?.items[0]
  const found = item && findEdition(db, item.nftId, item.editionId)
  if (!item || !found) return false

  updateDb((draft) => {
    draft.disruptionApplied = true
  })
  updateEdition(
    item.nftId,
    item.editionId,
    scenario === 'price-changed'
      ? { price: addEth(found.edition.price, applyBps(found.edition.price, PRICE_INCREASE_BPS)) }
      : { available: 0 },
  )
  return true
}

export function scheduleDisruption(ownerKey: string): void {
  const scenario = getScenario()
  if (pendingDisruption || getDb().disruptionApplied) return
  if (scenario !== 'price-changed' && scenario !== 'sold-out') return
  if (!getDb().carts[ownerKey]?.items.length) return
  pendingDisruption = setTimeout(() => {
    pendingDisruption = null
    applyDisruption(ownerKey)
  }, DISRUPTION_DELAY_MS)
}
