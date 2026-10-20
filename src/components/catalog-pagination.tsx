import { ChevronRight } from 'lucide-react'
import { cn } from '@/utils/shadcn.helper'

interface CatalogPaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function CatalogPagination({ page, totalPages, onPageChange }: CatalogPaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)
  const itemClass = 'flex size-[35px] items-center justify-center rounded-sm text-body font-medium transition-colors'

  return (
    <nav aria-label="Paginação" className="flex justify-end">
      <ul className="flex gap-2">
        {pages.map((item) => (
          <li key={item}>
            <button
              type="button"
              aria-current={item === page ? 'page' : undefined}
              onClick={() => onPageChange(item)}
              className={cn(
                itemClass,
                item === page
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-surface-card text-text-primary hover:bg-surface-dark',
              )}
            >
              {item}
            </button>
          </li>
        ))}
        <li>
          <button
            type="button"
            aria-label="Próxima página"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className={cn(itemClass, 'bg-surface-card text-text-primary hover:bg-surface-dark disabled:opacity-40')}
          >
            <ChevronRight aria-hidden className="size-4" />
          </button>
        </li>
      </ul>
    </nav>
  )
}
