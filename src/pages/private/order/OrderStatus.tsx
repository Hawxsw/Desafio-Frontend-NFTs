import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { isAxiosError } from 'axios'
import { LoaderCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/shadcn/ui/button'
import { Container } from '@/components/shared/container'
import { WALLET_PROVIDER_LABELS } from '@/constants/wallet'
import { useOrderQuery } from '@/hooks/useOrders'
import { useRealtimeStatus } from '@/hooks/useRealtime'
import { useWalletsQuery } from '@/hooks/useWallets'
import { OrderConfirmationModal } from '@/pages/private/checkout/components/order-confirmation-modal'
import type { Order } from '@/types/order'
import { getErrorMessage } from '@/utils/api-error.helper'
import { formatEth } from '@/utils/money.helper'

export function OrderStatus() {
  const { orderId } = useParams({ from: '/private/pedido/$orderId' })
  const order = useOrderQuery(orderId)

  if (order.isPending) {
    return (
      <Container aria-busy="true" aria-label="Carregando pedido" className="flex flex-col gap-4 py-12">
        <div className="animate-pulse bg-surface-card motion-reduce:animate-none h-8 w-2/3 rounded-sm" />
        <div className="animate-pulse bg-surface-card motion-reduce:animate-none h-5 w-1/2 rounded-sm" />
        <div className="animate-pulse bg-surface-card motion-reduce:animate-none h-24 w-full rounded-sm" />
      </Container>
    )
  }

  if (order.isError) {
    const notFound = isAxiosError(order.error) && order.error.response?.status === 404
    return (
      <Container role="alert" className="flex flex-col items-start gap-4 py-12">
        <h1 className="text-section font-bold">{notFound ? 'Pedido não encontrado' : 'Não foi possível carregar o pedido'}</h1>
        <p className="text-sm leading-6 text-text-secondary">{getErrorMessage(order.error)}</p>
        {notFound ? (
          <Button asChild className="h-10 rounded-md px-4 text-base font-bold">
            <Link to="/">Voltar ao início</Link>
          </Button>
        ) : (
          <Button type="button" onClick={() => order.refetch()} className="h-10 rounded-md px-4 text-base font-bold">
            Tentar novamente
          </Button>
        )}
      </Container>
    )
  }

  if (order.data.status === 'confirmed') return <ConfirmedOrder order={order.data} />
  if (order.data.status === 'declined') return <DeclinedOrder order={order.data} />
  return <PendingOrder order={order.data} onRefresh={() => order.refetch()} refreshing={order.isFetching} />
}

function ConfirmedOrder({ order }: { order: Order }) {
  const navigate = useNavigate()
  const wallets = useWalletsQuery()
  const wallet = wallets.data?.find((item) => item.id === order.walletId)
  const walletName = wallet ? WALLET_PROVIDER_LABELS[wallet.provider] : 'Carteira'

  return (
    <>
      <Container className="py-12">
        <h1 className="text-section font-bold">Pedido confirmado</h1>
      </Container>
      <OrderConfirmationModal order={order} walletName={walletName} onClose={() => navigate({ to: '/' })} />
    </>
  )
}

function PendingOrder({ order, onRefresh, refreshing }: { order: Order; onRefresh: () => void; refreshing: boolean }) {
  const realtime = useRealtimeStatus()
  const message =
    realtime === 'connected'
      ? 'Aguardando a confirmação da rede. Esta página atualiza sozinha.'
      : 'Conexão em tempo real interrompida. Reconectando para atualizar o status…'

  return (
    <Container className="flex flex-col items-start gap-5 py-12">
      <div className="flex items-center gap-3">
        <LoaderCircle aria-hidden className="size-7 animate-spin text-primary motion-reduce:animate-none" />
        <h1 className="text-section font-bold">Pagamento em processamento</h1>
      </div>
      <p role="status" className="text-sm leading-6 text-text-secondary">
        {message}
      </p>
      <OrderSnapshot order={order} />
      <Button type="button" variant="outline" onClick={onRefresh} disabled={refreshing} className="h-10 rounded-md px-4">
        {refreshing ? 'Atualizando...' : 'Atualizar status'}
      </Button>
    </Container>
  )
}

function DeclinedOrder({ order }: { order: Order }) {
  return (
    <Container role="alert" className="flex flex-col items-start gap-5 py-12">
      <div className="flex items-center gap-3">
        <XCircle aria-hidden className="size-7 text-destructive" />
        <h1 className="text-section font-bold">Pagamento recusado</h1>
      </div>
      <p className="text-sm leading-6 text-text-secondary">
        {order.declineReason ?? 'A transação não foi concluída.'} Seus itens continuam no carrinho.
      </p>
      <OrderSnapshot order={order} />
      <div className="flex flex-wrap gap-3">
        <Button asChild className="h-10 rounded-md px-4 text-base font-bold">
          <Link to="/pagamento">Tentar novamente</Link>
        </Button>
        <Button asChild variant="outline" className="h-10 rounded-md px-4">
          <Link to="/carrinho">Ver carrinho</Link>
        </Button>
      </div>
    </Container>
  )
}

function OrderSnapshot({ order }: { order: Order }) {
  return (
    <dl className="flex w-full max-w-md flex-col gap-2 rounded-md bg-surface-card p-4 text-sm leading-5">
      <div className="flex justify-between gap-4">
        <dt className="text-text-secondary">Pedido</dt>
        <dd className="truncate">{order.id}</dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt className="text-text-secondary">Itens</dt>
        <dd>{order.items.reduce((sum, item) => sum + item.quantity, 0)}</dd>
      </div>
      <div className="flex justify-between gap-4 font-bold">
        <dt>Total</dt>
        <dd className="text-text-accent">{formatEth(order.total)}</dd>
      </div>
    </dl>
  )
}
