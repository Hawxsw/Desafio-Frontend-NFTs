import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn/ui/select'
import { SORT_LABELS } from '@/constants/catalog'
import type { NftSort } from '@/types/nft'
import { cn } from '@/utils/shadcn.helper'

interface CatalogSortSelectProps {
  value: NftSort
  onValueChange: (value: NftSort) => void
  className?: string
}

export function CatalogSortSelect({ value, onValueChange, className }: CatalogSortSelectProps) {
  return (
    <Select value={value} onValueChange={(next) => onValueChange(next as NftSort)}>
      <SelectTrigger
        aria-label="Ordenar por"
        className={cn(
          'h-auto w-auto gap-2 border-0 bg-transparent p-0 text-body leading-5 text-text-primary shadow-none dark:bg-transparent',
          className,
        )}
      >
        <span>Ordenar por:</span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(SORT_LABELS).map(([option, label]) => (
          <SelectItem key={option} value={option}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
