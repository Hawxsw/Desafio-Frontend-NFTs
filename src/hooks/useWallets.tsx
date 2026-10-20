import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSessionQuery } from '@/hooks/useAuth'
import { walletService } from '@/services/api/clients/wallet.service'
import type { Network } from '@/types/common'
import type { WalletInput } from '@/types/wallet'

export const walletKeys = {
  all: ['wallets'] as const,
  list: (userId: string) => [...walletKeys.all, userId] as const,
}

export function useWalletsQuery() {
  const { data: user } = useSessionQuery()
  return useQuery({
    queryKey: walletKeys.list(user?.id ?? 'anonymous'),
    queryFn: async ({ signal }) => (await walletService.getAll(signal)).data,
    enabled: Boolean(user),
  })
}

interface SaveWalletVariables {
  id?: string
  input: WalletInput
}

export function useSaveWalletMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, input }: SaveWalletVariables) =>
      (id ? await walletService.update(id, input) : await walletService.create(input)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: walletKeys.all }),
  })
}

interface ConnectWalletVariables {
  walletId: string
  network: Network
}

export function useConnectWalletMutation() {
  return useMutation({
    mutationFn: async ({ walletId, network }: ConnectWalletVariables) =>
      (await walletService.connect(walletId, network)).data,
  })
}
