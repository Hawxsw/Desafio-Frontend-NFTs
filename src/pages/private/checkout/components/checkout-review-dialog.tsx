import { X } from 'lucide-react'
import { Dialog } from 'radix-ui'
import type { RefObject } from 'react'
import { NETWORK_LABELS } from '@/constants/catalog'
import { CartIssues } from '@/pages/public/cart/components/cart-issues'
import type { Network } from '@/types/common'
import type { Buyer } from '@/types/order'
import type { Quote } from '@/types/quote'
import type { Wallet } from '@/types/wallet'
import { formatEth } from '@/utils/money.helper'

interface CheckoutReviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  quote?: Quote
  refreshing: boolean
  changed: boolean
  onAcknowledgeChanges: () => void
  onAcceptIssues: () => void
  acceptPending: boolean
  wallet?: Wallet
  network: Network | ''
  buyer: Buyer
  submitting: boolean
  error?: string
  canRetry: boolean
  onConfirm: () => void
  returnFocusRef: RefObject<HTMLButtonElement | null>
}

export function CheckoutReviewDialog({
  open,
  onOpenChange,
  quote,
  refreshing,
  changed,
  onAcknowledgeChanges,
  onAcceptIssues,
  acceptPending,
  wallet,
  network,
  buyer,
  submitting,
  error,
  canRetry,
  onConfirm,
  returnFocusRef,
}: CheckoutReviewDialogProps) {
  const showChanged = changed && !canRetry && !submitting
  const blocked = submitting || (!canRetry && (!quote || refreshing || changed || quote.issues.length > 0))

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !submitting && onOpenChange(next)}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/80" />
        <Dialog.Content
          onCloseAutoFocus={(event) => {
            if (!returnFocusRef.current) return
            event.preventDefault()
            returnFocusRef.current.focus()
          }}
          className="fixed inset-x-4 top-1/2 z-50 flex max-h-[calc(100svh-32px)] -translate-y-1/2 flex-col gap-5 overflow-y-auto rounded-md bg-surface-card p-6 sm:inset-x-auto sm:left-1/2 sm:w-[520px] sm:-translate-x-1/2">
          <div className="flex items-start justify-between gap-4">
            <Dialog.Title className="text-lg leading-6 font-bold">Revise seu pedido</Dialog.Title>
            <Dialog.Close
              aria-label="Fechar revisão"
              disabled={submitting}
              className="flex size-8 items-center justify-center text-primary hover:text-text-accent disabled:opacity-50"
            >
              <X className="size-4" />
            </Dialog.Close>
          </div>
          <Dialog.Description className="text-sm leading-5 text-text-secondary">
            Confira itens, valores, carteira e rede antes de confirmar. A cotação é revalidada antes do envio.
          </Dialog.Description>

          {refreshing || !quote ? (
            <div aria-busy="true" className="flex flex-col gap-3">
              <p className="sr-only">Atualizando cotação</p>
              <div className="animate-pulse bg-surface-card motion-reduce:animate-none h-12 rounded-sm" />
              <div className="animate-pulse bg-surface-card motion-reduce:animate-none h-12 rounded-sm" />
              <div className="animate-pulse bg-surface-card motion-reduce:animate-none h-20 rounded-sm" />
            </div>
          ) : (
            <>
              {showChanged && quote.issues.length === 0 && (
                <div role="alert" className="flex flex-col gap-3 rounded-md border border-text-coral p-4">
                  <p className="text-sm leading-5 font-bold text-text-coral">
                    Os valores do pedido mudaram desde a sua revisão.
                  </p>
                  <button
                    type="button"
                    onClick={onAcknowledgeChanges}
                    className="h-9 self-start rounded-md border border-primary px-3 text-sm font-medium text-text-accent"
                  >
                    Revisei os novos valores
                  </button>
                </div>
              )}
              <CartIssues quote={quote} onAccept={onAcceptIssues} pending={acceptPending} />

              <ul className="flex flex-col gap-2" aria-label="Itens do pedido">
                {quote.lines.map((line) => (
                  <li key={line.editionId} className="flex items-center justify-between gap-3 text-sm leading-5">
                    <span className="min-w-0 truncate">
                      {line.name} · {line.editionName} (x {line.quantity})
                    </span>
                    <span className="shrink-0 font-bold text-text-accent">{formatEth(line.lineTotal)}</span>
                  </li>
                ))}
              </ul>

              <dl className="flex flex-col gap-2 border-t border-primary pt-3 text-sm leading-5">
                <ReviewRow label="Subtotal" value={formatEth(quote.subtotal)} />
                <ReviewRow
                  label={quote.couponCode ? `Desconto (${quote.couponCode})` : 'Desconto'}
                  value={`(-) ${formatEth(quote.discount)}`}
                />
                <ReviewRow label="Taxa de rede" value={formatEth(quote.networkFee)} />
                <div className="flex justify-between text-base font-bold">
                  <dt>Total</dt>
                  <dd className="text-text-accent">
                    {formatEth(quote.total)}
                  </dd>
                </div>
              </dl>

              <dl className="flex flex-col gap-2 border-t border-primary pt-3 text-sm leading-5">
                <ReviewRow label="Colecionador" value={`${buyer.name} · ${buyer.email}`} />
                <ReviewRow label="Carteira" value={wallet?.label ?? '—'} />
                <ReviewRow label="Rede" value={network ? NETWORK_LABELS[network] : '—'} />
              </dl>
            </>
          )}

          {error && (
            <p role="alert" className="text-sm leading-5 text-destructive">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={onConfirm}
            disabled={blocked}
            className="h-[45px] rounded-lg bg-primary text-body font-bold text-ink disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Enviando pedido...' : canRetry ? 'Tentar novamente' : 'Confirmar compra'}
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-text-secondary">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  )
}
