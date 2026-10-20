import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authService, type LoginInput } from '@/services/api/clients/auth.service'
import { userService } from '@/services/api/clients/user.service'
import type { ChangePasswordInput, RegisterInput, Session, UpdateProfileInput } from '@/types/user'
import { walletKeys } from '@/hooks/useWallets'
import { clearSessionToken, getSessionToken, setSessionToken } from '@/utils/session-token.helper'

export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
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
  return (session: Session) => {
    setSessionToken(session.token)
    queryClient.setQueryData(authKeys.me(), session.user)
  }
}

export function useLoginMutation() {
  const startSession = useStartSession()
  return useMutation({
    mutationFn: async (input: LoginInput) => (await authService.login(input)).data,
    onSuccess: startSession,
  })
}

export function useRegisterMutation() {
  const startSession = useStartSession()
  return useMutation({
    mutationFn: async (input: RegisterInput) => (await authService.register(input)).data,
    onSuccess: startSession,
  })
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: UpdateProfileInput) => (await userService.updateProfile(input)).data,
    onSuccess: (user) => queryClient.setQueryData(authKeys.me(), user),
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
      queryClient.setQueryData(authKeys.me(), null)
      queryClient.removeQueries({ queryKey: walletKeys.all })
    },
  })
}
