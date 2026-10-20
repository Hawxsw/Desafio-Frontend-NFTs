import { isAxiosError } from 'axios'
import type { ApiError } from '@/types/error'

const FALLBACK_MESSAGE = 'Não foi possível concluir. Tente novamente.'

export function getErrorMessage(error: unknown): string {
  if (isAxiosError<ApiError>(error)) return error.response?.data?.message ?? FALLBACK_MESSAGE
  return FALLBACK_MESSAGE
}

export function getFieldErrors(error: unknown): Record<string, string> {
  if (isAxiosError<ApiError>(error) && error.response?.status === 422) return error.response.data.fieldErrors ?? {}
  return {}
}
