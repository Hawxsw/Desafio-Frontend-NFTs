import axios from 'axios'
import { clearSessionToken, getSessionToken } from '@/utils/session-token.helper'

export const api = axios.create({
  baseURL: '/api',
  paramsSerializer: { indexes: null },
})

api.interceptors.request.use((config) => {
  const token = getSessionToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(undefined, (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 401) clearSessionToken()
  return Promise.reject(error)
})
