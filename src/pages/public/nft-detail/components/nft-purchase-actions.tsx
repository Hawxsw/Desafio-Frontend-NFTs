import { Link } from '@tanstack/react-router'
import { Heart } from 'lucide-react'
import { QuantityStepper } from '@/components/shared/quantity-stepper'

interface NftPurchaseActionsProps {
  quantity: number
  maxQuantity: number
  onQuantityChange: (value: number) => void
  soldOut: boolean
  onBuyNow?: () => void
  pending?: boolean
}

export function NftPurchaseActions({
  quantity,
  maxQuantity,
  onQuantityChange,
  soldOut,
  onBuyNow,
  pending = false,
}: NftPurchaseActionsProps) {
  return (
    <div className="hidden items-center justify-between lg:flex">
      <QuantityStepper value={quantity} max={maxQuantity} onChange={onQuantityChange} disabled={soldOut} size="xl" />
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={soldOut || !onBuyNow || pending}
          title={onBuyNow ? undefined : 'Disponível em breve'}
          onClick={onBuyNow}
          className="h-10 w-[130px] rounded-md bg-primary text-sm leading-5 font-bold text-ink uppercase disabled:cursor-not-allowed disabled:opacity-60"
        >
          {soldOut ? 'Esgotado' : 'Comprar'}
        </button>
        <Link
          to="/login"
          className="flex h-10 w-[130px] items-center justify-center gap-2 rounded-md border border-primary text-sm leading-5 font-medium text-text-accent transition-colors hover:bg-primary hover:text-ink"
        >
          <Heart className="size-4" />
          Favoritar
        </Link>
      </div>
    </div>
  )
}
