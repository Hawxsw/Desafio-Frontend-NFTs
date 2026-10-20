import { useQueryClient } from '@tanstack/react-query'
import { Outlet, useRouter } from '@tanstack/react-router'
import { lazy, Suspense, useEffect } from 'react'
import { Footer } from '@/components/shared/footer'
import { Header } from '@/components/shared/header'
import { LiveAnnouncer } from '@/components/shared/live-announcer'
import { MobileBottomNav } from '@/components/shared/mobile-bottom-nav'
import { authKeys, clearPrivateData } from '@/hooks/useAuth'
import { useCartCount } from '@/hooks/useCart'
import { useFullScreenMobile } from '@/hooks/useFullScreenMobile'
import { useRealtimeSync } from '@/hooks/useRealtime'
import { announce } from '@/lib/announcer'
import { setSessionExpiredHandler } from '@/services/api/api'
import { cn } from '@/utils/shadcn.helper'

const ScenarioSelector =
  import.meta.env.VITE_ENABLE_MSW === 'true'
    ? lazy(() => import('@/components/shared/scenario-selector'))
    : null

const PRIVATE_PATH = /^\/(perfil|favoritos|pagamento|pedido)/

function useSessionExpiration() {
  const queryClient = useQueryClient()
  const router = useRouter()

  useEffect(() => {
    setSessionExpiredHandler(() => {
      clearPrivateData(queryClient)
      queryClient.setQueryData(authKeys.me(), null)
      announce('Sua sessão expirou. Entre novamente para continuar.', 'assertive')
      const { location } = router.state
      if (PRIVATE_PATH.test(location.pathname)) {
        router.navigate({ to: '/login', search: { redirect: location.href }, replace: true })
      }
    })
    return () => setSessionExpiredHandler(null)
  }, [queryClient, router])
}

export function RootLayout() {
  const fullScreenMobile = useFullScreenMobile()
  const cartCount = useCartCount()
  useRealtimeSync()
  useSessionExpiration()

  return (
    <div className={cn('flex min-h-svh flex-col md:pb-0', !fullScreenMobile && 'pb-[126px]')}>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Pular para o conteúdo
      </a>
      <Header cartCount={cartCount} />
      <main id="conteudo" tabIndex={-1} className={cn('flex flex-1 flex-col md:pt-0', !fullScreenMobile && 'pt-10')}>
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
      <LiveAnnouncer />
      {ScenarioSelector && (
        <Suspense fallback={null}>
          <ScenarioSelector />
        </Suspense>
      )}
    </div>
  )
}
