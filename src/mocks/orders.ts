import { getCart, touch } from '@/mocks/cart'
import { getDb, updateDb } from '@/mocks/db'
import type { StoredOrder } from '@/mocks/db/schema'
import { onRealtimeReady, publishNftUpdated, publishOrderUpdated } from '@/mocks/realtime'
import type { Network } from '@/types/common'
import type { Nft } from '@/types/nft'
import type { Order } from '@/types/order'

export const SETTLE_DELAY_MS = 3000

const EXPLORERS: Record<Network, string> = {
  ethereum: 'https://etherscan.io/tx/',
  polygon: 'https://polygonscan.com/tx/',
  solana: 'https://solscan.io/tx/',
}

const DECLINE_REASON = 'A carteira recusou a assinatura da transação.'

function randomTxHash() {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return `0x${Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')}`
}

export function toPublicOrder({ ownerKey: _ownerKey, settlesAt: _settlesAt, outcome: _outcome, ...order }: StoredOrder): Order {
  return structuredClone(order)
}

export function settleDueOrders(): void {
  const now = new Date()
  const hasDue = Object.values(getDb().orders).some(
    (order) => order.status === 'pending' && new Date(order.settlesAt) <= now,
  )
  if (!hasDue) return

  const { orders, nfts } = updateDb((db) => {
    const settled: Order[] = []
    const touched = new Map<string, Nft>()

    for (const order of Object.values(db.orders)) {
      if (order.status !== 'pending' || new Date(order.settlesAt) > now) continue

      if (order.outcome === 'confirmed') {
        const txHash = randomTxHash()
        order.status = 'confirmed'
        order.txHash = txHash
        order.explorerUrl = `${EXPLORERS[order.network]}${txHash}`

        for (const item of order.items) {
          const nft = db.nfts.find((entry) => entry.id === item.nftId)
          const edition = nft?.editions.find((entry) => entry.id === item.editionId)
          if (!nft || !edition) continue
          edition.available = Math.max(0, edition.available - item.quantity)
          nft.version += 1
          touched.set(nft.id, nft)
        }

        const cart = getCart(db, order.ownerKey)
        cart.items = cart.items.flatMap((cartItem) => {
          const bought = order.items.find((item) => item.editionId === cartItem.editionId)
          if (!bought) return [cartItem]
          const remaining = cartItem.quantity - bought.quantity
          return remaining > 0 ? [{ ...cartItem, quantity: remaining }] : []
        })
        if (cart.couponCode === order.couponCode) cart.couponCode = null
        touch(cart)
      } else {
        order.status = 'declined'
        order.declineReason = DECLINE_REASON
      }

      order.updatedAt = now.toISOString()
      order.version += 1
      settled.push(toPublicOrder(order))
    }

    return { orders: settled, nfts: [...touched.values()].map((nft) => structuredClone(nft)) }
  })

  nfts.forEach(publishNftUpdated)
  orders.forEach(publishOrderUpdated)
}

export function scheduleSettlement(): void {
  setTimeout(settleDueOrders, SETTLE_DELAY_MS + 50)
}

onRealtimeReady(() => settleDueOrders())
