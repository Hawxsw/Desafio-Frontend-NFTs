import type { AxiosInstance } from 'axios'
import { api } from '@/services/api/api'
import type { CreateOrderInput, Order } from '@/types/order'

export class OrderService {
  private readonly api: AxiosInstance

  constructor(instance: AxiosInstance) {
    this.api = instance
  }

  create(input: CreateOrderInput, idempotencyKey: string) {
    return this.api.post<Order>('/orders', input, { headers: { 'Idempotency-Key': idempotencyKey } })
  }

  get(id: string, signal?: AbortSignal) {
    return this.api.get<Order>(`/orders/${id}`, { signal })
  }
}

export const orderService = new OrderService(api)
