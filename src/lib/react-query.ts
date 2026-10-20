import { QueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'

const MAX_RETRIES = 2

export function shouldRetry(failureCount: number, error: unknown) {
  if (failureCount >= MAX_RETRIES) return false
  if (!isAxiosError(error)) return false
  const status = error.response?.status
  return status === undefined || status >= 500
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: shouldRetry,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 4000),
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: false,
    },
  },
})
