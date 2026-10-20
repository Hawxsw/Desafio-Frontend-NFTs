import { Wallet } from 'lucide-react'
import type { ReactNode } from 'react'
import { WALLET_PROVIDER_LABELS } from '@/constants/wallet'
import type { WalletProvider } from '@/types/wallet'

const PROVIDERS: { value: WalletProvider; label: string; icon: ReactNode }[] = [
  { value: 'walletconnect', label: WALLET_PROVIDER_LABELS.walletconnect, icon: 'W' },
  { value: 'metamask', label: WALLET_PROVIDER_LABELS.metamask, icon: 'M' },
  { value: 'coinbase', label: WALLET_PROVIDER_LABELS.coinbase, icon: <Wallet className="size-4" /> },
]

interface WalletProviderOptionsProps {
  value: WalletProvider
  onChange: (value: WalletProvider) => void
}

export function WalletProviderOptions({ value, onChange }: WalletProviderOptionsProps) {
  return (
    <fieldset className="flex flex-col gap-3 lg:gap-4">
      <legend className="sr-only">Carteira para pagamento</legend>
      {PROVIDERS.map((provider) => (
        <label
          key={provider.value}
          className="flex h-[62px] cursor-pointer items-center gap-3 rounded-2xl bg-surface-card px-3 has-focus-visible:outline-2 has-focus-visible:outline-primary lg:h-[45px] lg:flex-row-reverse lg:justify-end lg:gap-2.5 lg:rounded-[3px] lg:border lg:border-surface-border lg:bg-transparent lg:px-3 lg:has-checked:border-primary"
        >
          <span
            aria-hidden
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-raised text-xs font-bold text-primary lg:hidden"
          >
            {provider.icon}
          </span>
          <span className="flex-1 text-sm lg:flex-none lg:text-body lg:leading-none">
            {provider.value === 'walletconnect' ? (
              <>
                <span className="lg:sr-only">{provider.label}</span>
                <span
                  aria-hidden
                  className="hidden rounded bg-surface-raised px-2 py-1 text-[9px] leading-none font-bold tracking-[0.1px] text-text-accent uppercase lg:inline-block"
                >
                  MetaMask · WalletConnect · Coinbase
                </span>
              </>
            ) : (
              provider.label
            )}
          </span>
          <input
            type="radio"
            name="wallet-provider"
            value={provider.value}
            checked={value === provider.value}
            onChange={() => onChange(provider.value)}
            className="size-[15px] shrink-0 appearance-none rounded-full border-2 border-primary checked:bg-primary checked:shadow-[inset_0_0_0_2.5px_var(--color-ink)] focus-visible:outline-none"
          />
        </label>
      ))}
    </fieldset>
  )
}
