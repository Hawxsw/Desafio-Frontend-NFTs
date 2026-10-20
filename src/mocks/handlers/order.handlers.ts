import { http, HttpResponse } from 'msw'
import { requireUser } from '@/mocks/auth'
import { updateDb } from '@/mocks/db'
import { apiError } from '@/mocks/errors'
import { hang, simulateNetwork } from '@/mocks/network'
import { getScenario } from '@/mocks/scenarios'
import type { Network } from '@/types/common'
import type { CreateOrderInput, Order } from '@/types/order'
import { compareEth } from '@/utils/money.helper'
import { GUEST_OWNER } from './cart.handlers'

const IDEMPOTENCY_HEADER = 'Idempotency-Key'

const EXPLORERS: Record<Network, string> = {
  ethereum: 'https://etherscan.io/tx/',
  polygon: 'https://polygonscan.com/tx/',
  solana: 'https://solscan.io/tx/',
}

function randomTxHash() {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return `0x${Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')}`
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
    const fingerprint = JSON.stringify([user.id, input.quoteId, input.walletId, input.network])
    const scenario = getScenario()

    const result = updateDb((db): Response | Order => {
      const previous = db.idempotency[idempotencyKey]
      if (previous) {
        if (previous.fingerprint !== fingerprint) {
          return apiError(409, 'IDEMPOTENCY_CONFLICT', 'Esta chave já foi usada em outro pedido.')
        }
        return db.orders[previous.orderId]
      }

      const quote = db.quotes[input.quoteId]
      if (!quote || quote.lines.length === 0) return apiError(404, 'NOT_FOUND', 'Cotação não encontrada.')
      if (quote.expiresAt < new Date().toISOString()) {
        return apiError(409, 'CONFLICT', 'A cotação expirou. Revise o carrinho e tente novamente.')
      }

      const wallet = db.wallets.find((item) => item.id === input.walletId && item.userId === user.id)
      if (!wallet) return apiError(422, 'VALIDATION_ERROR', 'Selecione uma carteira válida.')
      if (!wallet.networks.includes(input.network)) {
        return apiError(422, 'VALIDATION_ERROR', 'Esta carteira não opera na rede escolhida.')
      }

      for (const line of quote.lines) {
        const edition = db.nfts.find((nft) => nft.id === line.nftId)?.editions.find((item) => item.id === line.editionId)
        if (!edition) return apiError(404, 'NOT_FOUND', `${line.name} não está mais disponível.`)
        if (scenario === 'price-changed' || compareEth(edition.price, line.unitPrice) !== 0) {
          return apiError(409, 'PRICE_CHANGED', `O preço de ${line.name} mudou. Revise o carrinho.`, {
            details: { nftId: line.nftId, editionId: line.editionId },
          })
        }
        if (scenario === 'sold-out' || edition.available < line.quantity) {
          return apiError(409, 'AVAILABILITY_CONFLICT', `${line.name} (${line.editionName}) esgotou.`, {
            details: { nftId: line.nftId, editionId: line.editionId, available: edition.available },
          })
        }
      }

      const declined = scenario === 'payment-declined'
      const txHash = declined ? null : randomTxHash()
      const now = new Date().toISOString()
      const order: Order = {
        id: `ord-${crypto.randomUUID()}`,
        userId: user.id,
        idempotencyKey,
        quoteId: quote.id,
        status: declined ? 'declined' : 'confirmed',
        items: quote.lines.map((line) => ({
          nftId: line.nftId,
          editionId: line.editionId,
          name: line.name,
          editionName: line.editionName,
          image: line.image,
          tokenId: line.tokenId,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          lineTotal: line.lineTotal,
        })),
        couponCode: quote.couponCode,
        subtotal: quote.subtotal,
        discount: quote.discount,
        networkFee: quote.networkFee,
        total: quote.total,
        walletId: wallet.id,
        walletAddress: wallet.address,
        network: input.network,
        buyer: input.buyer,
        txHash,
        explorerUrl: txHash ? `${EXPLORERS[input.network]}${txHash}` : null,
        declineReason: declined ? 'A carteira recusou a assinatura da transação.' : null,
        createdAt: now,
        updatedAt: now,
        version: 1,
      }

      db.orders[order.id] = order
      db.idempotency[idempotencyKey] = { orderId: order.id, fingerprint }

      if (!declined) {
        for (const line of quote.lines) {
          const nft = db.nfts.find((item) => item.id === line.nftId)
          const edition = nft?.editions.find((item) => item.id === line.editionId)
          if (nft && edition) {
            edition.available -= line.quantity
            nft.version += 1
          }
        }
        delete db.quotes[quote.id]
        const cart = db.carts[GUEST_OWNER]
        if (cart) {
          cart.items = []
          cart.couponCode = null
          cart.updatedAt = now
          cart.version += 1
        }
      }

      return order
    })

    if (result instanceof Response) return result
    if (scenario === 'order-timeout') await hang()
    return HttpResponse.json(result, { status: 201 })
  }),
]
