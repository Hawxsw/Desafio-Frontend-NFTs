import { useMutation } from '@tanstack/react-query'
import { orderService } from '@/services/api/clients/order.service'
import type { CreateOrderInput } from '@/types/order'

interface CreateOrderVariables {
  input: CreateOrderInput
  idempotencyKey: string
}

export function useCreateOrderMutation() {
  return useMutation({
    mutationFn: async ({ input, idempotencyKey }: CreateOrderVariables) =>
      (await orderService.create(input, idempotencyKey)).data,
  })
}
