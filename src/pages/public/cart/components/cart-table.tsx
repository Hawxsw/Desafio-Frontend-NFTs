import { Link } from '@tanstack/react-router'
import { Trash2 } from 'lucide-react'
import { QuantityStepper } from '@/components/shared/quantity-stepper'
import type { QuoteLine } from '@/types/quote'
import { formatEth } from '@/utils/money.helper'

interface CartTableProps {
  lines: QuoteLine[]
  onQuantityChange: (line: QuoteLine, quantity: number) => void
  onRemove: (line: QuoteLine) => void
}

export function CartTable({ lines, onQuantityChange, onRemove }: CartTableProps) {
  return (
    <div className="hidden min-w-0 flex-1 flex-col gap-3 lg:flex xl:max-w-[782px]">
      <div aria-hidden className="flex h-[18px] items-center justify-between pr-6 text-base leading-4 font-bold">
        <span className="w-[250px]">NFTs</span>
        <span className="w-[77px]">Preço</span>
        <span className="w-[75px]">Edições</span>
        <span className="w-[87px]">Total</span>
        <span className="w-6" />
      </div>
      <hr className="border-0 border-t-[0.3px] border-primary" />
      <ul className="flex flex-col gap-3">
        {lines.map((line) => (
          <li key={line.editionId} className="flex h-[70px] items-center justify-between bg-surface-card pr-6">
            <div className="flex w-[250px] items-center gap-[18px]">
              <img src={line.image} alt="" width={70} height={70} className="size-[70px] rounded-md object-cover" />
              <div className="flex min-w-0 flex-col gap-1.5">
                <Link
                  to="/nft/$nftId"
                  params={{ nftId: line.nftId }}
                  className="truncate text-base leading-4 font-bold hover:text-text-accent"
                >
                  {line.name}
                </Link>
                <span className="text-sm leading-4 text-muted-foreground">
                  ID do token: #{line.tokenId.padStart(4, '0')}
                </span>
              </div>
            </div>
            <span className="w-[77px] text-base leading-4 font-bold text-text-secondary">
              <span className="sr-only">Preço: </span>
              {formatEth(line.unitPrice)}
            </span>
            <QuantityStepper
              value={line.quantity}
              max={line.available}
              onChange={(quantity) => onQuantityChange(line, quantity)}
              size="lg"
              className="w-[75px]"
            />
            <span className="w-[87px] text-base leading-4 font-bold text-text-accent">
              <span className="sr-only">Total: </span>
              {formatEth(line.lineTotal)}
            </span>
            <button
              type="button"
              aria-label={`Remover ${line.name}`}
              onClick={() => onRemove(line)}
              className="flex size-6 items-center justify-center text-muted-foreground transition-colors hover:text-text-accent"
            >
              <Trash2 strokeWidth={1.5} className="size-6" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
