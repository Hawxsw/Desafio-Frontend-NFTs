import type { AxiosInstance } from 'axios'
import { api } from '@/services/api/api'
import type { Network } from '@/types/common'
import type { Wallet, WalletConnection, WalletInput } from '@/types/wallet'

export class WalletService {
  private readonly api: AxiosInstance

  constructor(instance: AxiosInstance) {
    this.api = instance
  }

  getAll(signal?: AbortSignal) {
    return this.api.get<Wallet[]>('/wallets', { signal })
  }

  create(input: WalletInput) {
    return this.api.post<Wallet>('/wallets', input)
  }

  update(id: string, input: WalletInput) {
    return this.api.patch<Wallet>(`/wallets/${id}`, input)
  }

  connect(id: string, network: Network) {
    return this.api.post<WalletConnection>(`/wallets/${id}/connect`, { network })
  }
}

export const walletService = new WalletService(api)
