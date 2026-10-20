import { http, HttpResponse } from 'msw'
import { requireUser } from '@/mocks/auth'
import { applyDisruption, buildQuote, getCart, userCartKey } from '@/mocks/cart'
import { getDb, updateDb } from '@/mocks/db'
import type { StoredOrder } from '@/mocks/db/schema'
import { apiError } from '@/mocks/errors'
import { hang, simulateNetwork } from '@/mocks/network'
import { scheduleSettlement, settleDueOrders, SETTLE_DELAY_MS, toPublicOrder } from '@/mocks/orders'
import { getScenario } from '@/mocks/scenarios'
import type { CreateOrderInput } from '@/types/order'
import { isValidEmail } from '@/utils/validation.helper'

const IDEMPOTENCY_HEADER = 'Idempotency-Key'

function outdatedQuote(message: string) {
  return apiError(409, 'QUOTE_OUTDATED', message)
}

function validateBuyer(input: CreateOrderInput) {
  const fieldErrors: Record<string, string> = {}
  if (!input.buyer?.name?.trim()) fieldErrors.name = 'Informe seu nome de exibição.'
  if (!isValidEmail(input.buyer?.email?.trim() ?? '')) fieldErrors.email = 'Informe um e-mail válido.'
  return fieldErrors
}

export const orderHandlers = [
  http.post<never, CreateOrderInput>('/api/orders', async ({ request }) => {
    const failure = await simulateNetwork()
    if (failure) return failure

    const user = requireUser(request)
    if (user instanceof Response) return user

    const idempotencyKey = request.headers.get(IDEMPOTENCY_HEADER)
    if (!idempotencyKey) return apiError(422, 'VALIDATION_ERROR', 'Cabeçalho Idempotency-Key é obrigatório.')

    const input = await request.json()
    const fingerprint = JSON.stringify([user.id, input.quoteId, input.walletId, input.network, input.buyer])
    const ownerKey = userCartKey(user.id)

    const previous = getDb().idempotency[idempotencyKey]
    if (previous) {
      if (previous.fingerprint !== fingerprint) {
        return apiError(409, 'IDEMPOTENCY_CONFLICT', 'Esta chave já foi usada em outro pedido.')
      }
      settleDueOrders()
      return HttpResponse.json(toPublicOrder(getDb().orders[previous.orderId]))
    }

    const fieldErrors = validateBuyer(input)
    if (Object.keys(fieldErrors).length > 0) {
      return apiError(422, 'VALIDATION_ERROR', 'Verifique os campos destacados.', { fieldErrors })
    }

    if (applyDisruption(ownerKey)) {
      return outdatedQuote('O preço ou a disponibilidade de um item mudou. Revise e confirme novamente.')
    }

    const result = updateDb((db): Response | StoredOrder => {
      const quote = db.quotes[input.quoteId]
      if (!quote || quote.ownerKey !== ownerKey) return outdatedQuote('A cotação não é mais válida. Revise o pedido.')
      if (quote.expiresAt < new Date().toISOString()) return outdatedQuote('A cotação expirou. Revise o pedido.')
      if (quote.lines.length === 0) return apiError(422, 'VALIDATION_ERROR', 'Seu carrinho está vazio.')

      const current = buildQuote(db, getCart(db, ownerKey))
      const sameLines =
        current.lines.length === quote.lines.length &&
        current.lines.every((line) =>
          quote.lines.some(
            (quoted) =>
              quoted.editionId === line.editionId &&
              quoted.quantity === line.quantity &&
              quoted.unitPrice === line.unitPrice,
          ),
        )
      if (current.issues.length > 0 || !sameLines || current.total !== quote.total) {
        return outdatedQuote('O preço, a disponibilidade ou o cupom mudou. Revise e confirme novamente.')
      }

      const wallet = db.wallets.find((item) => item.id === input.walletId && item.userId === user.id)
      if (!wallet) return apiError(422, 'VALIDATION_ERROR', 'Selecione uma carteira válida.')
      if (!wallet.networks.includes(input.network)) {
        return apiError(422, 'VALIDATION_ERROR', 'Esta carteira não opera na rede escolhida.')
      }

      const now = new Date()
      const order: StoredOrder = {
        id: `ord-${crypto.randomUUID()}`,
        userId: user.id,
        ownerKey,
        idempotencyKey,
        quoteId: quote.id,
        status: 'pending',
        outcome: getScenario() === 'payment-declined' ? 'declined' : 'confirmed',
        settlesAt: new Date(now.getTime() + SETTLE_DELAY_MS).toISOString(),
        items: quote.lines.map(({ available: _available, ...line }) => line),
        couponCode: quote.couponCode,
        subtotal: quote.subtotal,
        discount: quote.discount,
        networkFee: quote.networkFee,
        total: quote.total,
        walletId: wallet.id,
        walletAddress: wallet.address,
        network: input.network,
        buyer: input.buyer,
        txHash: null,
        explorerUrl: null,
        declineReason: null,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        version: 1,
      }

      db.orders[order.id] = order
      db.idempotency[idempotencyKey] = { orderId: order.id, fingerprint }
      return order
    })

    if (result instanceof Response) return result
    scheduleSettlement()
    if (getScenario() === 'order-timeout') await hang()
    return HttpResponse.json(toPublicOrder(result), { status: 201 })
  }),

  http.get<{ id: string }>('/api/orders/:id', async ({ params, request }) => {
    const failure = await simulateNetwork()
    if (failure) return failure

    const user = requireUser(request)
    if (user instanceof Response) return user

    settleDueOrders()
    const order = getDb().orders[params.id]
    if (!order || order.userId !== user.id) return apiError(404, 'NOT_FOUND', 'Pedido não encontrado.')
    return HttpResponse.json(toPublicOrder(order))
  }),
]
