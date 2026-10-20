export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const USERNAME_PATTERN = /^[a-z0-9_.]{3,20}$/i
export const WALLET_ADDRESS_PATTERN = /^0x[a-fA-F0-9]{40}$/
export const MIN_PASSWORD_LENGTH = 8

export function isValidEmail(value: string) {
  return EMAIL_PATTERN.test(value.trim())
}

export function isValidUsername(value: string) {
  return USERNAME_PATTERN.test(value.trim())
}

export function isValidWalletAddress(value: string) {
  return WALLET_ADDRESS_PATTERN.test(value.trim())
}
