import { useQueryClient } from '@tanstack/react-query'
import { Link, useCanGoBack, useNavigate, useRouter } from '@tanstack/react-router'
import { isAxiosError } from 'axios'
import { ChevronLeft } from 'lucide-react'
import { useRef, useState } from 'react'
import { Button } from '@/components/shadcn/ui/button'
import { Container } from '@/components/shared/container'
import { useSessionQuery } from '@/hooks/useAuth'
import { cartKeys, useCartQuery } from '@/hooks/useCart'
import { nftKeys } from '@/hooks/useNft'
import { useCreateOrderMutation } from '@/hooks/useOrders'
import { useWalletsQuery } from '@/hooks/useWallets'
import { WALLET_PROVIDER_LABELS } from '@/constants/wallet'
import type { Network } from '@/types/common'
import type { ApiError } from '@/types/error'
import type { Order } from '@/types/order'
import type { Quote } from '@/types/quote'
import type { User } from '@/types/user'
import type { Wallet, WalletProvider } from '@/types/wallet'
import { getErrorMessage } from '@/utils/api-error.helper'
import { formatEth } from '@/utils/money.helper'
import { CheckoutOrderSummary } from './components/checkout-order-summary'
import { CheckoutProfileForm, type CheckoutBuyerFields } from './components/checkout-profile-form'
import { ConnectedWallets } from './components/connected-wallets'
import { OrderConfirmationModal } from './components/order-confirmation-modal'
import { WalletProviderOptions } from './components/wallet-provider-options'

const QUOTE_CONFLICTS: ApiError['code'][] = ['PRICE_CHANGED', 'AVAILABILITY_CONFLICT', 'CONFLICT', 'NOT_FOUND']

export function Checkout() {
  const cart = useCartQuery()
  const wallets = useWalletsQuery()
  const session = useSessionQuery()

  if (cart.isPending || wallets.isPending || session.isPending) {
    return (
      <Container aria-busy="true" className="py-12">
        <p className="text-sm text-text-secondary">Carregando pagamento...</p>
      </Container>
    )
  }

  if (cart.isError || wallets.isError || session.isError || !session.data) {
    const error = cart.error ?? wallets.error ?? session.error
    return (
      <Container role="alert" className="flex flex-col items-start gap-4 py-12">
        <h1 className="text-section font-bold">Não foi possível carregar o pagamento</h1>
        <p className="text-sm leading-6 text-text-secondary">{getErrorMessage(error)}</p>
        <Button
          type="button"
          onClick={() => Promise.all([cart.refetch(), wallets.refetch(), session.refetch()])}
          className="h-10 rounded-md px-4 text-base font-bold"
        >
          Tentar novamente
        </Button>
      </Container>
    )
  }

  return <CheckoutView quote={cart.data} wallets={wallets.data} user={session.data} />
}

interface CheckoutViewProps {
  quote: Quote
  wallets: Wallet[]
  user: User
}

