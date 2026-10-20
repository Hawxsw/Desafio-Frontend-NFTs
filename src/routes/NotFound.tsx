import { Link } from '@tanstack/react-router'
import { Button } from '@/components/shadcn/ui/button'
import { Container } from '@/components/shared/container'

export function NotFound() {
  return (
    <Container className="flex flex-col items-start gap-4 py-12">
      <h1 className="text-section font-bold">Página não encontrada</h1>
      <p className="text-sm leading-6 text-text-secondary">O endereço acessado não existe ou foi removido.</p>
      <Button asChild className="h-10 rounded-md px-4 text-base font-bold">
        <Link to="/">Voltar ao início</Link>
      </Button>
    </Container>
  )
}
