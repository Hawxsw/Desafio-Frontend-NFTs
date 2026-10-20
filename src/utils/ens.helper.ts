export const ENS_SUFFIX = '.eth'

export function stripEnsSuffix(value: string | null) {
  return value?.endsWith(ENS_SUFFIX) ? value.slice(0, -ENS_SUFFIX.length) : (value ?? '')
}

export function withEnsSuffix(value: string) {
  const name = value.trim()
  return name ? `${name}${ENS_SUFFIX}` : null
}
