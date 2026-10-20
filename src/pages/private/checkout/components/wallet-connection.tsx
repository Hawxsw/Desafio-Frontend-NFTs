import { PlugZap, Unplug } from 'lucide-react'
import { NETWORK_LABELS } from '@/constants/catalog'
import type { WalletConnection as WalletConnectionData } from '@/types/wallet'

function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4).toUpperCase()}`
}

interface WalletConnectionProps {
  connection: WalletConnectionData | null
  canConnect: boolean
  pending: boolean
  error?: string
  onConnect: () => void
  onDisconnect: () => void
}

export function WalletConnection({ connection, canConnect, pending, error, onConnect, onDisconnect }: WalletConnectionProps) {
  return (
    <div className="flex flex-col gap-2">
      <p role="status" className="text-center text-sm leading-5 text-text-secondary">
        {connection
          ? `Carteira conectada: ${shortAddress(connection.address)} na ${NETWORK_LABELS[connection.network]}.`
          : 'Carteira desconectada.'}
      </p>
      {connection ? (
        <button
          type="button"
          onClick={onDisconnect}
          className="flex h-10 items-center justify-center gap-2 rounded-md border border-primary text-sm font-medium text-text-accent hover:bg-surface-raised"
        >
          <Unplug aria-hidden className="size-4" />
          Desconectar carteira
        </button>
      ) : (
        <button
          type="button"
          onClick={onConnect}
          disabled={!canConnect || pending}
          className="flex h-10 items-center justify-center gap-2 rounded-md border border-primary text-sm font-medium text-text-accent hover:bg-surface-raised disabled:cursor-not-allowed disabled:opacity-60"
        >
          <PlugZap aria-hidden className="size-4" />
          {pending ? 'Aguardando a carteira...' : 'Conectar carteira'}
        </button>
      )}
      {error && (
        <p role="alert" className="text-center text-sm leading-5 text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
