import type { AxiosInstance } from 'axios'
import { api } from '@/services/api/api'
import type { Wallet, WalletInput } from '@/types/wallet'

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
}

export const walletService = new WalletService(api)
