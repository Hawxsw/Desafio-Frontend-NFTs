export type ApiErrorCode =
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT' 
  | 'AVAILABILITY_CONFLICT'
  | 'PRICE_CHANGED'
  | 'COUPON_INVALID'
  | 'COUPON_EXPIRED' 
  | 'IDEMPOTENCY_CONFLICT'
  | 'SERVICE_UNAVAILABLE'
  | 'INTERNAL_ERROR'

export interface ApiError {
  code: ApiErrorCode
  message: string
  fieldErrors?: Record<string, string>
  details?: Record<string, unknown>
}
