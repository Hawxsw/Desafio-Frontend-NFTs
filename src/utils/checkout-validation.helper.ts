import { isValidEmail, isValidUsername } from '@/utils/validation.helper'

export interface CheckoutFields {
  name: string
  username: string
  profileName: string
  referralCode: string
  email: string
  secondaryWallet: string
  note: string
}

export type CheckoutErrors = Partial<Record<keyof CheckoutFields | 'wallet' | 'network', string>>

export function validateCheckoutFields(fields: CheckoutFields, includeProfile: boolean): CheckoutErrors {
  const errors: CheckoutErrors = {}
  if (fields.name.trim().length < 2) errors.name = 'Informe seu nome de exibição.'
  if (!isValidEmail(fields.email)) errors.email = 'Informe um e-mail válido.'
  if (!includeProfile) return errors
  if (!isValidUsername(fields.username)) errors.username = 'Use de 3 a 20 letras, números, ponto ou sublinhado.'
  if (!fields.profileName.trim()) errors.profileName = 'Informe o nome do perfil.'
  if (!fields.referralCode.trim()) errors.referralCode = 'Informe o código de indicação.'
  return errors
}
