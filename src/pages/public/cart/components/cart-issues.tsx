import { TriangleAlert } from 'lucide-react'
import type { Quote } from '@/types/quote'
import { formatEth } from '@/utils/money.helper'

interface CartIssuesProps {
  quote: Quote
  onAccept: () => void
  pending: boolean
  className?: string
}

function describeIssues(quote: Quote) {
  const nameOf = (editionId: string) => {
    const line = quote.lines.find((item) => item.editionId === editionId)
    return line ? `${line.name} (${line.editionName})` : 'Um item'
  }

  return quote.issues.map((issue) => {
    if (issue.type === 'PRICE_CHANGED') {
      return `${nameOf(issue.editionId)}: preço mudou de ${formatEth(issue.previousPrice)} para ${formatEth(issue.currentPrice)}.`
    }
    if (issue.type === 'INSUFFICIENT_AVAILABILITY') {
      return issue.available === 0
        ? `${nameOf(issue.editionId)}: edição esgotada.`
        : `${nameOf(issue.editionId)}: só restam ${issue.available} unidade(s).`
    }
    return issue.type === 'COUPON_EXPIRED' ? `O cupom ${issue.code} expirou.` : `O cupom ${issue.code} não é mais válido.`
  })
}

export function CartIssues({ quote, onAccept, pending, className }: CartIssuesProps) {
  if (quote.issues.length === 0) return null

  return (
    <section
      role="alert"
      aria-labelledby="cart-issues-title"
      className={`flex flex-col gap-3 rounded-md border border-text-coral bg-surface-card p-4 ${className ?? ''}`}
    >
      <h2 id="cart-issues-title" className="flex items-center gap-2 text-base leading-5 font-bold text-text-coral">
        <TriangleAlert aria-hidden className="size-5" />
        Seu carrinho mudou
      </h2>
      <ul className="flex list-disc flex-col gap-1 pl-5 text-sm leading-5">
        {describeIssues(quote).map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onAccept}
        disabled={pending}
        className="h-10 self-start rounded-md bg-primary px-4 text-sm font-bold text-ink disabled:cursor-wait disabled:opacity-70"
      >
        {pending ? 'Atualizando...' : 'Aceitar alterações'}
      </button>
    </section>
  )
}
