import { NETWORK_LABELS } from '@/constants/catalog'
import type { Wallet } from '@/types/wallet'

function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4).toUpperCase()}`
}

interface ConnectedWalletsProps {
  wallets: Wallet[]
  value: string
  onChange: (walletId: string) => void
}

export function ConnectedWallets({ wallets, value, onChange }: ConnectedWalletsProps) {
  return (
    <fieldset className="flex flex-col gap-3 lg:hidden">
      <legend className="mb-3 text-body leading-4 font-bold">Carteira conectada</legend>
      {wallets.map((wallet) => (
        <label
          key={wallet.id}
          className="flex cursor-pointer items-center gap-4 rounded-2xl bg-surface-card px-4 py-3 has-focus-visible:outline-2 has-focus-visible:outline-primary"
        >
          <input
            type="radio"
            name="connected-wallet"
            value={wallet.id}
            checked={value === wallet.id}
            onChange={() => onChange(wallet.id)}
            className="size-[15px] shrink-0 appearance-none rounded-full border-2 border-primary checked:bg-primary checked:shadow-[inset_0_0_0_2.5px_var(--color-ink)] focus-visible:outline-none"
          />
          <span className="flex min-w-0 flex-col gap-1">
            <span className="text-sm leading-4 font-bold">{wallet.label}</span>
            <span className="text-xs leading-4 text-text-secondary">{shortAddress(wallet.address)}</span>
            <span className="text-xs leading-4 text-text-secondary">
              Rede {wallet.networks.map((network) => NETWORK_LABELS[network]).join(', ')}
            </span>
          </span>
        </label>
      ))}
    </fieldset>
  )
}
