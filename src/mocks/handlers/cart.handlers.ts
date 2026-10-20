import { http, HttpResponse } from 'msw'
import { getDb, updateDb } from '@/mocks/db'
import type { MockDatabase } from '@/mocks/db/schema'
import { apiError } from '@/mocks/errors'
import { simulateNetwork } from '@/mocks/network'
import type { Cart } from '@/types/cart'
import type { Quote, QuoteIssue, QuoteLine } from '@/types/quote'
import { addEth, applyBps, compareEth, mulEth, subEth } from '@/utils/money.helper'

export const GUEST_OWNER = 'guest'
const NETWORK_FEE = '0.016'
const QUOTE_TTL_MS = 5 * 60 * 1000

interface AddItemBody {
  nftId: string
  editionId: string
  quantity: number
}

interface UpdateItemBody {
  quantity: number
}

interface CouponBody {
  code: string
}

function emptyCart(ownerKey: string): Cart {
  return { ownerKey, items: [], couponCode: null, updatedAt: new Date().toISOString(), version: 1 }
}

function getCart(db: MockDatabase, ownerKey: string): Cart {
  db.carts[ownerKey] ??= emptyCart(ownerKey)
  return db.carts[ownerKey]
}

function touch(cart: Cart) {
  cart.updatedAt = new Date().toISOString()
  cart.version += 1
}

function findEdition(db: MockDatabase, nftId: string, editionId: string) {
  const nft = db.nfts.find((item) => item.id === nftId)
  const edition = nft?.editions.find((item) => item.id === editionId)
  return nft && edition ? { nft, edition } : null
}

function maxQuantity(available: number, maxPerOrder: number) {
  return Math.min(available, maxPerOrder)
}

function isValidQuantity(quantity: unknown): quantity is number {
  return typeof quantity === 'number' && Number.isInteger(quantity) && quantity >= 1
}

function activeCoupon(db: MockDatabase, code: string | null) {
  if (!code) return null
  const coupon = db.coupons.find((item) => item.code === code)
  if (!coupon || coupon.expiresAt < new Date().toISOString()) return null
  return coupon
}

function buildQuote(db: MockDatabase, cart: Cart): Quote {
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

  const coupon = activeCoupon(db, cart.couponCode)
  const subtotal = addEth(...lines.map((line) => line.lineTotal))
  const discount = coupon ? applyBps(subtotal, coupon.discountBps) : '0'
  const networkFee = lines.length > 0 ? NETWORK_FEE : '0'
  const firstNft = db.nfts.find((nft) => nft.id === lines[0]?.nftId)
  const createdAt = new Date()

  return {
    id: `qt-${createdAt.getTime()}`,
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

function quoteResponse(db: MockDatabase, cart: Cart) {
  const quote = buildQuote(db, cart)
  db.quotes[quote.id] = quote
  return HttpResponse.json(quote)
}

export const cartHandlers = [
  http.get('/api/cart', async () => {
    const failure = await simulateNetwork()
    if (failure) return failure

    return updateDb((db) => quoteResponse(db, getCart(db, GUEST_OWNER)))
  }),

  http.post<never, AddItemBody>('/api/cart/items', async ({ request }) => {
    const failure = await simulateNetwork()
    if (failure) return failure

    const body = await request.json()
    if (!isValidQuantity(body.quantity)) {
      return apiError(422, 'VALIDATION_ERROR', 'Quantidade inválida.', {
        fieldErrors: { quantity: 'Informe uma quantidade inteira maior que zero.' },
      })
    }

    const found = findEdition(getDb(), body.nftId, body.editionId)
    if (!found) return apiError(404, 'NOT_FOUND', 'NFT ou edição não encontrada.')

    return updateDb((db) => {
      const cart = getCart(db, GUEST_OWNER)
      const existing = cart.items.find((item) => item.editionId === body.editionId)
      const quantity = (existing?.quantity ?? 0) + body.quantity
      const available = maxQuantity(found.edition.available, found.edition.maxPerOrder)

      if (quantity > available) {
        return apiError(409, 'AVAILABILITY_CONFLICT', `Só é possível levar ${available} unidade(s) desta edição.`, {
          details: { available },
        })
      }

      if (existing) {
        existing.quantity = quantity
        existing.unitPrice = found.edition.price
      } else {
        cart.items.push({
          nftId: body.nftId,
          editionId: body.editionId,
          quantity,
          unitPrice: found.edition.price,
        })
      }
      touch(cart)
      return quoteResponse(db, cart)
    })
  }),

  http.patch<{ editionId: string }, UpdateItemBody>('/api/cart/items/:editionId', async ({ params, request }) => {
    const failure = await simulateNetwork()
    if (failure) return failure

    const body = await request.json()
    if (!isValidQuantity(body.quantity)) {
      return apiError(422, 'VALIDATION_ERROR', 'Quantidade inválida.', {
        fieldErrors: { quantity: 'Informe uma quantidade inteira maior que zero.' },
      })
    }

    return updateDb((db) => {
      const cart = getCart(db, GUEST_OWNER)
      const item = cart.items.find((entry) => entry.editionId === params.editionId)
      if (!item) return apiError(404, 'NOT_FOUND', 'Item não está no carrinho.')

      const found = findEdition(db, item.nftId, item.editionId)
      if (!found) return apiError(404, 'NOT_FOUND', 'NFT ou edição não encontrada.')

      const available = maxQuantity(found.edition.available, found.edition.maxPerOrder)
      if (body.quantity > available) {
        return apiError(409, 'AVAILABILITY_CONFLICT', `Só é possível levar ${available} unidade(s) desta edição.`, {
          details: { available },
        })
      }

      item.quantity = body.quantity
      touch(cart)
      return quoteResponse(db, cart)
    })
  }),

  http.delete<{ editionId: string }>('/api/cart/items/:editionId', async ({ params }) => {
    const failure = await simulateNetwork()
    if (failure) return failure

    return updateDb((db) => {
      const cart = getCart(db, GUEST_OWNER)
      cart.items = cart.items.filter((item) => item.editionId !== params.editionId)
      touch(cart)
      return quoteResponse(db, cart)
    })
  }),

  http.put<never, CouponBody>('/api/cart/coupon', async ({ request }) => {
    const failure = await simulateNetwork()
    if (failure) return failure

    const { code } = await request.json()
    const normalized = code.trim().toUpperCase()

    return updateDb((db) => {
      const coupon = db.coupons.find((item) => item.code === normalized)
      if (!coupon) return apiError(422, 'COUPON_INVALID', 'Cupom inválido.')
      if (coupon.expiresAt < new Date().toISOString()) return apiError(422, 'COUPON_EXPIRED', 'Este cupom expirou.')

      const cart = getCart(db, GUEST_OWNER)
      cart.couponCode = coupon.code
      touch(cart)
      return quoteResponse(db, cart)
    })
  }),
]
