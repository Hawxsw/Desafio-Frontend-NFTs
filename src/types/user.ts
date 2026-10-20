export interface User {
  id: string
  name: string
  username: string
  email: string
  phone: string
  ensName: string | null
  referralCode: string | null
  avatarUrl?: string | null
  createdAt: string
  updatedAt: string
}

export interface Session {
  token: string
  user: User
  expiresAt: string
}

export interface UpdateProfileInput {
  name: string
  username: string
  email: string
  ensName: string | null
  referralCode: string | null
}

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}

export interface RegisterInput {
  username: string
  email: string
  password: string
}
