import { Link } from '@tanstack/react-router'
import { useId, useState, type FormEvent } from 'react'
import type { Quote } from '@/types/quote'
import { formatEth } from '@/utils/money.helper'

interface CartSummaryProps {
  quote: Quote
  onApplyCoupon?: (code: string) => void
  onRemoveCoupon?: () => void
  couponPending?: boolean
  couponError?: string
  onCheckout?: () => void
  checkoutBlocked?: boolean
}

export function CartSummary({
  quote,
  onApplyCoupon,
  onRemoveCoupon,
  couponPending = false,
  couponError,
  onCheckout,
  checkoutBlocked = false,
}: CartSummaryProps) {
  const couponErrorId = useId()
  const couponId = useId()
  const [coupon, setCoupon] = useState(quote.couponCode ?? '')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (coupon.trim()) onApplyCoupon?.(coupon.trim())
  }

  return (
    <section
      aria-labelledby="cart-summary-title"
      className="mt-auto flex min-h-[342px] flex-col justify-between gap-5 rounded-t-[40px] bg-surface-card px-6 pt-6 pb-9 lg:mt-0 lg:min-h-0 lg:w-[332px] lg:flex-none lg:justify-start lg:gap-6 lg:rounded-none lg:bg-transparent lg:p-0"
    >
      <h2
        id="cart-summary-title"
        className="sr-only lg:not-sr-only lg:border-b-[0.3px] lg:border-primary lg:pb-3 lg:text-lg lg:leading-4 lg:font-bold"
      >
        Resumo da carteira
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <label htmlFor={couponId} className="sr-only lg:not-sr-only lg:text-sm lg:leading-4 lg:font-bold">
          Código promocional
        </label>
        <div className="flex h-[50px] items-center overflow-hidden rounded-[40px] border border-surface-border bg-surface-card lg:h-10 lg:rounded-[3px] lg:border-primary lg:bg-transparent">
          <input
            id={couponId}
            value={coupon}
            onChange={(event) => setCoupon(event.target.value)}
            placeholder="Digite o código promocional..."
            autoComplete="off"
            aria-invalid={couponError ? true : undefined}
            aria-describedby={couponError ? couponErrorId : undefined}
            className="h-full min-w-0 flex-1 bg-transparent pl-[18px] text-[13px] leading-[22px] placeholder:text-muted-foreground focus:outline-none lg:pl-2 lg:text-xs lg:leading-4"
          />
          <button
            type="submit"
            disabled={!onApplyCoupon || couponPending}
            title={onApplyCoupon ? undefined : 'Disponível em breve'}
            className="h-full w-[97px] shrink-0 rounded-[40px] bg-linear-to-r from-primary/55 to-primary text-body leading-4 font-bold text-text-primary disabled:cursor-not-allowed lg:w-[102px] lg:rounded-none lg:rounded-r-[3px] lg:bg-primary lg:bg-none lg:text-ink"
          >
            Aplicar
          </button>
        </div>
        {couponError && (
          <p id={couponErrorId} role="alert" className="text-xs leading-4 text-destructive">
            {couponError}
          </p>
        )}
        {quote.couponCode && onRemoveCoupon && (
          <p className="flex items-center justify-between gap-2 text-xs leading-4">
            <span>
              Cupom <strong className="text-text-accent">{quote.couponCode}</strong> aplicado
            </span>
            <button
              type="button"
              onClick={() => {
                setCoupon('')
                onRemoveCoupon()
              }}
              disabled={couponPending}
              className="text-text-accent underline disabled:opacity-60"
            >
              Remover cupom
            </button>
          </p>
        )}
      </form>

      <dl className="flex flex-col gap-3">
        <SummaryRow label="Subtotal" value={formatEth(quote.subtotal)} />
        <SummaryRow label="Desconto do lançamento" value={`(-) ${formatEth(quote.discount)}`} />
        <div className="flex flex-col gap-1">
          <SummaryRow label="Taxa de rede" value={formatEth(quote.networkFee)} />
          <span className="text-right text-xs leading-4 text-text-accent">Taxa estimada</span>
        </div>
        <div className="flex items-center justify-between text-lg leading-4 font-bold lg:mt-3">
          <dt>Total</dt>
          <dd className="text-text-accent">
            {formatEth(quote.total)}
          </dd>
        </div>
      </dl>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          disabled={!onCheckout || checkoutBlocked}
          title={onCheckout ? undefined : 'Disponível em breve'}
          onClick={onCheckout}
          className="h-[60px] rounded-[40px] bg-linear-to-r from-primary to-primary/80 text-lg leading-4 font-bold text-ink disabled:cursor-not-allowed disabled:opacity-60 lg:h-10 lg:rounded-[3px] lg:bg-primary lg:bg-none lg:text-body"
        >
          Conectar e finalizar
        </button>
        <Link to="/" hash="catalogo" className="hidden text-center text-body leading-none text-text-accent lg:block">
          Continuar explorando
        </Link>
      </div>
    </section>
  )
}

interface SummaryRowProps {
  label: string
  value: string
}

function SummaryRow({ label, value }: SummaryRowProps) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-body leading-none">{label}</dt>
      <dd className="text-right text-lg leading-4">{value}</dd>
    </div>
  )
}
