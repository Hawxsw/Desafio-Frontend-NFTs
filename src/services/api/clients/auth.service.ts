import type { AxiosInstance } from 'axios'
import { api } from '@/services/api/api'
import type { RegisterInput, Session, User } from '@/types/user'

export interface LoginInput {
  email: string
  password: string
}

export class AuthService {
  private readonly api: AxiosInstance

  constructor(instance: AxiosInstance) {
    this.api = instance
  }

  login(input: LoginInput) {
    return this.api.post<Session>('/auth/login', input)
  }

  register(input: RegisterInput) {
    return this.api.post<Session>('/auth/register', input)
  }

  me(signal?: AbortSignal) {
    return this.api.get<User>('/auth/me', { signal })
  }

  logout() {
    return this.api.post<void>('/auth/logout')
  }
}

export const authService = new AuthService(api)
