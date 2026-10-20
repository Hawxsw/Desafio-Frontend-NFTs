import { Link } from '@tanstack/react-router'
import { QuantityStepper } from '@/components/shared/quantity-stepper'
import type { QuoteLine } from '@/types/quote'
import { formatEth } from '@/utils/money.helper'

interface CartItemCardProps {
  line: QuoteLine
  onQuantityChange: (quantity: number) => void
}

export function CartItemCard({ line, onQuantityChange }: CartItemCardProps) {
  return (
    <li className="relative flex h-[100px] gap-2 rounded-[14px] bg-surface-card shadow-[0_6px_20px_rgba(10,6,4,0.45)]">
      <img src={line.image} alt="" width={100} height={100} className="size-[100px] rounded-[14px] object-cover" />
      <div className="flex min-w-0 flex-1 flex-col pt-[13px]">
        <Link to="/nft/$nftId" params={{ nftId: line.nftId }} className="truncate text-body leading-4 font-bold">
          {line.name}
        </Link>
        <span className="mt-1.5 text-sm leading-4 text-text-secondary">Edição: {line.editionName}</span>
        <span className="mt-[18px] text-lg leading-4 font-bold text-text-accent">
          <span className="sr-only">Total: </span>
          {formatEth(line.lineTotal)}
        </span>
      </div>
      <QuantityStepper
        value={line.quantity}
        max={line.available}
        onChange={onQuantityChange}
        size="circle"
        className="absolute top-[38px] right-4"
      />
    </li>
  )
}
