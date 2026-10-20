import { ShoppingCart } from 'lucide-react'
import type { EthAmount } from '@/types/common'
import { formatEth, mulEth } from '@/utils/money.helper'
import { QuantityStepper } from '@/components/shared/quantity-stepper'

interface NftBuyBarProps {
  price: EthAmount
  quantity: number
  maxQuantity: number
  onQuantityChange: (value: number) => void
  soldOut: boolean
  onBuyNow?: () => void
  onAddToCart?: () => void
  pending?: boolean
}

export function NftBuyBar({
  price,
  quantity,
  maxQuantity,
  onQuantityChange,
  soldOut,
  onBuyNow,
  onAddToCart,
  pending = false,
}: NftBuyBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex flex-col gap-5 rounded-t-[40px] bg-surface-card px-6 pt-5 pb-9 shadow-[0_0_20px_rgba(10,6,4,0.45)] lg:hidden">
      <div className="flex h-[30px] items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-body leading-4 font-medium text-text-secondary">Qtd.</span>
          <QuantityStepper
            value={quantity}
            max={maxQuantity}
            onChange={onQuantityChange}
            disabled={soldOut}
            size="lg"
          />
        </div>
        <p className="text-right text-xl leading-4 font-bold text-text-accent">
          <span className="sr-only">Total: </span>
          {formatEth(mulEth(price, quantity))}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={soldOut || !onBuyNow || pending}
          title={onBuyNow ? undefined : 'Disponível em breve'}
          onClick={onBuyNow}
          className="flex h-[60px] w-[196px] items-center justify-center rounded-[40px] bg-linear-to-r from-primary to-primary/80 py-5 pr-11 pl-12 text-base leading-5 font-bold whitespace-nowrap text-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          {soldOut ? 'Esgotado' : 'Comprar NFT'}
        </button>
        <button
          type="button"
          aria-label="Adicionar ao carrinho"
          disabled={soldOut || !onAddToCart || pending}
          title={onAddToCart ? undefined : 'Disponível em breve'}
          onClick={onAddToCart}
          className="flex size-[60px] shrink-0 items-center justify-center rounded-[40px] border border-surface-border bg-surface-raised p-5 text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ShoppingCart className="size-5" />
        </button>
      </div>
    </div>
  )
}
