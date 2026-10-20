import type { AxiosInstance } from 'axios'
import { api } from '@/services/api/api'
import type { Quote } from '@/types/quote'

export interface AddCartItemInput {
  nftId: string
  editionId: string
  quantity: number
}

export interface UpdateCartItemInput {
  editionId: string
  quantity: number
}

export class CartService {
  private readonly api: AxiosInstance

  constructor(instance: AxiosInstance) {
    this.api = instance
  }

  get(signal?: AbortSignal) {
    return this.api.get<Quote>('/cart', { signal })
  }

  addItem(input: AddCartItemInput) {
    return this.api.post<Quote>('/cart/items', input)
  }

  updateItem({ editionId, quantity }: UpdateCartItemInput) {
    return this.api.patch<Quote>(`/cart/items/${editionId}`, { quantity })
  }

  removeItem(editionId: string) {
    return this.api.delete<Quote>(`/cart/items/${editionId}`)
  }

  applyCoupon(code: string) {
    return this.api.put<Quote>('/cart/coupon', { code })
  }
}

export const cartService = new CartService(api)
