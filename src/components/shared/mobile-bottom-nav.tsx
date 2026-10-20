import { Link } from '@tanstack/react-router'
import { Heart, House, ScanLine, ShoppingCart, User } from 'lucide-react'
import { useFullScreenMobile } from '@/hooks/useFullScreenMobile'

const ITEM_CLASS =
  'absolute top-[59px] flex size-11 -translate-x-1/2 items-center justify-center text-text-secondary transition-colors hover:text-text-accent data-[status=active]:text-text-accent'

export function MobileBottomNav() {
  const fullScreenMobile = useFullScreenMobile()

  if (fullScreenMobile) return null

  return (
    <nav aria-label="Navegação inferior" className="fixed inset-x-0 bottom-0 z-40 md:hidden">
      <div className="relative mx-auto h-[126px] max-w-[414px]">
        <div className="absolute inset-x-0 top-[31px] bottom-0 flex drop-shadow-[0_-10px_30px_rgba(10,6,4,0.45)]">
          <div className="-mr-px flex-1 rounded-tl-[28px] bg-surface-card" />
          <svg aria-hidden viewBox="0 0 120 95" className="h-full w-[120px] shrink-0 fill-surface-card">
            <path d="M0 0H9C15 0 18 3 20 8A41 41 0 0 0 100 8C102 3 105 0 111 0H120V95H0Z" />
          </svg>
          <div className="-ml-px flex-1 rounded-tr-[28px] bg-surface-card" />
        </div>
        <Link to="/" aria-label="Início" activeOptions={{ exact: true }} className={`${ITEM_CLASS} left-[11.11%]`}>
          <House fill="currentColor" className="size-5" />
        </Link>
        <Link to="/favoritos" aria-label="Favoritos" className={`${ITEM_CLASS} left-[28.5%]`}>
          <Heart fill="currentColor" className="size-5" />
        </Link>
        <Link to="/carrinho" aria-label="Carrinho" className={`${ITEM_CLASS} left-[72.95%]`}>
          <ShoppingCart className="size-5" />
        </Link>
        <Link to="/perfil" aria-label="Perfil" className={`${ITEM_CLASS} left-[87.92%]`}>
          <User fill="currentColor" className="size-5" />
        </Link>
        <button
          type="button"
          aria-disabled="true"
          aria-label="Escanear (indisponível)"
          title="Disponível em breve"
          className="absolute top-0 left-1/2 flex size-[65px] -translate-x-1/2 cursor-default items-center justify-center rounded-full bg-linear-to-b from-primary/40 to-primary text-text-primary"
        >
          <ScanLine className="h-6 w-[27px]" />
        </button>
      </div>
    </nav>
  )
}
