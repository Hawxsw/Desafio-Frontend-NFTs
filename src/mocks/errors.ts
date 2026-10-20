import { HttpResponse } from 'msw'
import type { ApiError, ApiErrorCode } from '@/types/error'

export function apiError(
  status: number,
  code: ApiErrorCode,
  message: string,
  extra?: Pick<ApiError, 'fieldErrors' | 'details'>,
) {
  return HttpResponse.json<ApiError>({ code, message, ...extra }, { status })
}
