import type { Network } from './common'

export type WalletKind = 'primary' | 'secondary'

export type WalletProvider = 'walletconnect' | 'metamask' | 'coinbase'

export interface Wallet {
  id: string
  userId: string
  kind: WalletKind
  provider: WalletProvider
  label: string
  address: string
  ensName: string | null
  networks: Network[]
  createdAt: string
  updatedAt: string
}

export interface WalletInput {
  kind: WalletKind
  provider: WalletProvider
  label: string
  address: string
  ensName: string | null
  networks: Network[]
}

export interface WalletConnection {
  walletId: string
  address: string
  network: Network
  connectedAt: string
}
