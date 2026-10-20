import { X } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { NETWORK_LABELS } from '@/constants/catalog'
import type { Network } from '@/types/common'
import type { Order } from '@/types/order'
import { formatEth } from '@/utils/money.helper'

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

const EXPLORER_NAMES: Record<Network, string> = {
  ethereum: 'Etherscan',
  polygon: 'Polygonscan',
  solana: 'Solscan',
}

function formatOrderDate(iso: string) {
  const date = new Date(iso)
  return `${String(date.getDate()).padStart(2, '0')} ${MONTHS[date.getMonth()]}, ${date.getFullYear()}`
}

function shortHash(hash: string) {
  return `${hash.slice(0, 6)}…${hash.slice(-4).toUpperCase()}`
}

interface OrderConfirmationModalProps {
  order: Order
  walletName: string
  onClose: () => void
}

export function OrderConfirmationModal({ order, walletName, onClose }: OrderConfirmationModalProps) {
  const meta = [
    { label: 'ID da transação', value: order.txHash ? shortHash(order.txHash) : '—' },
    { label: 'Data', value: formatOrderDate(order.createdAt) },
    { label: 'Total', value: formatEth(order.total) },
    { label: 'Carteira', value: walletName },
  ]

  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink" />
        <Dialog.Content className="fixed inset-x-4 top-1/2 z-50 max-h-[calc(100svh-32px)] -translate-y-1/2 overflow-y-auto bg-surface-card after:sticky after:bottom-0 after:block after:h-[10px] after:bg-primary sm:inset-x-auto sm:left-1/2 sm:w-[578px] sm:-translate-x-1/2">
          <Dialog.Close
            aria-label="Fechar"
            className="absolute top-3 right-3 flex size-8 items-center justify-center text-primary hover:text-text-accent"
          >
            <X className="size-3.5" strokeWidth={2.5} />
          </Dialog.Close>

          <header className="flex h-[156px] flex-col items-center justify-center gap-[18px] border-b border-primary">
            <img src="/thank_you.svg" alt="" width={66} height={80} className="h-20 w-[66px]" />
            <Dialog.Title className="text-center text-lg leading-4 font-bold text-text-secondary">
              Seus NFTs agora estão na sua carteira
            </Dialog.Title>
          </header>

          <dl className="flex flex-wrap justify-between gap-y-3 border-b border-primary px-[35px] py-3 sm:h-[57px] sm:flex-nowrap sm:py-0">
            {meta.map((item) => (
              <div
                key={item.label}
                className="flex basis-1/2 flex-col justify-center gap-1 px-3 first:pl-0 sm:basis-auto sm:border-l sm:border-primary sm:first:border-l-0"
              >
                <dt className="text-sm leading-4 font-bold text-text-secondary">{item.label}</dt>
                <dd className="text-body leading-none text-text-secondary">{item.value}</dd>
              </div>
            ))}
          </dl>

          <section className="flex flex-col gap-3 px-6 pt-5 pb-12 sm:px-11">
            <h3 className="text-body leading-4 font-bold">Detalhes da transação</h3>
            <div aria-hidden className="flex items-center gap-2.5 border-b-[0.3px] border-primary pb-2 text-lg leading-4 font-bold">
              <span className="flex-1">NFTs</span>
              <span className="w-[68px] text-center">Edições</span>
              <span className="w-[90px] text-right">Subtotal</span>
            </div>
            <ul className="flex flex-col gap-3">
              {order.items.map((item) => (
                <li key={item.editionId} className="flex items-center gap-2.5">
                  <img src={item.image} alt="" width={70} height={70} className="size-[70px] rounded-lg object-cover" />
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <span className="truncate text-base leading-4 font-bold">{item.name}</span>
                    <span className="text-sm leading-4 text-muted-foreground">
                      ID do token: #{item.tokenId.padStart(4, '0')}
                    </span>
                  </div>
                  <span className="w-[68px] text-center text-sm leading-4 text-text-secondary">
                    <span className="sr-only">Quantidade: </span>(x {item.quantity})
                  </span>
                  <span className="w-[90px] text-right text-lg leading-4 font-bold text-text-accent">
                    {formatEth(item.lineTotal)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="flex w-full max-w-[321px] flex-col gap-3 self-end">
              <div className="flex items-center justify-between">
                <dt className="text-body leading-none">Taxa de rede</dt>
                <dd className="text-lg leading-4">{formatEth(order.networkFee)}</dd>
              </div>
              <div className="flex items-center justify-between text-lg leading-4 font-bold">
                <dt>Total</dt>
                <dd className="text-text-accent">{formatEth(order.total)}</dd>
              </div>
            </dl>

            <div className="flex flex-col items-center gap-6 border-t-[0.3px] border-primary pt-6">
              <Dialog.Description className="max-w-[490px] text-center text-sm leading-[22px] text-text-secondary">
                Transação confirmada na {NETWORK_LABELS[order.network]}. A propriedade foi transferida para sua carteira
                conectada e registrada na rede.
              </Dialog.Description>
              {order.explorerUrl && (
                <a
                  href={order.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 items-center rounded-[5px] bg-primary px-4 text-lg leading-4 font-bold text-ink hover:bg-primary/90"
                >
                  Ver no {EXPLORER_NAMES[order.network]}
                  <span className="sr-only"> (abre em nova aba)</span>
                </a>
              )}
            </div>
          </section>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
