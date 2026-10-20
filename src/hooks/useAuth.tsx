import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { cartKeys } from '@/hooks/useCart'
import { favoriteKeys } from '@/hooks/useFavorites'
import { orderKeys } from '@/hooks/useOrders'
import { walletKeys } from '@/hooks/useWallets'
import { announce } from '@/lib/announcer'
import { authService, type LoginInput } from '@/services/api/clients/auth.service'
import { cartService } from '@/services/api/clients/cart.service'
import { userService } from '@/services/api/clients/user.service'
import type { ChangePasswordInput, RegisterInput, Session, UpdateProfileInput } from '@/types/user'
import { clearSessionToken, getSessionToken, setSessionToken } from '@/utils/session-token.helper'

export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
}

export function clearPrivateData(queryClient: QueryClient) {
  queryClient.removeQueries({ queryKey: walletKeys.all })
  queryClient.removeQueries({ queryKey: favoriteKeys.all })
  queryClient.removeQueries({ queryKey: orderKeys.all })
  queryClient.removeQueries({ queryKey: cartKeys.all })
}

export function useSessionQuery() {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: async ({ signal }) => (getSessionToken() ? (await authService.me(signal)).data : null),
    retry: false,
    staleTime: Infinity,
  })
}

function useStartSession() {
  const queryClient = useQueryClient()
  return async (session: Session) => {
    clearPrivateData(queryClient)
    setSessionToken(session.token)
    try {
      const quote = (await cartService.mergeGuestCart()).data
      queryClient.setQueryData(cartKeys.quote(session.user.id), quote)
    } finally {
      queryClient.setQueryData(authKeys.me(), session.user)
    }
  }
}

export function useLoginMutation() {
  const startSession = useStartSession()
  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const session = (await authService.login(input)).data
      await startSession(session)
      return session
    },
    onSuccess: (session) => announce(`Bem-vindo, ${session.user.name}.`),
  })
}

export function useRegisterMutation() {
  const startSession = useStartSession()
  return useMutation({
    mutationFn: async (input: RegisterInput) => {
      const session = (await authService.register(input)).data
      await startSession(session)
      return session
    },
    onSuccess: () => announce('Conta criada com sucesso.'),
  })
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: UpdateProfileInput) => (await userService.updateProfile(input)).data,
    onSuccess: (user) => queryClient.setQueryData(authKeys.me(), user),
  })
}

export function useUpdateAvatarMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (dataUrl: string | null) =>
      (dataUrl ? await userService.updateAvatar({ dataUrl }) : await userService.removeAvatar()).data,
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.me(), user)
      announce(user.avatarUrl ? 'Avatar atualizado.' : 'Avatar removido.')
    },
  })
}

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: async (input: ChangePasswordInput) => {
      await userService.changePassword(input)
    },
  })
}

export function useLogoutMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      await authService.logout()
    },
    onSettled: () => {
      clearSessionToken()
      clearPrivateData(queryClient)
      queryClient.setQueryData(authKeys.me(), null)
      announce('Você saiu da sua conta.')
    },
  })
}
