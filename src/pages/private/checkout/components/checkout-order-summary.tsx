import { Link } from '@tanstack/react-router'
import type { Quote } from '@/types/quote'
import { formatEth } from '@/utils/money.helper'

interface CheckoutOrderSummaryProps {
  quote: Quote
}

export function CheckoutOrderSummary({ quote }: CheckoutOrderSummaryProps) {
  return (
    <section aria-labelledby="checkout-items-title" className="hidden flex-col gap-3 lg:flex">
      <h2 id="checkout-items-title" className="text-[17px] leading-4 font-bold">
        Seus NFTs
      </h2>
      <div aria-hidden className="flex items-center justify-between text-base leading-4 font-bold">
        <span>NFTs</span>
        <span>Subtotal</span>
      </div>
      <ul className="flex flex-col gap-3">
        {quote.lines.map((line) => (
          <li key={line.editionId} className="flex h-[70px] items-center gap-2 bg-surface-card pr-4 pl-1">
            <img src={line.image} alt="" width={62} height={62} className="size-[62px] rounded-lg object-cover" />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="truncate text-base leading-4 font-bold">{line.name}</span>
              <span className="text-sm leading-4 text-muted-foreground">
                ID do token: #{line.tokenId.padStart(4, '0')}
              </span>
            </div>
            <span className="text-sm leading-4 text-text-secondary">
              <span className="sr-only">Quantidade: </span>(x {line.quantity})
            </span>
            <span className="text-right text-lg leading-4 font-bold text-text-accent">
              <span className="sr-only">Subtotal: </span>
              {formatEth(line.lineTotal)}
            </span>
          </li>
        ))}
      </ul>

      <p className="text-center text-sm leading-4">
        Tem um código promocional?{' '}
        <Link to="/carrinho" className="text-text-accent hover:underline">
          Aplique aqui
        </Link>
      </p>

      <dl className="flex flex-col gap-3">
        <TotalsRow label="Subtotal" value={formatEth(quote.subtotal)} />
        <TotalsRow label="Desconto do lançamento" value={`(-) ${formatEth(quote.discount)}`} />
        <div className="flex flex-col gap-1">
          <TotalsRow label="Taxa de rede" value={formatEth(quote.networkFee)} />
          <span className="text-center text-xs leading-4 text-text-accent">Taxa estimada</span>
        </div>
        <div className="flex w-[321px] items-center justify-between self-center border-t-[0.3px] border-primary pt-3 text-lg leading-4 font-bold">
          <dt>Total</dt>
          <dd className="text-text-accent">{formatEth(quote.total)}</dd>
        </div>
      </dl>
    </section>
  )
}

interface TotalsRowProps {
  label: string
  value: string
}

function TotalsRow({ label, value }: TotalsRowProps) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-body leading-none">{label}</dt>
      <dd className="text-right text-lg leading-4">{value}</dd>
    </div>
  )
}
