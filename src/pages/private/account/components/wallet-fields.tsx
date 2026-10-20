import { NETWORK_LABELS } from '@/constants/catalog'
import { WALLET_PROVIDER_LABELS } from '@/constants/wallet'
import type { Network } from '@/types/common'
import type { Wallet, WalletProvider } from '@/types/wallet'

export const NETWORK_OPTIONS = Object.keys(NETWORK_LABELS) as Network[]
export const PROVIDER_OPTIONS = Object.keys(WALLET_PROVIDER_LABELS) as WalletProvider[]

export interface WalletDraft {
  label: string
  network: Network | ''
  address: string
  provider: WalletProvider | ''
  ensName: string
}

export function toWalletDraft(wallet?: Wallet): WalletDraft {
  return {
    label: wallet?.label ?? '',
    network: wallet?.networks[0] ?? '',
    address: wallet?.address ?? '',
    provider: wallet?.provider ?? '',
    ensName: wallet?.ensName ?? '',
  }
}

export function draftNetworks(draft: WalletDraft, wallet?: Wallet): Network[] {
  if (!draft.network) return []
  return [draft.network, ...(wallet?.networks.filter((network) => network !== draft.network) ?? [])]
}

export function shortAddress(address: string) {
  return `${address.slice(0, 6)}…${address.slice(-4).toUpperCase()}`
}
