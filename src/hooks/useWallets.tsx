import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { walletService } from '@/services/api/clients/wallet.service'
import type { WalletInput } from '@/types/wallet'

export const walletKeys = {
  all: ['wallets'] as const,
  list: () => [...walletKeys.all, 'list'] as const,
}

export function useWalletsQuery() {
  return useQuery({
    queryKey: walletKeys.list(),
    queryFn: async ({ signal }) => (await walletService.getAll(signal)).data,
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