function CheckoutView({ quote, wallets, user }: CheckoutViewProps) {
  const router = useRouter()
  const navigate = useNavigate()
  const canGoBack = useCanGoBack()
  const queryClient = useQueryClient()
  const createOrder = useCreateOrderMutation()
  const formRef = useRef<HTMLFormElement>(null)

  const defaultWallet = wallets.find((wallet) => wallet.kind === 'primary') ?? wallets[0]
  const [walletId, setWalletId] = useState(defaultWallet?.id ?? '')
  const [network, setNetwork] = useState<Network | ''>(() =>
    defaultWallet ? (defaultWallet.networks.includes(quote.network) ? quote.network : defaultWallet.networks[0]) : '',
  )
  const [provider, setProvider] = useState<WalletProvider>(defaultWallet?.provider ?? 'coinbase')
  const [buyer, setBuyer] = useState<CheckoutBuyerFields>({ name: user.name, email: user.email })
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID())
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null)

  const orderError = createOrder.error
  const declined = createOrder.data?.status === 'declined' ? createOrder.data : null
  const errorMessage = declined
    ? `Pagamento recusado: ${declined.declineReason ?? 'tente novamente.'}`
    : orderError
      ? getErrorMessage(orderError)
      : null

  function handleWalletChange(id: string) {
    setWalletId(id)
    const wallet = wallets.find((item) => item.id === id)
    if (!wallet) return
    setProvider(wallet.provider)
    if (network && !wallet.networks.includes(network)) setNetwork(wallet.networks[0])
  }

  function handleBack() {
    if (canGoBack) router.history.back()
    else navigate({ to: '/carrinho' })
  }

  function handleConfirm() {
    const form = formRef.current
    if (form && form.offsetParent !== null && !form.reportValidity()) return
    if (!walletId || !network) return

    createOrder.mutate(
      {
        input: { quoteId: quote.id, walletId, network, buyer: { ...buyer, phone: user.phone } },
        idempotencyKey,
      },
      {
        onSuccess: (order) => {
          if (order.status === 'confirmed') setConfirmedOrder(order)
          else setIdempotencyKey(crypto.randomUUID())
        },
        onError: (error) => {
          if (isAxiosError<ApiError>(error) && error.response) {
            setIdempotencyKey(crypto.randomUUID())
            if (QUOTE_CONFLICTS.includes(error.response.data.code)) {
              queryClient.invalidateQueries({ queryKey: cartKeys.all })
              queryClient.invalidateQueries({ queryKey: nftKeys.all })
            }
          }
        },
      },
    )
  }

  function handleCloseConfirmation() {
    queryClient.invalidateQueries({ queryKey: cartKeys.all })
    queryClient.invalidateQueries({ queryKey: nftKeys.all })
    navigate({ to: '/' })
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-7 pt-8 pb-8 lg:mx-auto lg:w-full lg:max-w-page lg:flex-none lg:gap-3 lg:px-10 lg:pb-0 xl:px-0">
      <div className="flex h-11 items-center gap-6 lg:hidden">
        <button
          type="button"
          aria-label="Voltar"
          onClick={handleBack}
          className="flex size-[35px] shrink-0 items-center justify-center rounded-full border border-surface-border bg-surface-raised text-muted-foreground"
        >
          <ChevronLeft className="size-5" />
        </button>
        <h1 className="text-xl leading-4 font-bold">Pagamento com carteira</h1>
      </div>

      <nav aria-label="Trilha de navegação" className="hidden text-body leading-4 font-bold lg:block">
        <ol className="flex items-center gap-[1ch]">
          <li>
            <Link to="/" className="hover:text-text-accent">
              Início
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li>
            <Link to="/" hash="catalogo" className="hover:text-text-accent">
              Mercado
            </Link>
          </li>
          <li aria-hidden>/</li>
          <li aria-current="page">Pagamento</li>
        </ol>
      </nav>

      {quote.lines.length === 0 && !confirmedOrder ? (
        <div className="flex flex-col items-start gap-4 py-12">
          <p className="text-section font-bold">Seu carrinho está vazio</p>
          <Button asChild className="h-10 rounded-md px-4 text-base font-bold">
            <Link to="/" hash="catalogo">
              Ver catálogo
            </Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-6 lg:flex-row lg:gap-8 xl:justify-between">
          <CheckoutProfileForm
            formRef={formRef}
            wallets={wallets}
            walletId={walletId}
            onWalletChange={handleWalletChange}
            network={network}
            onNetworkChange={setNetwork}
            buyer={buyer}
            onBuyerChange={setBuyer}
          />

          <div className="flex flex-1 flex-col gap-6 lg:w-[405px] lg:flex-none lg:gap-3">
            <CheckoutOrderSummary quote={quote} />

            <ConnectedWallets wallets={wallets} value={walletId} onChange={handleWalletChange} />

            <section aria-labelledby="wallet-provider-title" className="flex flex-1 flex-col gap-3 lg:flex-none lg:gap-5">
              <h2 id="wallet-provider-title" className="text-body leading-4 font-bold lg:text-center lg:text-[17px]">
                Carteira e rede
              </h2>
              <WalletProviderOptions value={provider} onChange={setProvider} />

              <p className="flex items-center justify-end gap-4 lg:hidden">
                <span className="text-body leading-4 font-bold">Total:</span>
                <span className="text-lg leading-4 font-bold text-text-accent">{formatEth(quote.total)}</span>
              </p>

              <div className="mt-auto flex flex-col gap-2 lg:mt-0">
                {errorMessage && (
                  <p role="alert" className="text-center text-sm leading-5 text-destructive">
                    {errorMessage}
                  </p>
                )}
                {wallets.length === 0 && (
                  <p className="text-center text-sm leading-5 text-text-secondary">
                    Nenhuma carteira conectada à sua conta.
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={createOrder.isPending || !walletId || !network}
                  className="h-[60px] rounded-[40px] bg-linear-to-r from-primary to-primary/80 text-lg leading-4 font-bold text-ink disabled:cursor-not-allowed disabled:opacity-60 lg:h-[45px] lg:rounded-lg lg:bg-primary lg:bg-none lg:text-body"
                >
                  {createOrder.isPending ? 'Confirmando...' : 'Confirmar compra'}
                </button>
              </div>
            </section>
          </div>
        </div>
      )}

      {confirmedOrder && (
        <OrderConfirmationModal
          order={confirmedOrder}
          walletName={WALLET_PROVIDER_LABELS[provider]}
          onClose={handleCloseConfirmation}
        />
      )}
    </div>
  )
}
