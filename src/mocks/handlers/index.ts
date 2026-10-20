import type { RequestHandler } from 'msw'
import { authHandlers } from './auth.handlers'
import { cartHandlers } from './cart.handlers'
import { nftHandlers } from './nft.handlers'
import { orderHandlers } from './order.handlers'
import { userHandlers } from './user.handlers'
import { walletHandlers } from './wallet.handlers'

export const handlers: RequestHandler[] = [
  ...nftHandlers,
  ...cartHandlers,
  ...authHandlers,
  ...userHandlers,
  ...walletHandlers,
  ...orderHandlers,
]
