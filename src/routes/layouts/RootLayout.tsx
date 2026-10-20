import { Outlet } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { Footer } from '@/components/shared/footer'
import { Header } from '@/components/shared/header'
import { MobileBottomNav } from '@/components/shared/mobile-bottom-nav'
import { useFullScreenMobile } from '@/hooks/useFullScreenMobile'
import { cn } from '@/utils/shadcn.helper'

const ScenarioSelector =
  import.meta.env.VITE_ENABLE_MSW === 'true'
    ? lazy(() => import('@/components/shared/scenario-selector'))
    : null

export function RootLayout() {
  const fullScreenMobile = useFullScreenMobile()

  return (
    <div className={cn('flex min-h-svh flex-col md:pb-0', !fullScreenMobile && 'pb-[126px]')}>
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Pular para o conteúdo
      </a>
      <Header />
      <main id="conteudo" tabIndex={-1} className={cn('flex flex-1 flex-col md:pt-0', !fullScreenMobile && 'pt-10')}>
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  )
}
