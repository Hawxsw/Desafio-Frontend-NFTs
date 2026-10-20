import type { AxiosInstance } from 'axios'
import { api } from '@/services/api/api'
import type { ChangePasswordInput, UpdateProfileInput, User } from '@/types/user'

export class UserService {
  private readonly api: AxiosInstance

  constructor(instance: AxiosInstance) {
    this.api = instance
  }

  updateProfile(input: UpdateProfileInput) {
    return this.api.patch<User>('/me', input)
  }

  changePassword(input: ChangePasswordInput) {
    return this.api.post<void>('/me/password', input)
  }
}

export const userService = new UserService(api)
