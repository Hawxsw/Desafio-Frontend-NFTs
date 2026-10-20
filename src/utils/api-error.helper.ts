import { isAxiosError } from 'axios'
import type { ApiError } from '@/types/error'

const FALLBACK_MESSAGE = 'Não foi possível concluir. Tente novamente.'

export function getErrorMessage(error: unknown): string {
  if (isAxiosError<ApiError>(error)) {
    if (error.code === 'ECONNABORTED') return 'O servidor demorou para responder. Tente novamente.'
    if (!error.response) return 'Sem conexão com o servidor. Verifique sua internet e tente novamente.'
    return error.response.data?.message ?? FALLBACK_MESSAGE
  }
  return FALLBACK_MESSAGE
}

export function getFieldErrors(error: unknown): Record<string, string> {
  if (isAxiosError<ApiError>(error) && (error.response?.status === 422 || error.response?.status === 409)) {
    return error.response.data.fieldErrors ?? {}
  }
  return {}
}

export function getErrorCode(error: unknown): ApiError['code'] | null {
  return isAxiosError<ApiError>(error) ? (error.response?.data?.code ?? null) : null
}

export function isNetworkFailure(error: unknown): boolean {
  return isAxiosError(error) && !error.response
}
