import { useQueryClient } from '@tanstack/react-query'
import { Link, useCanGoBack, useNavigate, useRouter } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/shadcn/ui/button'
import { Container } from '@/components/shared/container'
import { useSessionQuery } from '@/hooks/useAuth'
import { cartKeys, useAcceptCartChangesMutation, useCartQuery } from '@/hooks/useCart'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { nftKeys } from '@/hooks/useNft'
import { orderKeys, useCreateOrderMutation } from '@/hooks/useOrders'
import { useConnectWalletMutation, useWalletsQuery } from '@/hooks/useWallets'
import { announce } from '@/lib/announcer'
import { CartIssues } from '@/pages/public/cart/components/cart-issues'
import type { Network } from '@/types/common'
import type { Buyer } from '@/types/order'
import type { Quote } from '@/types/quote'
import type { User } from '@/types/user'
import type { Wallet, WalletConnection as WalletConnectionData, WalletProvider } from '@/types/wallet'
import { getErrorCode, getErrorMessage, getFieldErrors, isNetworkFailure } from '@/utils/api-error.helper'
import {
  readCheckoutAttempt,
  readCheckoutDraft,
  saveCheckoutAttempt,
  saveCheckoutDraft,
  type CheckoutAttempt,
} from '@/utils/checkout-storage.helper'
import { formatEth } from '@/utils/money.helper'
import { CheckoutOrderSummary } from './components/checkout-order-summary'
import {
  validateCheckoutFields,
  type CheckoutErrors,
  type CheckoutFields,
} from '@/utils/checkout-validation.helper'
import { CheckoutProfileForm } from './components/checkout-profile-form'
import { CheckoutReviewDialog } from './components/checkout-review-dialog'
import { ConnectedWallets } from './components/connected-wallets'
import { WalletConnection } from './components/wallet-connection'
import { WalletProviderOptions } from './components/wallet-provider-options'

const QUOTE_ERRORS = ['QUOTE_OUTDATED', 'PRICE_CHANGED', 'AVAILABILITY_CONFLICT']

interface CheckoutDraft {
  walletId: string
  network: Network | ''
  provider: WalletProvider
  fields: CheckoutFields
}

function quoteSignature(quote: Quote) {
  return JSON.stringify([
    quote.total,
    quote.couponCode,
    quote.networkFee,
    quote.lines.map((line) => [line.editionId, line.quantity, line.unitPrice]),
  ])
}

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

  return <CheckoutView key={session.data.id} quote={cart.data} wallets={wallets.data} user={session.data} />
}

interface CheckoutViewProps {
  quote: Quote
  wallets: Wallet[]
  user: User
}

function initialNetwork(wallet: Wallet | undefined, quote: Quote): Network | '' {
  if (!wallet) return ''
  return wallet.networks.includes(quote.network) ? quote.network : wallet.networks[0]
}

