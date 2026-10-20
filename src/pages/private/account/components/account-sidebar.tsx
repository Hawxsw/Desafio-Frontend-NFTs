import { Link, useNavigate } from '@tanstack/react-router'
import { Download, Heart, LogOut, MapPin, ShoppingCart, TrendingUp, TriangleAlert, User, type LucideIcon } from 'lucide-react'
import { useLogoutMutation } from '@/hooks/useAuth'

const ITEM_CLASS =
  'flex h-[45px] items-center gap-3 border-l-[6px] border-transparent px-3 text-body text-text-accent transition-colors hover:bg-surface-raised data-[status=active]:border-primary'

const UPCOMING: { label: string; icon: LucideIcon }[] = [
  { label: 'Atividade', icon: ShoppingCart },
  { label: 'Ofertas', icon: TrendingUp },
  { label: 'Arquivos baixados', icon: Download },
  { label: 'Suporte', icon: TriangleAlert },
]

export function AccountSidebar() {
  const navigate = useNavigate()
  const logout = useLogoutMutation()

  function handleLogout() {
    logout.mutate(undefined, { onSettled: () => navigate({ to: '/' }) })
  }

  return (
    <aside aria-labelledby="account-menu-title" className="flex shrink-0 flex-col bg-surface-card py-2 lg:w-[310px]">
      <h2 id="account-menu-title" className="p-2.5 text-lg leading-4 font-bold">
        Meu perfil
      </h2>
      <nav aria-label="Menu da conta">
        <ul className="flex flex-col">
          <li>
            <Link to="/perfil" activeOptions={{ exact: true }} className={ITEM_CLASS}>
              <User aria-hidden className="size-5" />
              Dados do perfil
            </Link>
          </li>
          <li>
            <Link to="/perfil/carteiras" className={ITEM_CLASS}>
              <MapPin aria-hidden className="size-5" />
              Carteiras
            </Link>
          </li>
          <li>
            <Link to="/favoritos" className={ITEM_CLASS}>
              <Heart aria-hidden className="size-5" />
              Lista de interesse
            </Link>
          </li>
          {UPCOMING.map(({ label, icon: Icon }) => (
            <li key={label}>
              <span aria-disabled="true" title="Disponível em breve" className={`${ITEM_CLASS} cursor-not-allowed opacity-70 hover:bg-transparent`}>
                <Icon aria-hidden className="size-5" />
                {label}
              </span>
            </li>
          ))}
        </ul>
      </nav>
      <button
        type="button"
        onClick={handleLogout}
        disabled={logout.isPending}
        className="mt-1 flex h-10 items-center gap-2 border-t border-surface-border px-[18px] text-body leading-none font-bold text-text-accent hover:bg-surface-raised disabled:opacity-60"
      >
        <LogOut aria-hidden className="size-5" />
        Sair
      </button>
    </aside>
  )
}
