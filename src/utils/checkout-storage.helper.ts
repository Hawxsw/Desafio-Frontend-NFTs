import type { CreateOrderInput } from '@/types/order'

const DRAFT_PREFIX = 'kurio:checkout-draft:'
const ATTEMPT_PREFIX = 'kurio:checkout-attempt:'

export interface CheckoutAttempt {
  idempotencyKey: string
  input: CreateOrderInput
}

function read<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function write(key: string, value: unknown) {
  try {
    if (value === null) sessionStorage.removeItem(key)
    else sessionStorage.setItem(key, JSON.stringify(value))
  } catch {
    return
  }
}

export function readCheckoutDraft<T>(userId: string): T | null {
  return read<T>(`${DRAFT_PREFIX}${userId}`)
}

export function saveCheckoutDraft(userId: string, draft: unknown) {
  write(`${DRAFT_PREFIX}${userId}`, draft)
}

export function readCheckoutAttempt(userId: string): CheckoutAttempt | null {
  return read<CheckoutAttempt>(`${ATTEMPT_PREFIX}${userId}`)
}

export function saveCheckoutAttempt(userId: string, attempt: CheckoutAttempt | null) {
  write(`${ATTEMPT_PREFIX}${userId}`, attempt)
}

export function sameOrderInput(a: CreateOrderInput, b: CreateOrderInput) {
  return JSON.stringify(a) === JSON.stringify(b)
}
