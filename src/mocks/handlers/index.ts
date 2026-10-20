import type { AnyHandler } from 'msw'
import { realtimeHandlers } from '@/mocks/realtime'
import { authHandlers } from './auth.handlers'
import { cartHandlers } from './cart.handlers'
import { favoriteHandlers } from './favorite.handlers'
import { nftHandlers } from './nft.handlers'
import { orderHandlers } from './order.handlers'
import { userHandlers } from './user.handlers'
import { walletHandlers } from './wallet.handlers'

export const handlers: AnyHandler[] = [
  ...nftHandlers,
  ...cartHandlers,
  ...authHandlers,
  ...userHandlers,
  ...walletHandlers,
  ...orderHandlers,
  ...favoriteHandlers,
  ...realtimeHandlers,
]
