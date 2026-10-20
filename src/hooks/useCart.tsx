import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cartService, type AddCartItemInput, type UpdateCartItemInput } from '@/services/api/clients/cart.service'
import type { Quote } from '@/types/quote'

export const cartKeys = {
  all: ['cart'] as const,
  quote: () => [...cartKeys.all, 'quote'] as const,
}

function useSetQuote() {
  const queryClient = useQueryClient()
  return (quote: Quote) => queryClient.setQueryData(cartKeys.quote(), quote)
}

export function useCartQuery() {
  return useQuery({
    queryKey: cartKeys.quote(),
    queryFn: async ({ signal }) => (await cartService.get(signal)).data,
  })
}

export function useAddToCartMutation() {
  const setQuote = useSetQuote()
  return useMutation({
    mutationFn: async (input: AddCartItemInput) => (await cartService.addItem(input)).data,
    onSuccess: setQuote,
  })
}

export function useUpdateCartItemMutation() {
  const setQuote = useSetQuote()
  return useMutation({
    mutationFn: async (input: UpdateCartItemInput) => (await cartService.updateItem(input)).data,
    onSuccess: setQuote,
  })
}

export function useRemoveCartItemMutation() {
  const setQuote = useSetQuote()
  return useMutation({
    mutationFn: async (editionId: string) => (await cartService.removeItem(editionId)).data,
    onSuccess: setQuote,
  })
}

export function useApplyCouponMutation() {
  const setQuote = useSetQuote()
  return useMutation({
    mutationFn: async (code: string) => (await cartService.applyCoupon(code)).data,
    onSuccess: setQuote,
  })
}
