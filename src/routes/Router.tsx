import { createRootRoute, createRoute, createRouter, lazyRouteComponent, redirect } from '@tanstack/react-router'
import { Home } from '@/pages/public/Home'
import { getSessionToken } from '@/utils/session-token.helper'
import { RootLayout } from './layouts/RootLayout'
import { NotFound } from './NotFound'

const rootRoute = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
})

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
})

const nftDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'nft/$nftId',
  component: lazyRouteComponent(() => import('@/pages/public/nft-detail/NftDetail'), 'NftDetail'),
})

const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'carrinho',
  component: lazyRouteComponent(() => import('@/pages/public/cart/Cart'), 'Cart'),
})

function validateAuthSearch(search: Record<string, unknown>): { redirect?: string } {
  return typeof search.redirect === 'string' && search.redirect.startsWith('/') ? { redirect: search.redirect } : {}
}

const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'login',
  validateSearch: validateAuthSearch,
  component: lazyRouteComponent(() => import('@/pages/public/auth/SignIn'), 'SignIn'),
})

const signUpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'cadastro',
  validateSearch: validateAuthSearch,
  component: lazyRouteComponent(() => import('@/pages/public/auth/SignUp'), 'SignUp'),
})

const privateRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'private',
  beforeLoad: ({ location }) => {
    if (!getSessionToken()) throw redirect({ to: '/login', search: { redirect: location.href } })
  },
})

const favoritesRoute = createRoute({
  getParentRoute: () => privateRoute,
  path: 'favoritos',
  component: lazyRouteComponent(() => import('@/pages/private/Favorites'), 'Favorites'),
})

const accountRoute = createRoute({
  getParentRoute: () => privateRoute,
  path: 'perfil',
  component: lazyRouteComponent(() => import('@/pages/private/account/AccountLayout'), 'AccountLayout'),
})

const profileRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: '/',
  component: lazyRouteComponent(() => import('@/pages/private/account/ProfileDetails'), 'ProfileDetails'),
})

const walletsRoute = createRoute({
  getParentRoute: () => accountRoute,
  path: 'carteiras',
  component: lazyRouteComponent(() => import('@/pages/private/account/Wallets'), 'Wallets'),
})

const checkoutRoute = createRoute({
  getParentRoute: () => privateRoute,
  path: 'pagamento',
  component: lazyRouteComponent(() => import('@/pages/private/checkout/Checkout'), 'Checkout'),
})

const routeTree = rootRoute.addChildren([
  homeRoute,
  nftDetailRoute,
  cartRoute,
  signInRoute,
  signUpRoute,
  privateRoute.addChildren([
    favoritesRoute,
    accountRoute.addChildren([profileRoute, walletsRoute]),
    checkoutRoute,
  ]),
])

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
