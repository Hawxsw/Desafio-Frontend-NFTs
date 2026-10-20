import { Link, useCanGoBack, useRouter } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import { RelatedNfts } from '@/components/related-nfts'
import { Container } from '@/components/shared/container'
import { Button } from '@/components/shadcn/ui/button'
import {
  useAcceptCartChangesMutation,
  useApplyCouponMutation,
  useCartQuery,
  useRemoveCartItemMutation,
  useRemoveCouponMutation,
  useUpdateCartItemMutation,
} from '@/hooks/useCart'
import type { Quote, QuoteLine } from '@/types/quote'
import { getErrorMessage } from '@/utils/api-error.helper'
import { CartIssues } from './components/cart-issues'
import { CartItemCard } from './components/cart-item-card'
import { CartSummary } from './components/cart-summary'
import { CartTable } from './components/cart-table'

export function Cart() {
  const { data: quote, isPending, isError, refetch } = useCartQuery()
  const updateItem = useUpdateCartItemMutation()
  const removeItem = useRemoveCartItemMutation()
  const applyCoupon = useApplyCouponMutation()
  const removeCoupon = useRemoveCouponMutation()
  const acceptChanges = useAcceptCartChangesMutation()

  if (isPending) {
    return (
      <Container aria-busy="true" className="py-12">
        <p className="text-sm text-text-secondary">Carregando carrinho...</p>
      </Container>
    )
  }

  if (isError) {
    return (
      <Container role="alert" className="flex flex-col items-start gap-4 py-12">
        <h1 className="text-section font-bold">Não foi possível carregar o carrinho</h1>
        <Button type="button" onClick={() => refetch()} className="h-10 rounded-md px-4 text-base font-bold">
          Tentar novamente
        </Button>
      </Container>
    )
  }

  if (quote.lines.length === 0) {
    return (
      <Container className="flex flex-col items-start gap-4 py-12">
        <h1 className="text-section font-bold">Seu carrinho está vazio</h1>
        <p className="text-sm leading-6 text-text-secondary">Explore o catálogo e adicione NFTs para continuar.</p>
        <Button asChild className="h-10 rounded-md px-4 text-base font-bold">
          <Link to="/" hash="catalogo">
            Ver catálogo
          </Link>
        </Button>
      </Container>
    )
  }

  const itemError = updateItem.error ?? removeItem.error ?? acceptChanges.error
  const couponError = applyCoupon.error ?? removeCoupon.error

  return (
    <CartView
      quote={quote}
      onQuantityChange={(line, quantity) => updateItem.mutate({ editionId: line.editionId, quantity })}
      onRemove={(line) => removeItem.mutate(line.editionId)}
      itemError={itemError ? getErrorMessage(itemError) : undefined}
      onApplyCoupon={(code) => applyCoupon.mutate(code)}
      onRemoveCoupon={() => removeCoupon.mutate()}
      couponPending={applyCoupon.isPending || removeCoupon.isPending}
      couponError={couponError ? getErrorMessage(couponError) : undefined}
      onAcceptChanges={() => acceptChanges.mutate()}
      acceptPending={acceptChanges.isPending}
    />
  )
}

interface CartViewProps {
  quote: Quote
  onQuantityChange: (line: QuoteLine, quantity: number) => void
  onRemove: (line: QuoteLine) => void
  itemError?: string
  onApplyCoupon: (code: string) => void
  onRemoveCoupon: () => void
  couponPending: boolean
  couponError?: string
  onAcceptChanges: () => void
  acceptPending: boolean
}

export function CartView({
  quote,
  onQuantityChange,
  onRemove,
  itemError,
  onApplyCoupon,
  onRemoveCoupon,
  couponPending,
  couponError,
  onAcceptChanges,
  acceptPending,
}: CartViewProps) {
  const router = useRouter()
  const canGoBack = useCanGoBack()

  function handleBack() {
    if (canGoBack) router.history.back()
    else router.navigate({ to: '/' })
  }

  return (
    <div className="flex flex-1 flex-col pt-8 lg:mx-auto lg:w-full lg:max-w-page lg:flex-none lg:gap-24 lg:px-10 xl:px-0">
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex h-11 items-center gap-[61px] px-7 lg:hidden">
          <button
            type="button"
            aria-label="Voltar"
            onClick={handleBack}
            className="flex size-[35px] items-center justify-center rounded-full border border-surface-border bg-surface-raised text-muted-foreground"
          >
            <ChevronLeft className="size-5" />
          </button>
          <h1 className="text-xl leading-4 font-bold">Carrinho de NFTs</h1>
        </div>

        <nav aria-label="Trilha de navegação" className="hidden text-body leading-4 font-bold lg:block">
          <ol className="flex items-center gap-[1ch]">
            <li>
              <Link to="/" className="hover:text-text-accent">
                Início
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link to="/" hash="catalogo" className="hover:text-text-accent">
                Mercado
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page">Carrinho</li>
          </ol>
        </nav>

        <CartIssues quote={quote} onAccept={onAcceptChanges} pending={acceptPending} className="mx-7 lg:mx-0" />

        {itemError && (
          <p role="alert" className="px-7 text-sm leading-5 text-destructive lg:px-0">
            {itemError}
          </p>
        )}

        <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:gap-8 xl:justify-between">
          <CartTable lines={quote.lines} onQuantityChange={onQuantityChange} onRemove={onRemove} />
          <ul className="flex flex-col gap-5 px-7 lg:hidden">
            {quote.lines.map((line) => (
              <CartItemCard
                key={line.editionId}
                line={line}
                onQuantityChange={(quantity) => onQuantityChange(line, quantity)}
                onRemove={() => onRemove(line)}
              />
            ))}
          </ul>
          <CartSummary
            quote={quote}
            onApplyCoupon={onApplyCoupon}
            onRemoveCoupon={onRemoveCoupon}
            couponPending={couponPending}
            couponError={couponError}
            onCheckout={() => router.navigate({ to: '/pagamento' })}
            checkoutBlocked={quote.issues.length > 0}
          />
        </div>
      </div>

      <RelatedNfts title="Colecionadores também viram" />
    </div>
  )
}

