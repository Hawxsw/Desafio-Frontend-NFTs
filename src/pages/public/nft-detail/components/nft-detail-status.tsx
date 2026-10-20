import { Link } from '@tanstack/react-router'
import { Button } from '@/components/shadcn/ui/button'
import { Container } from '@/components/shared/container'

export function NftDetailSkeleton() {
  return (
    <Container
      aria-busy="true"
      aria-label="Carregando NFT"
      className="flex animate-pulse flex-col gap-6 py-6 motion-reduce:animate-none lg:flex-row lg:gap-8"
    >
      <div className="aspect-[1/1.05] w-full rounded-3xl bg-surface-card lg:h-[440px] lg:w-[560px] lg:flex-none lg:rounded-lg" />
      <div className="flex flex-1 flex-col gap-4">
        <div className="h-7 w-2/3 rounded-sm bg-surface-card" />
        <div className="h-5 w-1/3 rounded-sm bg-surface-card" />
        <div className="h-16 w-full rounded-sm bg-surface-card" />
        <div className="h-6 w-1/2 rounded-sm bg-surface-card" />
      </div>
    </Container>
  )
}

export function NftNotFound() {
  return (
    <Container className="flex flex-col items-start gap-4 py-12">
      <h1 className="text-section font-bold">NFT não encontrado</h1>
      <p className="text-sm leading-6 text-text-secondary">Esse NFT não existe ou foi removido do catálogo.</p>
      <Button asChild className="h-10 rounded-md px-4 text-base font-bold">
        <Link to="/" hash="catalogo">
          Ver catálogo
        </Link>
      </Button>
    </Container>
  )
}

interface NftLoadErrorProps {
  onRetry: () => void
}

export function NftLoadError({ onRetry }: NftLoadErrorProps) {
  return (
    <Container role="alert" className="flex flex-col items-start gap-4 py-12">
      <h1 className="text-section font-bold">Não foi possível carregar o NFT</h1>
      <p className="text-sm leading-6 text-text-secondary">Verifique sua conexão e tente novamente.</p>
      <Button type="button" onClick={onRetry} className="h-10 rounded-md px-4 text-base font-bold">
        Tentar novamente
      </Button>
    </Container>
  )
}
