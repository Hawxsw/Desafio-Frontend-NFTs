import { useRouterState } from '@tanstack/react-router'

const FULL_SCREEN_MOBILE = /^\/(nft\/|carrinho|pagamento)/

export function useFullScreenMobile() {
  return useRouterState({ select: (state) => FULL_SCREEN_MOBILE.test(state.location.pathname) })
}
