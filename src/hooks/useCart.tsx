import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useSessionQuery } from '@/hooks/useAuth'
import { announce } from '@/lib/announcer'
import { cartService, type AddCartItemInput, type UpdateCartItemInput } from '@/services/api/clients/cart.service'
import type { Quote } from '@/types/quote'

export const GUEST_CART_OWNER = 'guest'

export const cartKeys = {
  all: ['cart'] as const,
  quote: (owner: string) => [...cartKeys.all, 'quote', owner] as const,
}

export function useCartOwner() {
  const { data: user } = useSessionQuery()
  return user?.id ?? GUEST_CART_OWNER
}

function useSetQuote() {
  const queryClient = useQueryClient()
  const owner = useCartOwner()
  return (quote: Quote) => queryClient.setQueryData(cartKeys.quote(owner), quote)
}

export function useCartQuery() {
  const owner = useCartOwner()
  const session = useSessionQuery()
  return useQuery({
    queryKey: cartKeys.quote(owner),
    queryFn: async ({ signal }) => (await cartService.get(signal)).data,
    enabled: !session.isPending,
  })
}

export function useCartCount() {
  const { data } = useCartQuery()
  return data?.lines.reduce((sum, line) => sum + line.quantity, 0) ?? 0
}

export function useAddToCartMutation() {
  const setQuote = useSetQuote()
  return useMutation({
    mutationFn: async (input: AddCartItemInput) => (await cartService.addItem(input)).data,
    onSuccess: (quote) => {
      setQuote(quote)
      announce('Item adicionado ao carrinho.')
    },
  })
}

export function useUpdateCartItemMutation() {
  const setQuote = useSetQuote()
  return useMutation({
    mutationFn: async (input: UpdateCartItemInput) => (await cartService.updateItem(input)).data,
    onSuccess: (quote) => {
      setQuote(quote)
      announce('Quantidade atualizada.')
    },
  })
}

export function useRemoveCartItemMutation() {
  const setQuote = useSetQuote()
  return useMutation({
    mutationFn: async (editionId: string) => (await cartService.removeItem(editionId)).data,
    onSuccess: (quote) => {
      setQuote(quote)
      announce('Item removido do carrinho.')
    },
  })
}

export function useApplyCouponMutation() {
  const setQuote = useSetQuote()
  return useMutation({
    mutationFn: async (code: string) => (await cartService.applyCoupon(code)).data,
    onSuccess: (quote) => {
      setQuote(quote)
      announce(`Cupom ${quote.couponCode} aplicado.`)
    },
  })
}

export function useRemoveCouponMutation() {
  const setQuote = useSetQuote()
  return useMutation({
    mutationFn: async () => (await cartService.removeCoupon()).data,
    onSuccess: (quote) => {
      setQuote(quote)
      announce('Cupom removido.')
    },
  })
}

export function useAcceptCartChangesMutation() {
  const setQuote = useSetQuote()
  return useMutation({
    mutationFn: async () => (await cartService.acceptChanges()).data,
    onSuccess: (quote) => {
      setQuote(quote)
      announce('Resumo atualizado com os novos valores.')
    },
  })
}
