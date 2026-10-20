import { getDb, updateDb } from '@/mocks/db'
import type { StoredUser } from '@/mocks/db/schema'
import { apiError } from '@/mocks/errors'
import { getScenario } from '@/mocks/scenarios'
import type { Session, User } from '@/types/user'

const BEARER_PREFIX = 'Bearer '

export async function hashPassword(userId: string, password: string): Promise<string> {
  const data = new TextEncoder().encode(`${userId}:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function toPublicUser(user: StoredUser): User {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    email: user.email,
    phone: user.phone,
    ensName: user.ensName,
    referralCode: user.referralCode,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

export function requireUser(request: Request): StoredUser | Response {
  const scenario = getScenario()
  if (scenario === 'forbidden') return apiError(403, 'FORBIDDEN', 'Você não tem permissão para acessar este recurso.')

  const header = request.headers.get('Authorization')
  if (!header?.startsWith(BEARER_PREFIX)) return apiError(401, 'UNAUTHORIZED', 'Entre na sua conta para continuar.')

  const user = findUserByToken(header.slice(BEARER_PREFIX.length))
  if (!user) return apiError(401, 'UNAUTHORIZED', 'Sua sessão expirou. Entre novamente.')
  return user
}

export function hasAuthorization(request: Request): boolean {
  return Boolean(request.headers.get('Authorization')?.startsWith(BEARER_PREFIX))
}

export function findUserByToken(token: unknown): StoredUser | null {
  if (typeof token !== 'string') return null
  const db = getDb()
  const session = db.sessions.find((item) => item.token === token)
  if (!session || session.expiresAt <= new Date().toISOString()) return null
  return db.users.find((item) => item.id === session.userId) ?? null
}

export function expireSessions(): void {
  const now = new Date().toISOString()
  updateDb((db) => {
    db.sessions.forEach((session) => {
      session.expiresAt = now
    })
  })
}

const SESSION_TTL_MS = 8 * 60 * 60 * 1000
const SHORT_SESSION_TTL_MS = 20 * 1000

export function createSession(user: StoredUser): Session {
  const ttl = getScenario() === 'session-expired' ? SHORT_SESSION_TTL_MS : SESSION_TTL_MS
  const session: Session = {
    token: crypto.randomUUID(),
    user: toPublicUser(user),
    expiresAt: new Date(Date.now() + ttl).toISOString(),
  }
  updateDb((db) => {
    db.sessions.push({ token: session.token, userId: user.id, expiresAt: session.expiresAt })
  })
  return session
}
