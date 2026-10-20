import { Link } from '@tanstack/react-router'

export function NftBreadcrumb() {
  return (
    <nav aria-label="Trilha de navegação" className="hidden text-body leading-4 font-bold lg:block">
      <ol className="flex items-center gap-[1ch]">
        <li>
          <Link to="/" className="hover:text-text-accent">
            Início
          </Link>
        </li>
        <li aria-hidden>/</li>
        <li>
          <Link to="/" hash="catalogo" className="hover:text-text-accent">
            Mercado
          </Link>
        </li>
      </ol>
    </nav>
  )
}
