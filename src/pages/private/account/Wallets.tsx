import { useSessionQuery } from '@/hooks/useAuth'
import { useWalletsQuery } from '@/hooks/useWallets'
import { AccountLoadError, AccountLoading } from './components/account-status'
import { PrimaryWalletForm } from './components/primary-wallet-form'
import { SecondaryWalletSection } from './components/secondary-wallet-section'

export function Wallets() {
  const session = useSessionQuery()
  const wallets = useWalletsQuery()

  if (session.isPending || wallets.isPending) return <AccountLoading />
  if (session.isError || wallets.isError || !session.data) {
    return (
      <AccountLoadError
        error={session.error ?? wallets.error}
        onRetry={() => Promise.all([session.refetch(), wallets.refetch()])}
      />
    )
  }

  const primary = wallets.data.find((wallet) => wallet.kind === 'primary')
  const secondary = wallets.data.find((wallet) => wallet.kind === 'secondary')

  return (
    <div className="flex flex-col gap-8">
      <section aria-labelledby="primary-wallet-title" className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <h1 id="primary-wallet-title" className="text-[17px] leading-4 font-bold">
            Carteira principal
          </h1>
          <p className="text-sm leading-[15px] text-text-secondary">
            Estas carteiras ficam disponíveis no pagamento e para receber NFTs comprados.
          </p>
        </div>
        <PrimaryWalletForm user={session.data} wallet={primary} />
      </section>

      <SecondaryWalletSection key={secondary?.updatedAt ?? 'new'} primary={primary} secondary={secondary} />
    </div>
  )
}
