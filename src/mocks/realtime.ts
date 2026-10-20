import { toSocketIo } from '@mswjs/socket.io-binding'
import { ws } from 'msw'
import { findUserByToken } from '@/mocks/auth'
import { getScenario } from '@/mocks/scenarios'
import type { Nft } from '@/types/nft'
import type { Order } from '@/types/order'
import type { AnyRealtimeEvent, NftUpdatedEvent, OrderUpdatedEvent } from '@/types/realtime'

const SOCKET_PATH = '/socket.io/'

const ENGINE_PING_PACKET = '2'
const SOCKET_CONNECT_PREFIX = '40'
const PING_INTERVAL_MS = 20_000
const REJECT_DELAY_MS = 50

interface RealtimeClient {
  userId: string | null
  emit: (event: AnyRealtimeEvent) => void
  close: () => void
}

type ReadyListener = (client: RealtimeClient) => void

const clients = new Set<RealtimeClient>()
const readyListeners = new Set<ReadyListener>()
const history: AnyRealtimeEvent[] = []
let blocked = false

const socketLink = ws.link(location.origin.replace(/^http/, 'ws'))

function parseAuthToken(payload: string): unknown {
  try {
    return (JSON.parse(payload || '{}') as { token?: unknown }).token
  } catch {
    return null
  }
}

export const realtimeHandlers = [
  socketLink.addEventListener('connection', (connection) => {
    if (connection.client.url.pathname !== SOCKET_PATH) {
      connection.server.connect()
      return
    }
    if (blocked || getScenario() === 'offline') {
      setTimeout(() => connection.client.close(), REJECT_DELAY_MS)
      return
    }

    const io = toSocketIo(connection)
    const client: RealtimeClient = {
      userId: null,
      emit: (event) => io.client.emit(event.type, event),
      close: () => connection.client.close(),
    }
    const ping = setInterval(() => connection.client.send(ENGINE_PING_PACKET), PING_INTERVAL_MS)

    connection.client.addEventListener('message', (message) => {
      if (typeof message.data !== 'string' || !message.data.startsWith(SOCKET_CONNECT_PREFIX)) return
      client.userId = findUserByToken(parseAuthToken(message.data.slice(SOCKET_CONNECT_PREFIX.length)))?.id ?? null
      clients.add(client)
      readyListeners.forEach((listener) => listener(client))
    })

    connection.client.addEventListener('close', () => {
      clearInterval(ping)
      clients.delete(client)
    })
  }),
]

export function onRealtimeReady(listener: ReadyListener): void {
  readyListeners.add(listener)
}

function deliver(event: AnyRealtimeEvent, userId?: string) {
  history.push(event)
  clients.forEach((client) => {
    if (userId === undefined || client.userId === userId) client.emit(event)
  })
}

export function publishNftUpdated(nft: Nft): void {
  const event: NftUpdatedEvent = {
    id: `evt-${crypto.randomUUID()}`,
    type: 'nft.updated',
    resource: { type: 'nft', id: nft.id },
    version: nft.version,
    occurredAt: new Date().toISOString(),
    data: structuredClone(nft),
  }
  deliver(event)
}

export function publishOrderUpdated(order: Order): void {
  const event: OrderUpdatedEvent = {
    id: `evt-${crypto.randomUUID()}`,
    type: 'order.updated',
    resource: { type: 'order', id: order.id },
    version: order.version,
    occurredAt: new Date().toISOString(),
    data: structuredClone(order),
  }
  deliver(event, order.userId)
}

export function replayLastEvent(): AnyRealtimeEvent | null {
  const last = history.at(-1)
  if (!last) return null
  clients.forEach((client) => {
    if (last.type === 'nft.updated' || client.userId === last.data.userId) client.emit(last)
  })
  return last
}

export function replayStaleNftEvent(nftId: string): NftUpdatedEvent | null {
  const events = history.filter(
    (event): event is NftUpdatedEvent => event.type === 'nft.updated' && event.resource.id === nftId,
  )
  const latest = events.at(-1)
  if (!latest) return null
  const previous = events.at(-2)
  const staleVersion = previous?.version ?? latest.version - 1
  const stale: NftUpdatedEvent = {
    ...(previous ?? latest),
    id: `evt-${crypto.randomUUID()}`,
    version: staleVersion,
    data: { ...(previous ?? latest).data, version: staleVersion },
  }
  clients.forEach((client) => client.emit(stale))
  return stale
}

export function disconnectRealtime(options: { block: boolean }): void {
  blocked = options.block
  clients.forEach((client) => client.close())
  clients.clear()
}

export function restoreRealtime(): void {
  blocked = false
}
