import { Link, useCanGoBack, useNavigate, useRouter } from '@tanstack/react-router'
import { X } from 'lucide-react'
import { Dialog } from 'radix-ui'
import type { ReactNode } from 'react'
import { Home } from '@/pages/public/Home'
import { cn } from '@/utils/shadcn.helper'

type AuthMode = 'sign-in' | 'sign-up'

const COPY: Record<AuthMode, { mobileTitle: string; description: string }> = {
  'sign-in': {
    mobileTitle: 'Entrar',
    description: 'Entre para gerenciar sua carteira, coleção e perfil de criador.',
  },
  'sign-up': {
    mobileTitle: 'Criar perfil de colecionador',
    description: 'Crie seu perfil de colecionador e conecte uma carteira quando quiser.',
  },
}

const TAB_CLASS = 'transition-colors hover:text-text-accent aria-[current=page]:text-text-accent'

interface AuthDialogProps {
  mode: AuthMode
  redirect?: string
  children: ReactNode
}

export function AuthDialog({ mode, redirect, children }: AuthDialogProps) {
  const router = useRouter()
  const navigate = useNavigate()
  const canGoBack = useCanGoBack()
  const copy = COPY[mode]

  function handleClose() {
    if (canGoBack) router.history.back()
    else navigate({ to: '/' })
  }

  return (
    <>
      <div aria-hidden className="hidden lg:block">
        <Home />
      </div>

      <Dialog.Root open onOpenChange={(open) => !open && handleClose()}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/70 backdrop-blur-[2px]" />
          <Dialog.Content
            className={cn(
              'fixed inset-0 z-50 flex flex-col gap-10 overflow-y-auto bg-ink px-7 pt-20 pb-6',
              'lg:inset-auto lg:top-1/2 lg:left-1/2 lg:w-[500px] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:gap-0 lg:overflow-hidden lg:rounded-lg lg:bg-surface-card lg:p-0 lg:pt-12 lg:pb-[10px]',
              'lg:after:absolute lg:after:inset-x-0 lg:after:bottom-0 lg:after:h-[10px] lg:after:bg-primary',
              mode === 'sign-in' ? 'lg:h-[600px]' : 'lg:h-[656px]',
            )}
          >
            <Dialog.Close
              aria-label="Fechar"
              className="absolute top-5 right-5 hidden size-8 items-center justify-center text-primary hover:text-text-accent lg:flex"
            >
              <X className="size-[18px]" />
            </Dialog.Close>

            <div className="flex flex-col items-center gap-10">
              <p className="text-[32px] leading-none font-bold tracking-[0.2em] lg:hidden">KURIO</p>
              <Dialog.Title className="text-center text-xl leading-4 font-medium lg:hidden">{copy.mobileTitle}</Dialog.Title>
              <nav aria-label="Acesso à conta" className="hidden items-center gap-1.5 text-xl leading-4 font-medium lg:flex">
                <Link to="/login" search={{ redirect }} aria-current={mode === 'sign-in' ? 'page' : undefined} className={TAB_CLASS}>
                  Entrar
                </Link>
                <span aria-hidden className="h-5 w-px bg-primary" />
                <Link
                  to="/cadastro"
                  search={{ redirect }}
                  aria-current={mode === 'sign-up' ? 'page' : undefined}
                  className={TAB_CLASS}
                >
                  Criar conta
                </Link>
              </nav>
              <Dialog.Description className="hidden max-w-[404px] text-center text-[13px] leading-4 lg:block">
                {copy.description}
              </Dialog.Description>
            </div>

            {children}

            <p className="mt-auto text-center text-[13px] leading-4 text-text-secondary lg:hidden">
              {mode === 'sign-in' ? (
                <>
                  Novo na Kurio?{' '}
                  <Link to="/cadastro" search={{ redirect }} className="text-text-accent hover:underline">
                    Crie uma conta
                  </Link>
                </>
              ) : (
                <>
                  Já tem uma conta?{' '}
                  <Link to="/login" search={{ redirect }} className="text-text-accent hover:underline">
                    Entre
                  </Link>
                </>
              )}
            </p>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
