import type { NavItemData } from '@/constants/navigation';
import { cn } from '@/utils/shadcn.helper';
import {Link} from '@tanstack/react-router';

interface NavItemProps {
    item: NavItemData
    className?: string
    onNavigate?: () => void
}

export function NavItem({ item, className, onNavigate }: NavItemProps) {
    if (!item.available) {
        return (
      <span aria-disabled="true" title="Disponível em breve" className={cn('cursor-default', className)}>
        {item.label}
        <span className="sr-only"> (indisponível)</span>
      </span>        )
    }

     return (
    <Link
      to="/"
      hash={item.hash}
      onClick={onNavigate}
      activeOptions={{ exact: true, includeHash: true }}
      className={className}
    >
      {item.label}
    </Link>
  )
}