function CheckoutView({ quote, wallets, user }: CheckoutViewProps) {
  const router = useRouter()
  const navigate = useNavigate()
  const canGoBack = useCanGoBack()
  const queryClient = useQueryClient()
  const cart = useCartQuery()
  const createOrder = useCreateOrderMutation()
  const connectWallet = useConnectWalletMutation()
  const acceptChanges = useAcceptCartChangesMutation()
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const submittingRef = useRef(false)
  const reviewTriggerRef = useRef<HTMLButtonElement>(null)

  const [draft] = useState(() => readCheckoutDraft<CheckoutDraft>(user.id))
  const defaultWallet =
    wallets.find((wallet) => wallet.id === draft?.walletId) ??
    wallets.find((wallet) => wallet.kind === 'primary') ??
    wallets[0]

  const [walletId, setWalletId] = useState(defaultWallet?.id ?? '')
  const [network, setNetwork] = useState<Network | ''>(() =>
    draft?.network && defaultWallet?.networks.includes(draft.network) ? draft.network : initialNetwork(defaultWallet, quote),
  )
  const [provider, setProvider] = useState<WalletProvider>(draft?.provider ?? defaultWallet?.provider ?? 'coinbase')
  const [fields, setFields] = useState<CheckoutFields>(
    () =>
      draft?.fields ?? {
        name: user.name,
        username: user.username,
        profileName: user.name,
        referralCode: user.referralCode ?? '',
        email: user.email,
        secondaryWallet: '',
        note: '',
      },
  )
  const [errors, setErrors] = useState<CheckoutErrors>({})
  const [connection, setConnection] = useState<WalletConnectionData | null>(null)
  const [connectionHint, setConnectionHint] = useState<string>()
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewRefreshing, setReviewRefreshing] = useState(false)
  const [reviewedSignature, setReviewedSignature] = useState<string | null>(null)
  const [pendingAttempt, setPendingAttempt] = useState<CheckoutAttempt | null>(() => readCheckoutAttempt(user.id))

  useEffect(() => {
    saveCheckoutDraft(user.id, { walletId, network, provider, fields } satisfies CheckoutDraft)
  }, [user.id, walletId, network, provider, fields])

  const wallet = wallets.find((item) => item.id === walletId)
  const buyer: Buyer = { name: fields.name.trim(), email: fields.email.trim(), phone: user.phone }
  const changed = reviewedSignature !== null && reviewedSignature !== quoteSignature(quote)
  const serverErrors = getFieldErrors(createOrder.error)
  const visibleErrors: CheckoutErrors = { ...serverErrors, ...errors }
  const orderError = createOrder.error ? getErrorMessage(createOrder.error) : undefined
  const canRetry = Boolean(pendingAttempt) && isNetworkFailure(createOrder.error)

  function resetConnection() {
    setConnection(null)
    connectWallet.reset()
  }

  function handleWalletChange(id: string) {
    const next = wallets.find((item) => item.id === id)
    setWalletId(id)
    resetConnection()
    if (!next) return
    setProvider(next.provider)
    if (!network || !next.networks.includes(network)) setNetwork(next.networks[0])
  }

  function handleNetworkChange(next: Network) {
    setNetwork(next)
    resetConnection()
  }

  function handleProviderChange(next: WalletProvider) {
    setProvider(next)
    resetConnection()
  }

  function handleBack() {
    if (canGoBack) router.history.back()
    else navigate({ to: '/carrinho' })
  }

  function handleConnect() {
    if (!walletId || !network) {
      setErrors((current) => ({
        ...current,
        wallet: walletId ? undefined : 'Selecione uma carteira.',
        network: network ? undefined : 'Selecione uma rede.',
      }))
      return
    }
    setConnectionHint(undefined)
    connectWallet.mutate(
      { walletId, network },
      {
        onSuccess: (result) => {
          setConnection(result)
          announce('Carteira conectada.')
        },
        onError: (error) => announce(getErrorMessage(error), 'assertive'),
      },
    )
  }

  function handleDisconnect() {
    resetConnection()
    announce('Carteira desconectada.')
  }

  async function handleReview() {
    const nextErrors = validateCheckoutFields(fields, isDesktop)
    if (!walletId) nextErrors.wallet = 'Selecione uma carteira.'
    if (!network) nextErrors.network = 'Selecione uma rede.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      announce('Corrija os campos destacados antes de continuar.', 'assertive')
      requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus())
      return
    }
    if (!connection) {
      setConnectionHint('Conecte sua carteira para revisar o pedido.')
      announce('Conecte sua carteira para revisar o pedido.', 'assertive')
      return
    }

    if (!pendingAttempt) createOrder.reset()
    setReviewOpen(true)
    setReviewRefreshing(true)
    const fresh = await cart.refetch()
    setReviewRefreshing(false)
    if (fresh.data) setReviewedSignature(quoteSignature(fresh.data))
  }

  function submitOrder(attempt: CheckoutAttempt) {
    if (submittingRef.current) return
    submittingRef.current = true
    saveCheckoutAttempt(user.id, attempt)
    setPendingAttempt(attempt)

    createOrder.mutate(attempt, {
      onSuccess: (order) => {
        saveCheckoutAttempt(user.id, null)
        setPendingAttempt(null)
        queryClient.setQueryData(orderKeys.detail(user.id, order.id), order)
        navigate({ to: '/pedido/$orderId', params: { orderId: order.id }, replace: true })
      },
      onError: (error) => {
        if (isNetworkFailure(error)) {
          announce('Não recebemos a resposta do pedido. Tente novamente; o mesmo pedido será recuperado.', 'assertive')
          return
        }
        saveCheckoutAttempt(user.id, null)
        setPendingAttempt(null)
        announce(getErrorMessage(error), 'assertive')
        if (QUOTE_ERRORS.includes(getErrorCode(error) ?? '')) {
          queryClient.invalidateQueries({ queryKey: cartKeys.all })
          queryClient.invalidateQueries({ queryKey: nftKeys.all })
        }
      },
      onSettled: () => {
        submittingRef.current = false
      },
    })
  }

  function handleConfirm() {
    if (pendingAttempt) {
      submitOrder(pendingAttempt)
      return
    }
    if (!network) return
    submitOrder({ idempotencyKey: crypto.randomUUID(), input: { quoteId: quote.id, walletId, network, buyer } })
  }

  function handleResumeAttempt() {
    if (!pendingAttempt) return
    setReviewOpen(true)
    submitOrder(pendingAttempt)
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

      {pendingAttempt && !reviewOpen && (
        <div role="alert" className="flex flex-col gap-3 rounded-md border border-primary p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm leading-5">
            Existe um pedido enviado sem resposta. Verifique antes de tentar uma nova compra.
          </p>
          <button
            type="button"
            onClick={handleResumeAttempt}
            className="h-10 shrink-0 rounded-md bg-primary px-4 text-sm font-bold text-ink"
          >
            Verificar pedido
          </button>
        </div>
      )}

      {quote.lines.length === 0 ? (
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
            wallets={wallets}
            walletId={walletId}
            onWalletChange={handleWalletChange}
            network={network}
            onNetworkChange={handleNetworkChange}
            fields={fields}
            onFieldsChange={setFields}
            errors={visibleErrors}
          />

          <div className="flex flex-1 flex-col gap-6 lg:w-[405px] lg:flex-none lg:gap-3">
            <CheckoutOrderSummary quote={quote} />
            <CartIssues quote={quote} onAccept={() => acceptChanges.mutate()} pending={acceptChanges.isPending} />

            <ConnectedWallets wallets={wallets} value={walletId} onChange={handleWalletChange} />

            <section aria-labelledby="wallet-provider-title" className="flex flex-1 flex-col gap-3 lg:flex-none lg:gap-5">
              <h2 id="wallet-provider-title" className="text-body leading-4 font-bold lg:text-center lg:text-[17px]">
                Carteira e rede
              </h2>
              <WalletProviderOptions value={provider} onChange={handleProviderChange} />

              <WalletConnection
                connection={connection}
                canConnect={Boolean(walletId && network)}
                pending={connectWallet.isPending}
                error={connectWallet.error ? getErrorMessage(connectWallet.error) : connectionHint}
                onConnect={handleConnect}
                onDisconnect={handleDisconnect}
              />

              <p className="flex items-center justify-end gap-4 lg:hidden">
                <span className="text-body leading-4 font-bold">Total:</span>
                <span className="text-lg leading-4 font-bold text-text-accent">{formatEth(quote.total)}</span>
              </p>

              <div className="mt-auto flex flex-col gap-2 lg:mt-0">
                {(visibleErrors.name || visibleErrors.email) && !isDesktop && (
                  <p role="alert" className="text-center text-sm leading-5 text-destructive">
                    {visibleErrors.name ?? visibleErrors.email} Atualize seus dados no perfil.
                  </p>
                )}
                {wallets.length === 0 && (
                  <p className="text-center text-sm leading-5 text-text-secondary">
                    Nenhuma carteira conectada à sua conta.
                  </p>
                )}
                <button
                  ref={reviewTriggerRef}
                  type="button"
                  onClick={handleReview}
                  disabled={quote.issues.length > 0 || createOrder.isPending}
                  className="h-[60px] rounded-[40px] bg-linear-to-r from-primary to-primary/80 text-lg leading-4 font-bold text-ink disabled:cursor-not-allowed disabled:opacity-60 lg:h-[45px] lg:rounded-lg lg:bg-primary lg:bg-none lg:text-body"
                >
                  Confirmar compra
                </button>
              </div>
            </section>
          </div>
        </div>
      )}

      <CheckoutReviewDialog
        open={reviewOpen}
        onOpenChange={setReviewOpen}
        quote={cart.data}
        refreshing={reviewRefreshing}
        changed={changed}
        onAcknowledgeChanges={() => setReviewedSignature(quoteSignature(quote))}
        onAcceptIssues={() => acceptChanges.mutate()}
        acceptPending={acceptChanges.isPending}
        wallet={wallet}
        network={network}
        buyer={buyer}
        submitting={createOrder.isPending}
        error={orderError}
        canRetry={canRetry}
        onConfirm={handleConfirm}
        returnFocusRef={reviewTriggerRef}
      />
    </div>
  )
}

