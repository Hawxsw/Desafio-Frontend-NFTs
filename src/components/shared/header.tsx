import { Link } from '@tanstack/react-router'
import { LogIn, Search, ShoppingCart, User } from 'lucide-react'
import { Button } from '@/components/shadcn/ui/button'
import { MAIN_NAV } from '@/constants/navigation'
import { useSessionQuery } from '@/hooks/useAuth'
import { NavItem } from './nav-item'
import { Logo } from './logo'
import { Container } from './container'

interface HeaderProps {
  cartCount?: number
}

export function Header({ cartCount = 0 }: HeaderProps) {
  const { data: user } = useSessionQuery()

  return (
    <header className="sticky top-0 z-40 hidden bg-background md:block md:pt-6">
      <Container>
        <div className="flex h-16 items-center justify-between gap-6 border-b border-primary/30 md:h-[45px] md:items-start">
          <Logo />

          <nav aria-label="Principal" className="hidden self-stretch md:block">
            <ul className="flex h-full items-center gap-11">
              {MAIN_NAV.map((item) => (
                <li key={item.label} className="h-full">
                  <NavItem
                    item={item}
                    className="relative flex h-full items-start pt-0.5 text-base leading-4 text-text-primary transition-colors hover:text-text-accent data-[status=active]:font-bold data-[status=active]:text-text-accent data-[status=active]:after:absolute data-[status=active]:after:inset-x-0 data-[status=active]:after:bottom-0 data-[status=active]:after:h-[3px] data-[status=active]:after:rounded-t-full data-[status=active]:after:bg-primary"
                  />
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-5 md:h-[34px] md:gap-7">
            <Link
              to="/"
              hash="catalogo"
              aria-label="Buscar NFTs"
              className="hidden text-text-primary transition-colors hover:text-text-accent md:inline-flex"
            >
              <Search className="size-5" />
            </Link>

            <Link
              to="/carrinho"
              aria-label={cartCount > 0 ? `Carrinho, ${cartCount} itens` : 'Carrinho'}
              className="relative inline-flex text-text-primary transition-colors hover:text-text-accent"
            >
              <ShoppingCart className="size-5" />
              {cartCount > 0 && (
                <span
                  aria-hidden
                  className="absolute -top-1.5 -right-2 flex size-4 items-center justify-center rounded-full bg-primary text-tiny font-bold text-primary-foreground"
                >
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <Button
                asChild
                className="hidden h-9 gap-1.5 rounded-md px-3 text-base font-normal text-primary-foreground md:inline-flex"
              >
                <Link to="/perfil">
                  <User className="size-5" />
                  {user.name.split(' ')[0]}
                </Link>
              </Button>
            ) : (
              <Button
                asChild
                className="hidden h-9 gap-1.5 rounded-md px-3 text-base font-normal text-primary-foreground md:inline-flex"
              >
                <Link to="/login">
                  <LogIn className="size-5" />
                  Entrar
                </Link>
              </Button>
            )}

          </div>
        </div>
      </Container>
    </header>
  )
}
