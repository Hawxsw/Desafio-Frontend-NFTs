import type { Coupon } from '@/types/quote'

export const SEED_COUPONS: Coupon[] = [
  { code: 'KURIO10', discountBps: 1000, expiresAt: '2099-12-31T23:59:59.000Z' },
  { code: 'GREEN25', discountBps: 2500, expiresAt: '2099-12-31T23:59:59.000Z' },
  { code: 'EXPIRADO', discountBps: 1500, expiresAt: '2025-01-01T00:00:00.000Z' },
]
