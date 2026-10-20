import { io, type Socket } from 'socket.io-client'
import type { AnyRealtimeEvent } from '@/types/realtime'

export const SOCKET_PATH = '/socket.io/'
const MAX_SEEN_EVENTS = 500
const CONNECT_TIMEOUT_MS = 4000

export type RealtimeStatus = 'connecting' | 'connected' | 'reconnecting' | 'offline'

type Listener = () => void

let status: RealtimeStatus = 'connecting'
const statusListeners = new Set<Listener>()

export function setRealtimeStatus(next: RealtimeStatus) {
  if (status === next) return
  status = next
  statusListeners.forEach((listener) => listener())
}

export function subscribeRealtimeStatus(listener: Listener) {
  statusListeners.add(listener)
  return () => {
    statusListeners.delete(listener)
  }
}

export function getRealtimeStatus() {
  return status
}

export function createRealtimeSocket(token: string | null): Socket {
  return io({
    path: SOCKET_PATH,
    transports: ['websocket'],
    auth: token ? { token } : {},
    timeout: CONNECT_TIMEOUT_MS,
    reconnectionDelay: 500,
    reconnectionDelayMax: 3000,
  })
}

export class RealtimeEventTracker {
  private readonly seen = new Set<string>()
  private readonly versions = new Map<string, number>()

  accept(event: AnyRealtimeEvent): boolean {
    if (this.seen.has(event.id)) return false
    this.seen.add(event.id)
    if (this.seen.size > MAX_SEEN_EVENTS) this.seen.delete(this.seen.values().next().value as string)

    const key = `${event.resource.type}:${event.resource.id}`
    const known = this.versions.get(key) ?? 0
    if (event.version <= known) return false
    this.versions.set(key, event.version)
    return true
  }
}
