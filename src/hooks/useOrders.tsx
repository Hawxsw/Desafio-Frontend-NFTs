import { useMutation, useQuery } from '@tanstack/react-query'
import { useSessionQuery } from '@/hooks/useAuth'
import { orderService } from '@/services/api/clients/order.service'
import type { CreateOrderInput } from '@/types/order'

export const orderKeys = {
  all: ['orders'] as const,
  detail: (userId: string, id: string) => [...orderKeys.all, userId, id] as const,
}

export interface CreateOrderVariables {
  input: CreateOrderInput
  idempotencyKey: string
}

export function useCreateOrderMutation() {
  return useMutation({
    mutationFn: async ({ input, idempotencyKey }: CreateOrderVariables) =>
      (await orderService.create(input, idempotencyKey)).data,
  })
}

export function useOrderQuery(id: string) {
  const { data: user } = useSessionQuery()
  return useQuery({
    queryKey: orderKeys.detail(user?.id ?? 'anonymous', id),
    queryFn: async ({ signal }) => (await orderService.get(id, signal)).data,
    enabled: Boolean(user),
  })
}
