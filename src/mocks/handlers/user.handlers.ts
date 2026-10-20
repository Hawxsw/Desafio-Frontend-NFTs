import { http, HttpResponse } from 'msw'
import { hashPassword, requireUser, toPublicUser } from '@/mocks/auth'
import { getDb, updateDb } from '@/mocks/db'
import { apiError } from '@/mocks/errors'
import { simulateNetwork } from '@/mocks/network'
import type { ChangePasswordInput, UpdateAvatarInput, UpdateProfileInput } from '@/types/user'
import { isValidEmail, isValidUsername, MIN_PASSWORD_LENGTH } from '@/utils/validation.helper'

const AVATAR_PATTERN = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/
const MAX_AVATAR_LENGTH = 700_000

function saveAvatar(userId: string, avatarUrl: string | null) {
  return updateDb((db) => {
    const stored = db.users.find((item) => item.id === userId)
    if (!stored) return null
    stored.avatarUrl = avatarUrl
    stored.updatedAt = new Date().toISOString()
    return toPublicUser(stored)
  })
}

export const userHandlers = [
  http.patch<never, UpdateProfileInput>('/api/me', async ({ request }) => {
    const failure = await simulateNetwork()
    if (failure) return failure

    const user = requireUser(request)
    if (user instanceof Response) return user

    const input = await request.json()
    const name = input.name?.trim() ?? ''
    const username = input.username?.trim().toLowerCase() ?? ''
    const email = input.email?.trim().toLowerCase() ?? ''
    const others = getDb().users.filter((item) => item.id !== user.id)

    const fieldErrors: Record<string, string> = {}
    if (name.length < 2) fieldErrors.name = 'Informe seu nome de exibição.'
    if (!isValidUsername(username)) {
      fieldErrors.username = 'Use de 3 a 20 letras, números, ponto ou sublinhado.'
    } else if (others.some((item) => item.username === username)) {
      fieldErrors.username = 'Este nome de usuário já está em uso.'
    }
    if (!isValidEmail(email)) {
      fieldErrors.email = 'Informe um e-mail válido.'
    } else if (others.some((item) => item.email === email)) {
      fieldErrors.email = 'Já existe uma conta com este e-mail.'
    }
    if (Object.keys(fieldErrors).length > 0) {
      return apiError(422, 'VALIDATION_ERROR', 'Verifique os campos destacados.', { fieldErrors })
    }

    const updated = updateDb((db) => {
      const stored = db.users.find((item) => item.id === user.id)
      if (!stored) return null
      stored.name = name
      stored.username = username
      stored.email = email
      stored.ensName = input.ensName?.trim() || null
      stored.referralCode = input.referralCode?.trim() || null
      stored.updatedAt = new Date().toISOString()
      return stored
    })
    if (!updated) return apiError(404, 'NOT_FOUND', 'Usuário não encontrado.')
    return HttpResponse.json(toPublicUser(updated))
  }),

  http.post<never, ChangePasswordInput>('/api/me/password', async ({ request }) => {
    const failure = await simulateNetwork()
    if (failure) return failure

    const user = requireUser(request)
    if (user instanceof Response) return user

    const { currentPassword = '', newPassword = '' } = await request.json()
    if ((await hashPassword(user.id, currentPassword)) !== user.passwordHash) {
      return apiError(422, 'VALIDATION_ERROR', 'Verifique os campos destacados.', {
        fieldErrors: { currentPassword: 'Senha atual incorreta.' },
      })
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return apiError(422, 'VALIDATION_ERROR', 'Verifique os campos destacados.', {
        fieldErrors: { newPassword: `A nova senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.` },
      })
    }

    const passwordHash = await hashPassword(user.id, newPassword)
    updateDb((db) => {
      const stored = db.users.find((item) => item.id === user.id)
      if (stored) {
        stored.passwordHash = passwordHash
        stored.updatedAt = new Date().toISOString()
      }
    })
    return new HttpResponse(null, { status: 204 })
  }),

  http.put<never, UpdateAvatarInput>('/api/me/avatar', async ({ request }) => {
    const failure = await simulateNetwork()
    if (failure) return failure

    const user = requireUser(request)
    if (user instanceof Response) return user

    const { dataUrl = '' } = await request.json()
    if (!AVATAR_PATTERN.test(dataUrl)) {
      return apiError(422, 'VALIDATION_ERROR', 'Verifique os campos destacados.', {
        fieldErrors: { avatar: 'Envie uma imagem PNG, JPG ou WebP.' },
      })
    }
    if (dataUrl.length > MAX_AVATAR_LENGTH) {
      return apiError(422, 'VALIDATION_ERROR', 'Verifique os campos destacados.', {
        fieldErrors: { avatar: 'A imagem precisa ter no máximo 500 KB.' },
      })
    }

    const updated = saveAvatar(user.id, dataUrl)
    if (!updated) return apiError(404, 'NOT_FOUND', 'Usuário não encontrado.')
    return HttpResponse.json(updated)
  }),

  http.delete('/api/me/avatar', async ({ request }) => {
    const failure = await simulateNetwork()
    if (failure) return failure

    const user = requireUser(request)
    if (user instanceof Response) return user

    const updated = saveAvatar(user.id, null)
    if (!updated) return apiError(404, 'NOT_FOUND', 'Usuário não encontrado.')
    return HttpResponse.json(updated)
  }),
]
