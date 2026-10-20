import { useCanGoBack, useNavigate, useRouter, useSearch } from '@tanstack/react-router'
import { X } from 'lucide-react'
import { Dialog } from 'radix-ui'
import { Home } from '@/pages/public/Home'
import { SignInForm } from './components/sign-in-form'

export function SignIn() {
  const { redirect } = useSearch({ from: '/login' })
  const navigate = useNavigate()
  const router = useRouter()
  const canGoBack = useCanGoBack()

  function handleClose() {
    if (canGoBack) router.history.back()
    else navigate({ to: '/' })
  }

  function handleSuccess() {
    router.history.replace(redirect ?? '/')
  }

  return (
    <>
      <div aria-hidden className="hidden lg:block">
        <Home />
      </div>

      <Dialog.Root open onOpenChange={(open) => !open && handleClose()}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/70 backdrop-blur-[2px]" />
          <Dialog.Content className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-ink px-7 pt-[100px] pb-8 lg:inset-auto lg:top-1/2 lg:left-1/2 lg:h-[600px] lg:w-[500px] lg:-translate-x-1/2 lg:-translate-y-1/2 lg:overflow-hidden lg:bg-surface-card lg:p-0 lg:pt-12 lg:pb-[10px] lg:after:absolute lg:after:inset-x-0 lg:after:bottom-0 lg:after:h-[10px] lg:after:bg-primary">
            <Dialog.Close
              aria-label="Fechar"
              className="absolute top-5 right-5 hidden size-8 items-center justify-center text-primary hover:text-text-accent lg:flex"
            >
              <X className="size-[18px]" />
            </Dialog.Close>

            <div className="flex flex-col items-center gap-10 lg:gap-10">
              <p className="text-[32px] leading-none font-bold tracking-[0.2em] lg:hidden">KURIO</p>
              <Dialog.Title className="flex items-center gap-1.5 text-xl leading-4 font-medium">
                <span className="text-text-primary lg:text-text-accent">Entrar</span>
                <span aria-hidden className="hidden h-5 w-px bg-primary lg:block" />
                <span aria-disabled="true" title="Disponível em breve" className="hidden lg:inline">
                  Criar conta
                </span>
              </Dialog.Title>
              <Dialog.Description className="hidden max-w-[404px] text-center text-[13px] leading-4 lg:block">
                Entre para gerenciar sua carteira, coleção e perfil de criador.
              </Dialog.Description>
            </div>

            <SignInForm onSuccess={handleSuccess} />

            <p className="mt-auto pt-10 text-center text-[13px] leading-4 text-text-secondary lg:hidden">
              Novo na Kurio?{' '}
              <span aria-disabled="true" title="Disponível em breve" className="text-text-accent">
                Crie uma conta
              </span>
            </p>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
