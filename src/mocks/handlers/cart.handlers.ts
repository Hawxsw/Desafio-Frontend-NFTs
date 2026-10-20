import { http } from 'msw'
import { requireUser } from '@/mocks/auth'
import {
  CART_ID_HEADER,
  findEdition,
  getCart,
  guestCartKey,
  maxQuantity,
  quoteResponse,
  resolveCartOwner,
  scheduleDisruption,
  touch,
  userCartKey,
} from '@/mocks/cart'
import { getDb, updateDb } from '@/mocks/db'
import { apiError } from '@/mocks/errors'
import { simulateNetwork } from '@/mocks/network'

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

function isValidQuantity(quantity: unknown): quantity is number {
  return typeof quantity === 'number' && Number.isInteger(quantity) && quantity >= 1
}

function invalidQuantity() {
  return apiError(422, 'VALIDATION_ERROR', 'Quantidade inválida.', {
    fieldErrors: { quantity: 'Informe uma quantidade inteira maior que zero.' },
  })
}

function availabilityConflict(available: number) {
  return apiError(409, 'AVAILABILITY_CONFLICT', `Só é possível levar ${available} unidade(s) desta edição.`, {
    details: { available },
  })
}

export const cartHandlers = [
  http.get('/api/cart', async ({ request }) => {
    const failure = await simulateNetwork()
    if (failure) return failure

    const owner = resolveCartOwner(request)
    if (owner instanceof Response) return owner

    const response = updateDb((db) => quoteResponse(db, getCart(db, owner)))
    scheduleDisruption(owner)
    return response
  }),

  http.post<never, AddItemBody>('/api/cart/items', async ({ request }) => {
    const failure = await simulateNetwork()
    if (failure) return failure

    const owner = resolveCartOwner(request)
    if (owner instanceof Response) return owner

    const body = await request.json()
    if (!isValidQuantity(body.quantity)) return invalidQuantity()

    const found = findEdition(getDb(), body.nftId, body.editionId)
    if (!found) return apiError(404, 'NOT_FOUND', 'NFT ou edição não encontrada.')

    const response = updateDb((db) => {
      const cart = getCart(db, owner)
      const existing = cart.items.find((item) => item.editionId === body.editionId)
      const quantity = (existing?.quantity ?? 0) + body.quantity
      const available = maxQuantity(found.edition.available, found.edition.maxPerOrder)
      if (quantity > available) return availabilityConflict(available)

      if (existing) {
        existing.quantity = quantity
        existing.unitPrice = found.edition.price
      } else {
        cart.items.push({ nftId: body.nftId, editionId: body.editionId, quantity, unitPrice: found.edition.price })
      }
      touch(cart)
      return quoteResponse(db, cart)
    })
    scheduleDisruption(owner)
    return response
  }),

  http.patch<{ editionId: string }, UpdateItemBody>('/api/cart/items/:editionId', async ({ params, request }) => {
    const failure = await simulateNetwork()
    if (failure) return failure

    const owner = resolveCartOwner(request)
    if (owner instanceof Response) return owner

    const body = await request.json()
    if (!isValidQuantity(body.quantity)) return invalidQuantity()

    return updateDb((db) => {
      const cart = getCart(db, owner)
      const item = cart.items.find((entry) => entry.editionId === params.editionId)
      if (!item) return apiError(404, 'NOT_FOUND', 'Item não está no carrinho.')

      const found = findEdition(db, item.nftId, item.editionId)
      if (!found) return apiError(404, 'NOT_FOUND', 'NFT ou edição não encontrada.')

      const available = maxQuantity(found.edition.available, found.edition.maxPerOrder)
      if (body.quantity > available) return availabilityConflict(available)

      item.quantity = body.quantity
      touch(cart)
      return quoteResponse(db, cart)
    })
  }),

  http.delete<{ editionId: string }>('/api/cart/items/:editionId', async ({ params, request }) => {
    const failure = await simulateNetwork()
    if (failure) return failure

    const owner = resolveCartOwner(request)
    if (owner instanceof Response) return owner

    return updateDb((db) => {
      const cart = getCart(db, owner)
      cart.items = cart.items.filter((item) => item.editionId !== params.editionId)
      touch(cart)
      return quoteResponse(db, cart)
    })
  }),

  http.put<never, CouponBody>('/api/cart/coupon', async ({ request }) => {
    const failure = await simulateNetwork()
    if (failure) return failure

    const owner = resolveCartOwner(request)
    if (owner instanceof Response) return owner

    const { code = '' } = await request.json()
    const normalized = code.trim().toUpperCase()

    return updateDb((db) => {
      const coupon = db.coupons.find((item) => item.code === normalized)
      if (!coupon) return apiError(422, 'COUPON_INVALID', 'Cupom inválido.', { fieldErrors: { code: 'Cupom inválido.' } })
      if (coupon.expiresAt < new Date().toISOString()) {
        return apiError(422, 'COUPON_EXPIRED', 'Este cupom expirou.', { fieldErrors: { code: 'Este cupom expirou.' } })
      }

      const cart = getCart(db, owner)
      cart.couponCode = coupon.code
      touch(cart)
      return quoteResponse(db, cart)
    })
  }),

  http.delete('/api/cart/coupon', async ({ request }) => {
    const failure = await simulateNetwork()
    if (failure) return failure

    const owner = resolveCartOwner(request)
    if (owner instanceof Response) return owner

    return updateDb((db) => {
      const cart = getCart(db, owner)
      cart.couponCode = null
      touch(cart)
      return quoteResponse(db, cart)
    })
  }),

  http.post('/api/cart/accept-changes', async ({ request }) => {
    const failure = await simulateNetwork()
    if (failure) return failure

    const owner = resolveCartOwner(request)
    if (owner instanceof Response) return owner

    return updateDb((db) => {
      const cart = getCart(db, owner)
      cart.items = cart.items.flatMap((item) => {
        const found = findEdition(db, item.nftId, item.editionId)
        if (!found) return []
        const available = maxQuantity(found.edition.available, found.edition.maxPerOrder)
        if (available === 0) return []
        return [{ ...item, unitPrice: found.edition.price, quantity: Math.min(item.quantity, available) }]
      })
      const coupon = db.coupons.find((item) => item.code === cart.couponCode)
      if (!coupon || coupon.expiresAt < new Date().toISOString()) cart.couponCode = null
      touch(cart)
      return quoteResponse(db, cart)
    })
  }),

  http.post('/api/cart/merge', async ({ request }) => {
    const failure = await simulateNetwork()
    if (failure) return failure

    const user = requireUser(request)
    if (user instanceof Response) return user

    const cartId = request.headers.get(CART_ID_HEADER)
    const owner = userCartKey(user.id)

    return updateDb((db) => {
      const cart = getCart(db, owner)
      const guestKey = cartId ? guestCartKey(cartId) : null
      const guest = guestKey ? db.carts[guestKey] : undefined

      if (guest && guestKey) {
        for (const guestItem of guest.items) {
          const found = findEdition(db, guestItem.nftId, guestItem.editionId)
          if (!found) continue
          const available = maxQuantity(found.edition.available, found.edition.maxPerOrder)
          const existing = cart.items.find((item) => item.editionId === guestItem.editionId)
          if (existing) {
            existing.quantity = Math.min(existing.quantity + guestItem.quantity, Math.max(available, existing.quantity))
          } else {
            cart.items.push({ ...guestItem })
          }
        }
        cart.couponCode ??= guest.couponCode
        delete db.carts[guestKey]
        touch(cart)
      }

      return quoteResponse(db, cart)
    })
  }),
]
