import axios from 'axios'
import { getCartId } from '@/utils/cart-id.helper'
import { clearSessionToken, getSessionToken } from '@/utils/session-token.helper'

export const CART_ID_HEADER = 'X-Cart-Id'
export const REQUEST_TIMEOUT_MS = 10_000

type SessionExpiredHandler = () => void

let sessionExpiredHandler: SessionExpiredHandler | null = null

export function setSessionExpiredHandler(handler: SessionExpiredHandler | null) {
  sessionExpiredHandler = handler
}

export const api = axios.create({
  baseURL: '/api',
  timeout: REQUEST_TIMEOUT_MS,
  paramsSerializer: { indexes: null },
})

api.interceptors.request.use((config) => {
  const token = getSessionToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  config.headers[CART_ID_HEADER] = getCartId()
  return config
})

api.interceptors.response.use(undefined, (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 401 && error.config?.headers.Authorization) {
    if (error.config.headers.Authorization === `Bearer ${getSessionToken()}`) {
      clearSessionToken()
      sessionExpiredHandler?.()
    }
  }
  return Promise.reject(error)
})
