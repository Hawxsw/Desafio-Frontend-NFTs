import { http, HttpResponse } from 'msw'
import { createSession, hashPassword, requireUser, toPublicUser } from '@/mocks/auth'
import { getDb, updateDb } from '@/mocks/db'
import type { StoredUser } from '@/mocks/db/schema'
import { apiError } from '@/mocks/errors'
import { simulateNetwork } from '@/mocks/network'
import type { RegisterInput } from '@/types/user'
import { isValidEmail, isValidUsername, MIN_PASSWORD_LENGTH } from '@/utils/validation.helper'

interface LoginBody {
  email: string
  password: string
}

export const authHandlers = [
  http.post<never, LoginBody>('/api/auth/login', async ({ request }) => {
    const failure = await simulateNetwork()
    if (failure) return failure

    const { email = '', password = '' } = await request.json()
    const fieldErrors: Record<string, string> = {}
    if (!isValidEmail(email)) fieldErrors.email = 'Informe um e-mail válido.'
    if (!password) fieldErrors.password = 'Informe sua senha.'
    if (Object.keys(fieldErrors).length > 0) {
      return apiError(422, 'VALIDATION_ERROR', 'Verifique os campos destacados.', { fieldErrors })
    }

    const user = getDb().users.find((item) => item.email === email.trim().toLowerCase())
    if (!user || (await hashPassword(user.id, password)) !== user.passwordHash) {
      return apiError(401, 'UNAUTHORIZED', 'E-mail ou senha inválidos.')
    }

    return HttpResponse.json(createSession(user))
  }),

  http.post<never, RegisterInput>('/api/auth/register', async ({ request }) => {
    const failure = await simulateNetwork()
    if (failure) return failure

    const { username = '', email = '', password = '' } = await request.json()
    const normalizedEmail = email.trim().toLowerCase()
    const normalizedUsername = username.trim().toLowerCase()
    const db = getDb()

    const fieldErrors: Record<string, string> = {}
    if (!isValidUsername(normalizedUsername)) {
      fieldErrors.username = 'Use de 3 a 20 letras, números, ponto ou sublinhado.'
    } else if (db.users.some((item) => item.username === normalizedUsername)) {
      fieldErrors.username = 'Este nome de usuário já está em uso.'
    }
    if (!isValidEmail(normalizedEmail)) {
      fieldErrors.email = 'Informe um e-mail válido.'
    } else if (db.users.some((item) => item.email === normalizedEmail)) {
      fieldErrors.email = 'Já existe uma conta com este e-mail.'
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      fieldErrors.password = `A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`
    }
    if (Object.keys(fieldErrors).length > 0) {
      return apiError(422, 'VALIDATION_ERROR', 'Verifique os campos destacados.', { fieldErrors })
    }

    const now = new Date().toISOString()
    const id = `usr-${crypto.randomUUID()}`
    const user: StoredUser = {
      id,
      name: normalizedUsername,
      username: normalizedUsername,
      email: normalizedEmail,
      phone: '',
      ensName: null,
      referralCode: null,
      avatarUrl: null,
      passwordHash: await hashPassword(id, password),
      createdAt: now,
      updatedAt: now,
    }
    updateDb((draft) => {
      draft.users.push(user)
      draft.favorites[user.id] = []
    })

    return HttpResponse.json(createSession(user), { status: 201 })
  }),

  http.get('/api/auth/me', async ({ request }) => {
    const failure = await simulateNetwork()
    if (failure) return failure

    const user = requireUser(request)
    if (user instanceof Response) return user
    return HttpResponse.json(toPublicUser(user))
  }),

  http.post('/api/auth/logout', async ({ request }) => {
    const failure = await simulateNetwork()
    if (failure) return failure

    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    updateDb((db) => {
      db.sessions = db.sessions.filter((item) => item.token !== token)
    })
    return new HttpResponse(null, { status: 204 })
  }),
]
