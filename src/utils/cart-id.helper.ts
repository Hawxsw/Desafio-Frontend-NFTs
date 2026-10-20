const CART_ID_KEY = 'kurio:cart-id'

export function getCartId(): string {
  try {
    const stored = localStorage.getItem(CART_ID_KEY)
    if (stored) return stored
    const created = crypto.randomUUID()
    localStorage.setItem(CART_ID_KEY, created)
    return created
  } catch {
    return 'anonymous'
  }
}
